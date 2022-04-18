<template>
  <div>
    <div>
      <ClientSelector
        v-if="!!client"
        :value="client.company_name"
        btn-class="font-weight-bold"
        :is-left="!isConsignee"
        @selected="clientSelected"
      />

      <ClientSelector
        v-if="!client"
        :is-left="!isConsignee"
        btn-class="font-weight-bold"
        @selected="clientSelected"
      />
      <i
        class="material-icons md-18 ml-2 pointer d-print-none"
        v-if="client"
        @click="editClient"
        >edit</i
      >
    </div>
    <div v-if="!!client">
      <div class="break-line">
        <span> GSTIN: </span>
        <AppEditable
          :value="client.company_gstin"
          :id="client.company_gstin"
          prefix=" "
          suffix=" "
          placeholder="GSTIN"
          @change="updateProp({ [this.getKey('gstin')] : $event })" />
      </div>

      <!-- <AppError :errors="errors" field="client_gstin" /> -->
      <AppEditable
        :value="client.company_address"
        suffix=""
        class="break-line"
        :placeholder="$t('client_address')"
        @change="updateProp({ [this.getKey('address')]: $event })"
      />

      <AppError :errors="errors" field="client_address" />

      <AppEditable
        :value="client.company_city"
        suffix="- "
        :placeholder="$t('client_city')"
        @change="updateProp({ [this.getKey('city')]: $event })"
      />
      <AppEditable
        :value="client.company_postal_code"
        suffix=", "
        :placeholder="$t('client_postal_code')"
        @change="updateProp({ [getKey('postal_code')]: $event })"
      />
      <AppEditable
        :value="client.company_county"
        suffix="."
        class="break-line"
        :placeholder="$t('client_county')"
        @change="updateProp({ [getKey('county')]: $event })"
      />

      <AppError :errors="errors" field="client_city" />
      <AppError :errors="errors" field="client_postal_code" />
      <AppError :errors="errors" field="client_county" />
      <AppEditable :value="invoice.client_country"
                     :placeholder="$t('client_country')"
                     class="break-line"
                     @change="updateProp({ client_country: $event })"/>
        <AppError :errors="errors" field="client_country"/>

      <InvoiceClientFields :invoice="invoice" />

      <AppEditable
        :value="client.invoice_email"
        :errors="errors"
        field="client_email"
        class="break-line"
        :placeholder="$t('client_email')"
        @change="updateProp({ [getKey('email')]: $event })"
      />
    </div>
  </div>
</template>
<script>
import AppError from '@/components/form/AppError';
import AppEditable from '@/components/form/AppEditable';
import ClientSelector from '@/components/clients/ClientSelector';
import InvoiceClientFields from '@/components/invoices/InvoiceClientFields';


export default {
  i18nOptions: { namespaces: 'invoice-client-details' },
  props: ['invoice', 'errors', 'isConsignee', 'client'],
  components: {
    AppError,
    ClientSelector,
    AppEditable,
    InvoiceClientFields,
  },
  methods: {
    getKey(key) {
      const mapKey = this.isConsignee ? `consignee_${key}` : `client_${key}`;
      return mapKey;
    },
    getValue(key) {
      const mapKey = this.isConsignee ? `consignee_${key}` : `client_${key}`;
      return this.invoice[mapKey];
    },
    editClient() {
      this.$router.push({
        query: {
          clientId:
            this.invoice[this.isConsignee ? 'consignee_id' : 'client_id'],
        },
      });
    },
    updateProp(props) {
      this.$emit('update', props);
    },
    clientSelected(client) {
      this.$store.dispatch('invoices/prefillClient', {
        isConsignee: !!this.isConsignee,
        client,
        invoiceId: this.invoice.id,
      });
    },
  },
};
</script>
