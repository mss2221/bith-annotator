<template>
  <div id="workbench">
    <splitpanes vertical class="default-theme">
      <pane v-if="showSelectionTool" class="firstLevelPane">
        <SelectionTool/>
      </pane>
      <pane v-if="showOverviewTool" size="30" class="firstLevelPane">
        <OverviewTool/>
      </pane>
      <pane v-if="showAnnotationTool" class="firstLevelPane">
        Pane 3
      </pane>
    </splitpanes>
  </div>
</template>

<script>
import SelectionTool from '@/components/SelectionTool/SelectionTool.vue'
import OverviewTool from '@/components/OverviewTool/OverviewTool.vue'

import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

export default {
  name: 'WorkBench',
  components: {
    SelectionTool,
    OverviewTool,
    Splitpanes,
    Pane
  },
  computed: {
    showSelectionTool: function () {
      return this.$store.getters.selectionToolVisible
    },
    showOverviewTool: function () {
      return this.$store.getters.overviewToolVisible
    },
    showAnnotationTool: function () {
      return this.$store.getters.annotationToolVisible
    }
  },
  methods: {

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

#workbench {
  position: absolute;
  top: $appHeaderHeight;
  right: 0;
  bottom: $appFooterHeight;
  left: 0;
  background: linear-gradient(to bottom, lighten($mainBackgroundColor, 5%), $mainBackgroundColor);

  .firstLevelPane {
    position: relative;
  }
}

</style>
