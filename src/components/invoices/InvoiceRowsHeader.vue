<template>
    <thead>
        <tr>
            <th> S.No </th>
            <th>{{ $t('item') }}</th>
            <th>Description</th>
            <th>HSN</th>
            <th>Qty</th>
            <th>{{ $t('unit') }}</th>
            <th>{{ $t('price') }}</th>
            <!-- <th v-for="tax in taxes" :key="tax.id">
                {{ tax.label }} %
            </th> -->
            <th class="text-right">{{ $t('sum') }}</th>
        </tr>
    </thead>
</template>

<script>

import { mapGetters } from 'vuex';

export default {
  i18nOptions: { namespaces: 'invoice-rows-header' },
  computed: {
    ...mapGetters({
      taxes: 'invoiceRows/taxes',
    }),
  },
};
</script>
