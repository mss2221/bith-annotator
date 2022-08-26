<template>
  <header>
    <span class="title">Views</span>
    <span class="views">
      <ViewTab v-for="(view, v) in views" v-bind:key="v" v-bind:perspective="view.perspective" v-bind:arr="view.arrangement" v-bind:index="v"/>
    </span>
    <button class="customButton" @click="openLibrary"><i class="icon icon-plus"></i></button>
  </header>
</template>

<script>
import ViewTab from '@/components/SelectionTool/ViewTab.vue'

export default {
  name: 'SelectionToolHeader',
  components: {
    ViewTab
  },
  computed: {
    views: function () {
      return this.$store.getters.views
    }
  },
  methods: {
    openLibrary: function () {
      this.$store.dispatch('toggleLibraryModal')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

header {
  height: $selectionToolHeaderHeight;
  background: linear-gradient(to bottom, lighten($darkBackgroundColor, 20%), lighten($darkBackgroundColor, 5%));
  padding: .1rem .3rem;
  color: $lightFontColor;
  font-size: .8rem;

  .customButton {
    border: .5px solid $darkBackgroundColor;
    border-radius: .1rem;
    color: $darkFontColor;
    background: linear-gradient(to bottom, $mainBackgroundColor, darken($mainBackgroundColor, 15%));
    height: 1rem;
    width: 1rem;
    font-size: .8rem;
    position: relative;
    top: .2rem;
    margin: 0 .3rem 0 .6rem;

    &:hover {
      background: linear-gradient(to bottom, lighten($mainBackgroundColor, 10%), darken($mainBackgroundColor, 5%));
      cursor: pointer;
    }

    i {
      position: relative;
      top: -.25rem;
      left: -.03rem;
      font-size: .6rem;
    }
  }
}

</style>
