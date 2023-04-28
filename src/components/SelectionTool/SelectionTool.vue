<template>
  <div>
    <SelectionToolHeader/>
    <Splitpanes v-if="orientation === 'horizontal'" horizontal class="default-theme views">
      <pane v-for="(view, x) in views" :key="x" :view="view">
        <div class="view">
          <div class="content">
            <DisplayPane :perspective="view.perspective" :arr="view.arrangement" :index="x"/>
          </div>
        </div>
      </pane>
    </Splitpanes>
    <Splitpanes v-else vertical class="default-theme views">
      <pane v-for="(view, x) in views" :key="x" :view="view">
        <div class="view">
          <div class="content">
            <DisplayPane :perspective="view.perspective" :arr="view.arrangement" :index="x"/>
          </div>
        </div>
      </pane>
    </Splitpanes>
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
    },
    orientation: function () {
      return this.$store.getters.selectionToolOrientation
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

  .content {
    height: 100%;
  }
}

</style>
