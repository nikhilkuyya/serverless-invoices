<template>
    <tfoot>
    <tr class="text-right">
        <td :colspan="colspan">{{ $t('subtotal') }}</td>
        <td class="currency-readable">{{ invoice.subTotal | dineroCurrency }}</td>
    </tr>
    <tr class="text-right" v-for="tax in invoice.taxes" :key="tax.label">
        <td :colspan="colspan">
            {{ tax.label }} ({{ tax.rate }}%)
        </td>
        <td class="currency-readable">{{  tax.total | dineroCurrency }}</td>
    </tr>
    <tr class="text-right">
      <td :colspan="colspan">
        {{ $t('tax_total')  }}
      </td>
      <td class="currency-readable">{{ taxTotal | dineroCurrency   }}</td>
    </tr>
    <tr class="text-right" v-if="invoice.total">
        <th :colspan="colspan" >
            {{ $t('total') }}
        </th>
        <th class="text-nowrap currency-readable">{{ invoice.total | dineroCurrency}}</th>
    </tr>
    </tfoot>
</template>
<script>
import { mapGetters } from 'vuex';
import { formatDate } from '../../filters/date.filter';
import { formatCurrency } from '../../filters/currency.filter';
import { formatCurrencyWithDinero } from '../../filters/dineroCurrency.filter';


export default {
  i18nOptions: { namespaces: 'invoice-totals' },
  props: ['invoice', 'errors'],
  components: {},
  filters: {
    date: formatDate,
    currency: formatCurrency,
    dineroCurrency: formatCurrencyWithDinero,
  },
  computed: {
    ...mapGetters({
      taxes: 'invoiceRows/taxes',
    }),
    taxTotal() {
      return Object.values(this.invoice.taxes).reduce((taxTotal, taxObject) => taxTotal + taxObject.total, 0);
    },
    colspan() {
      // return 5 + this.taxes.length;
      return 7;
    },
  },
  methods: {
    updateProp(props) {
      this.$emit('update', props);
    },
  },
};
</script>
