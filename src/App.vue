<template>
  <div class="">
    <AppHeader/>
    <template v-if="landingPageVisible">
      <LandingPage/>
    </template>
    <template v-else>
      <WorkBench/>
    </template>
    <AppFooter/>
    <LibraryModal/>
  </div>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue'
import LandingPage from '@/components/LandingPage.vue'
import WorkBench from '@/components/WorkBench.vue'
import AppFooter from '@/components/AppFooter.vue'
import LibraryModal from '@/components/SelectionTool/LibraryModal.vue'

export default {
  name: 'App',
  components: {
    AppHeader,
    LandingPage,
    WorkBench,
    AppFooter,
    LibraryModal
  },
  computed: {
    landingPageVisible: function () {
      return this.$store.getters.landingPageVisible
    }
  }
}
</script>

<style lang="scss">
@import '@/css/_variables.scss';

body {
  margin: 0;
  padding: 0;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: $mainBackgroundColor;
}
</style>
