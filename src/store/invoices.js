import InvoiceService from '@/services/invoice.service';
import Invoice from '@/store/models/invoice';
import { generateInvoiceNumber, pick } from '@/utils/helpers';
import dayjs from 'dayjs';
import Errors from '@/utils/errors';

function getInvoice(invoiceId) {
  return Invoice.query()
    .with(['client', 'client_fields', 'team_fields', 'rows.taxes', 'consignee'])
    .with('rows', query => query.orderBy('order', 'asc'))
    .find(invoiceId);
}
function getKey(key, isConsignee) {
  const mapKey = isConsignee ? `consignee_${key}` : `client_${key}`;
  return mapKey;
}
export default {
  namespaced: true,
  state: {
    errors: new Errors(),
    invoiceId: null,
    isCustomizationsModalOpen: false,
  },
  mutations: {
    invoiceId(state, invoiceId) {
      state.invoiceId = invoiceId;
    },
    isCustomizationsModalOpen(state, isCustomizationsModalOpen) {
      state.isCustomizationsModalOpen = isCustomizationsModalOpen;
    },
    setErrors(state, errors) {
      state.errors.set(errors);
    },
    clearErrors(state) {
      state.errors.clear();
    },
  },
  actions: {
    init({ dispatch }) {
      dispatch('getInvoices');
    },
    terminate() {
      return Invoice.deleteAll();
    },
    async getInvoices() {
      const invoices = await InvoiceService.getInvoices();
      await Invoice.create({ data: invoices });
      return invoices;
    },
    async getInvoice({ commit }, invoiceId) {
      const invoice = await InvoiceService.getInvoice(invoiceId);
      await Invoice.insert({ data: invoice });
      commit('invoiceId', invoiceId);
      return invoice;
    },
    async createNewInvoice({ dispatch }) {
      const invoice = await Invoice.createNew();
      await InvoiceService.createInvoice(invoice);
      await dispatch('prefillInvoice', {
        invoiceId: invoice.id,
      });
      await dispatch('prefillTeam', {
        invoiceId: invoice.id,
      });
      return invoice.id;
    },
    invoiceProps(store, payload) {
      return Invoice.update({
        where: payload.invoiceId,
        data: payload.props,
      });
    },
    async updateClient({ dispatch }, payload) {
      const clientProps = pick(payload.props, {
        bank_account_id: 'bank_account_id',
        client_name: 'company_name',
        client_gstin: 'company_gstin',
        client_address: 'company_address',
        client_postal_code: 'company_postal_code',
        client_country: 'company_country',
        client_county: 'company_county',
        client_city: 'company_city',
        client_email: 'invoice_email',
        currency: 'currency',
      });

      const invoice = getInvoice(payload.invoiceId);

      if (Object.keys(clientProps).length > 0 && invoice.client_id) {
        dispatch('clients/updateClient', {
          props: clientProps,
          clientId: invoice.client_id,
        }, { root: true });
      }
    },
    async updateTeam({ dispatch }, payload) {
      const teamProps = pick(payload.props, {
        late_fee: 'invoice_late_fee',
        from_name: 'company_name',
        from_gstin: 'company_gstin',
        from_address: 'company_address',
        from_postal_code: 'company_postal_code',
        from_city: 'company_city',
        from_country: 'company_country',
        from_county: 'company_county',
        from_website: 'website',
        from_email: 'contact_email',
        from_phone: 'contact_phone',
      });
      const invoice = getInvoice(payload.invoiceId);

      if ('due_at' in payload.props || 'issued_at' in payload.props) {
        teamProps.invoice_due_days = dayjs(invoice.due_at)
          .diff(invoice.issued_at, 'days');
      }

      if (Object.keys(teamProps).length > 0) {
        dispatch('teams/updateTeam', teamProps, { root: true });
      }
    },
    async updateInvoice({ dispatch, commit }, payload) {
      if (payload.props) {
        await dispatch('invoiceProps', payload);
        await dispatch('updateClient', payload);
        await dispatch('updateTeam', payload);
      }

      commit('clearErrors');
      const invoice = getInvoice(payload.invoiceId);
      return InvoiceService.updateInvoice(invoice)
        .catch(err => commit('setErrors', err.errors));
    },
    async deleteInvoice(store, invoice) {
      const res = await InvoiceService.deleteInvoice(invoice.id);
      await Invoice.delete(invoice.id);
      return res;
    },
    async bookInvoice({ getters, commit, dispatch }) {
      commit('clearErrors');

      try {
        await InvoiceService.bookInvoice(getters.invoice);
        return dispatch('getInvoice', getters.invoice.id);
      } catch (err) {
        commit('setErrors', err.errors);
      }
    },
    prefillClient({ dispatch, rootGetters }, payload) {
      const client = payload.client;
      dispatch('invoiceClientFields/removeInvoiceClientFields',
        {
          invoiceId: payload.invoiceId,
          isConsignee: payload.isConsignee,
        }, { root: true });

      client.fields.forEach((field) => {
        dispatch('invoiceClientFields/addInvoiceClientField', {
          invoiceId: payload.invoiceId,
          props: {
            is_consignee: payload.isConsignee,
            label: field.label,
            value: field.value,
            client_field_id: field.id,
          },
        }, { root: true });
      });
      const isConsignee = payload.isConsignee;
      const updateProps = {
        [getKey('id', isConsignee)]: client.id,
        [getKey('gstin', isConsignee)]: client.company_gstin,
        [getKey('name', isConsignee)]: client.company_name,
        [getKey('address', isConsignee)]: client.company_address,
        [getKey('postal_code', isConsignee)]: client.company_postal_code,
        [getKey('city', isConsignee)]: client.company_city,
        [getKey('county', isConsignee)]: client.company_county,
        [getKey('country', isConsignee)]: client.company_country,
        [getKey('email', isConsignee)]: client.invoice_email,
        bank_name: client.bank_account ? client.bank_account.bank_name : null,
        bank_account_no: client.bank_account ? client.bank_account.bank_account_no : null,
        bank_ifsc_code: client.bank_ifsc_code ? client.bank_account.bank_ifsc_code : null,
        currency: client.currency || rootGetters['teams/team'].currency || 'INR',
      };

      return dispatch('updateInvoice', {
        invoiceId: payload.invoiceId,
        props: updateProps,
      });
    },
    prefillInvoice({ dispatch, getters, rootGetters }, payload) {
      const team = rootGetters['teams/team'];

      const props = {
        issued_at: dayjs()
          .format('YYYY-MM-DD'),
        due_at: dayjs()
          .add(team.invoice_due_days || 14, 'days')
          .format('YYYY-MM-DD'),
        number: generateInvoiceNumber(getters.all),
        late_fee: team.invoice_late_fee || 0.5,
        currency: team.currency || 'INR',
      };

      return dispatch('updateInvoice', {
        invoiceId: payload.invoiceId,
        props,
      });
    },
    prefillTeam({ dispatch, rootGetters }, payload) {
      const team = rootGetters['teams/team'];
      dispatch('invoiceTeamFields/removeInvoiceTeamFields', payload.invoiceId, { root: true });

      team.fields.forEach((field) => {
        dispatch('invoiceTeamFields/addInvoiceTeamField', {
          invoiceId: payload.invoiceId,
          props: {
            label: field.label,
            value: field.value,
            team_field_id: field.id,
          },
        }, { root: true });
      });

      const props = {
        from_name: team.company_name,
        from_gstin: team.company_gstin,
        from_address: team.company_address,
        from_postal_code: team.company_postal_code,
        from_city: team.company_city,
        from_country: team.company_country,
        from_county: team.company_county,
        from_website: team.website,
        from_email: team.contact_email,
        from_phone: team.contact_phone,
      };

      return dispatch('updateInvoice', {
        invoiceId: payload.invoiceId,
        props,
      });
    },
  },
  getters: {
    invoice(state) {
      return getInvoice(state.invoiceId);
    },
    all() {
      return Invoice.query()
        .where('$isNew', false)
        .with(['client', 'rows.taxes'])
        .with('rows', query => query.orderBy('order', 'asc')) // TODO: do we need this?
        .orderBy('issued_at', 'desc')
        .orderBy('number', 'desc')
        .get();
    },
  },
};
