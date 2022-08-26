<template>
  <div>
    <SelectionToolHeader/>
    <Splitpanes horizontal class="default-theme views">
      <pane v-for="(view, x) in views" v-bind:key="x" v-bind:view="view">
        <div class="view">
          <div class="content">
            <DisplayPane v-bind:perspective="view.perspective" v-bind:arr="view.arrangement" v-bind:index="x"/>
          </div>
        </div>
      </pane>
    </splitpanes>
  </div>
</template>

<script>
import SelectionToolHeader from '@/components/SelectionTool/SelectionToolHeader.vue'
import DisplayPane from '@/components/SelectionTool/DisplayPane.vue'

import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

export default {
  name: 'SelectionTool',
  components: {
    SelectionToolHeader,
    DisplayPane,
    Splitpanes,
    Pane
  },
  computed: {
    views: function () {
      return this.$store.getters.views
    }
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

.views {
  position: absolute;
  height: calc(100% - $selectionToolHeaderHeight);
}

.view {
  overflow: scroll;
  height: 100%;
  background-color: #ffffff;
}

</style>
