<template>
  <div>
    <splitpanes vertical style="height:700px" class="default-theme">

      <pane>
        <splitpanes horizontal class="default-theme">
          <pane v-for="(view, index) in views">
            <Display_Pane v-bind:perspective="view.perspective" v-bind:arr="view.arrangement" v-bind:index="index"/>
          </pane>
        </splitpanes>
      </pane>

<!-- Sidebar -->

      <pane size="30">
        <div class="sidebar">
          <h1>Workbench</h1>
          <Arrangement_Metadata_Preview v-for="(view, index) in views" v-bind:perspective="view.perspective" v-bind:arr="view.arrangement" v-bind:index="index"/>
          <AnnotatorTool/>
        </div>
        <!--<splitpanes horizontal class="default-theme">
          <pane size="5">

          </pane>
          <pane size="8" v-for="(view, index) in views" style="text-align:left">

              <Arrangement_Metadata v-bind:perspective="view.perspective" v-bind:arr="view.arrangement" v-bind:index="index"/>
          </pane>


          <pane size="20">
            <div class="controls">
            <div class="title">Control Panel</div>
                <div>
                  <button class="btn">Select Extract</button>
                  <button class="btn">Define Parallel Passage</button>
                </div>
              <div>
                <div class="title">Annotation type:</div>
                <div>
                  <input type="radio"  name="annotationType" value="describing">
                  <label for="describing">Describing</label>

                  <input type="radio"  name="annotationType" value="commenting">
                  <label for="commenting">Commenting</label>
                </div>
              </div>
            </div>
          </pane>

          <pane size="63">
            <div class="textBox">
              <h2 class="title">Text Box</h2>
            </div>
          </pane>
        </splitpanes>-->
      </pane>
    </pane>
  </splitpanes>
</div>
</template>

<!-- <pane size="6">selection 1 info
        <button v-on:click="replaceArrangement" class="btn btn-sm">
          <i class="icon icon-delete"></i>
          </button>
      </pane>

      <pane size="6">selection 2 info
        <button v-on:click="replaceArrangement" class="btn btn-sm">
          <i class="icon icon-delete"></i>
          </button>
      </pane> -->

<script>
import Display_Pane from './Workbench/Display_Pane.vue'
import Arrangement_Metadata_Preview from './Library/Arrangement_Metadata_Preview.vue'
import AnnotatorTool from './Workbench/AnnotatorTool.vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css';

export default {
  name: 'Workbench',
  components: {
    Display_Pane,
    Arrangement_Metadata_Preview,
    AnnotatorTool,
    Splitpanes,
    Pane
  },
  methods: {
    replaceArrangement: function() {
    console.log('replaceArrangement')
},
},
  computed: {
    views: function() {
      return this.$store.getters.views
    }
  }
}
console.log('Workbench.vue')
console.log()

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h1 {
  text-align: left;
  margin: 0 0 .2rem;
  font-size: 1.2rem;
  font-weight: bold;
  padding: .2rem;
}

.level {
  min-height: 5rem;
  border: .5px solid #999999;
  margin: .3rem;
  padding: .5rem;
}

.controls {
  background-color: #9fc2b2;
}
.textBox {
  background-color: #ebd999;
}
.label {
  font-size: 0.7rem;
  display: block;
  text-align: left;
  padding-left: 1rem;
}
.btn {
  font-size: small;
  font-weight: bold;
  margin: 0.3rem 0.5rem;
}
[type=radio] {
    margin-right: 0.25rem;
    margin-left: 1rem;
}

.sidebar {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: #ffffff;
  padding: .3rem;
  border-left: .5px solid #dddddd;
}
</style>
