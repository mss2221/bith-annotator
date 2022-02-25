<template>
  <div class="hello">
    <splitpanes vertical style="height:700px" class="default-theme">

      <pane>
        <splitpanes horizontal class="default-theme">
          <pane v-for="(view, index) in views">
            <Display_Pane v-bind:perspective="view.perspective" v-bind:arr="view.arrangement" v-bind:index="index"/>
          </pane>

        </splitpanes>
      </pane>

      <pane size="30">
        <splitpanes horizontal>
          <pane size="5">
            <h3 class="title">Workbench</h3>
          </pane>
          <pane size="6">selection 1 info
            <button
              v-on:click="replaceArrangement"
              class="btn btn-sm">Replace</button>
          </pane>
          <pane size="6">selection 2 info
            <button
              v-on:click="replaceArrangement"
              class="btn btn-sm">Replace</button>
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
        </splitpanes>
      </pane>
    </pane>
  </splitpanes>
</div>
</template>

<script>
import Display_Pane from './Workbench/Display_Pane.vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css';
export default {
  name: 'Workbench',
  components: {
    Display_Pane,
    Splitpanes,
    Pane
  },
  methods: {
    replaceArrangement: function() {

}
},
  computed: {
    views: function() {
      return this.$store.getters.views

    },
  }
}
console.log('Workbench.vue')
console.log()

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.title {
  font-weight: bold;
}
.controls {
  background-color: #9fc2b2;
}
.textBox {
  background-color: #ebd999;
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
</style>
