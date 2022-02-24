<template>
  <div class="hello">
    <splitpanes vertical style="height:700px" class="default-theme">

      <pane >
        <splitpanes horizontal class="default-theme">
            <pane >
              <h4>Upper Pane Selection [0]</h4>
            </pane>
            <pane>
              <h4>Lower Pane Selection [1]</h4>
            </pane>
          </splitpanes>
          </pane>

          <pane size="30">
            <splitpanes horizontal>
              <pane size="5">
            <h3 class="title">Workbench</h3>
              </pane>
          <pane size="6">selection 1 info</pane>
          <pane size="6">selection 2 info</pane>
          <pane size="20">
            <div class="controls">
            <div class="title">Control Panel</div>
                <div>
                  <button>Make Selection</button>
                  <button>Define Parallel Passage</button>
                </div>

              <div>Annotation type:
                <div>
                  <input type="radio"  name="annotationType" value="describing">
                  <label for="describing">Describing</label>
                </div>
                <div>
                  <input type="radio"  name="annotationType" value="commenting">
                  <label for="commenting">Commenting</label>
                </div>
              </div>
          </div>
          </pane>

          <div>
            <input type="radio"  name="annotationType" value="describing">
            <label for="describing">Describing</label>
          </div>
          <div>
            <input type="radio"  name="annotationType" value="commenting">
            <label for="commenting">Commenting</label>
          </div>

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
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css';
export default {
  name: 'Workbench',
  components: {
    Splitpanes,
    Pane
  }
}
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
</style>
