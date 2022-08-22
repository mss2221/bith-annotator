<template>
  <span class="viewTab">
    <span class="tabLabel">Label</span>
    <i class="icon icon-cross"></i>
  </span>
</template>

<script>
export default {
  name: 'ViewTab',
  components: {
  },
  computed: {
    /* showAnnotationTool: function () {
      return this.$store.getters.annotationToolVisible
    } */
  },
  methods: {
    /* select: function () {
      this.$store.dispatch('setSelectionMode')
    } */
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

.viewTab {
  border: .5px solid $darkBackgroundColor;
  border-radius: .1rem;
  color: $darkFontColor;
  background: linear-gradient(to bottom, $mainBackgroundColor, darken($mainBackgroundColor, 15%));
  height: 1rem;
  width: 1rem;
  font-size: .8rem;
  margin: 0 .3rem 0 .6rem;
  padding: 0 .2rem 0 .3rem;
  cursor: default;

  .tabLabel {
    padding-right: .2rem;
    font-weight: 300;
  }

  &:hover {
    background: linear-gradient(to bottom, lighten($mainBackgroundColor, 10%), darken($mainBackgroundColor, 5%));
  }

  i {
    position: relative;
    top: -.1rem;
    font-size: .6rem;
    cursor: pointer;
  }
}

</style>
