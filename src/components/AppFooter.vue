<template>
  <footer>
    2023
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
  components: {

  },
  computed: {

  },
  methods: {

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

footer {
  font-size: calc($appFooterHeight * 0.6);
  padding: 0 .3rem 0;
  height: $appFooterHeight;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to bottom, darken($mainBackgroundColor, 5%), darken($mainBackgroundColor, 20%));
}
</style>
