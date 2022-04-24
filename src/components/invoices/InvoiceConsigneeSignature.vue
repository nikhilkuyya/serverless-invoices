<template>
  <div>
    <h4>{{heading}} {{client.company_name}}</h4>
    <p class="signature-space">
    </p>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      heading: 'For ',
    };
  },
  computed: {
    ...mapGetters({
      client: 'clients/client',
    }),
  },
};
</script>
<style lang="scss" scoped>
  .signature-space {
    padding: 2rem;
    border: 2px solid black;
    margin: 0;
  }

  h4 {
    font-size: 1rem;
    font-style: italic;
    margin: 0;
  }
</style>
