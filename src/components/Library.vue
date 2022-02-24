<template>
  <div id="hello">
    <splitpanes vertical style="height: 600px" class="default-theme">
      <pane>
        <Library_Work v-for="work in worklist" v-bind:id="work['@id']" v-bind:work="work"/>
      </pane>
      <pane size="30">
        <splitpanes horizontal style="height: 600px" class="default-theme">
          <pane size="8">
            <span class="title">SIDEBAR</span>
              <button v-on:click="showWorkbench" class="btn btn-sm" style="float: right">to Workbench</button>
              <button v-on:click="goHome" class="btn btn-sm" style="float: right">Home</button>
          </pane>
          <pane size="46" v-for="(view, index) in views">
            <ArrangementMetadata v-bind:perspective="view.perspective" v-bind:arr="view.arrangement" v-bind:index="index"/>
          </pane>
          <!-- <pane size="46">
            <p>PREVIEW: upper pane</p>
              <ArrangementMetadata/>
          </pane>
          <pane size="46">
            <p>PREVIEW: lower pane</p>
          </pane> -->
        </splitpanes>
      </pane>
    </splitpanes>
  </div>
</template>

<script>
import Library_Work from './Library/Library_Work.vue'
import ArrangementMetadata from './Library/ArrangementMetadata'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css';

export default {
  name: 'Library',
  components: {
    Library_Work,
    ArrangementMetadata,
    Splitpanes,
    Pane
  },
  methods: {
    showWorkbench: function () {
      this.$store.dispatch('setPerspective','workbench')
    },
    goHome: function () {
      this.$store.dispatch('setPerspective','landingPage')
    }
  },
  computed: {
    worklist: function() {
      return this.$store.getters.worklist
    },
    views: function() {
      return this.$store.getters.views
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.title {
  font-size: large;
  font-weight: bold;
}

</style>
