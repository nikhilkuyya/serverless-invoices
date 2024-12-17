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
    <tr class="text-right" v-if="roundedOffAmount !== 0">
      <td :colspan="colspan">
        Rounded Off
      </td>
      <td class="currency-readable">{{ roundedOffAmount | dineroCurrency   }}</td>
    </tr>
    <tr class="text-right" v-if="invoice.total">
        <th :colspan="colspan" >
            {{ $t('total') }}
        </th>
        <th class="text-nowrap currency-readable">{{ roundedTotal | dineroCurrency}}</th>
    </tr>
    </tfoot>
</template>
<script>
import { mapGetters } from 'vuex';
import { formatDate } from '../../filters/date.filter';
import { formatCurrency } from '../../filters/currency.filter';
import { formatCurrencyWithDinero } from '../../filters/dineroCurrency.filter';
import Dinero from 'dinero.js';


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
    roundedTotal() {
      return this.getValue(this.invoice.total);
    },
    roundedOffAmount() {
      const totalDinero = this.getDinero(this.invoice.total);
      const roundedDinero = this.getDinero(this.roundedTotal);
      return roundedDinero.subtract(totalDinero).toRoundedUnit(2);
    },
    colspan() {
      // return 5 + this.taxes.length;
      return 7;
    },
  },
  methods: {
    getDinero(value, factor = 10 ** 2) {
      const amount = Number.parseFloat((Number.parseFloat(value).toFixed(2) * factor).toFixed(2));
      const dineroObject = Dinero({ amount: amount, currency: 'INR' });
      return dineroObject;
    },
    getValue(newValue, factor = 10 ** 2) {
      const amount = Number.parseFloat((Number.parseFloat(newValue).toFixed(2) * factor).toFixed(2));
      const dineroObject = Dinero({ amount: amount, currency: 'INR' });
      const dineroAmount = dineroObject.toRoundedUnit(0, 'HALF_ODD');
      return dineroAmount;
    },
    updateProp(props) {
      this.$emit('update', props);
    },
  },
};
</script>
