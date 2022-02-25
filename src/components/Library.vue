<template>
  <div id="hello">
    <splitpanes vertical style="height: 600px" class="default-theme">
      <pane>
        <Library_Work v-for="work in worklist" v-bind:id="work['@id']" v-bind:work="work"/>
      </pane>
      <pane size="30">
        <splitpanes horizontal style="height: 600px" class="default-theme">
          <pane type="sidebar"style="height: 40px">
            <span class="title">SIDEBAR</span>
              <button v-on:click="showWorkbench" class="btn btn-sm" style="float: right">Load Arrangements</button>
          </pane>
          <pane v-for="(view, index) in views">
            <ArrangementMetadata v-bind:perspective="view.perspective" v-bind:arr="view.arrangement" v-bind:index="index"/>
          </pane>
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
  font-weight: bold;
}
button {
  margin: 0.3rem 0.5rem;
  font-weight: bold;
}
.sidebar {
  margin: 0.3rem 0.5rem;
  font-weight: bold;
  background-color: #e0b81f;
}


</style>
