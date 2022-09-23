<template>
  <div class="loading" v-if="visible">

  </div>
</template>

<script>
export default {
  name: 'InitialLoading',
  components: {

  },
  computed: {
    visible: function () {
      return this.$store.getters.initialLoading
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

.loading {
  position: absolute;
  top: $appHeaderHeight;
  bottom: $appFooterHeight;
  left: 0;
  right: 0;
  backdrop-filter: blur(3px);
  background-color: rgba(255,255,255,.2);
}
</style>
