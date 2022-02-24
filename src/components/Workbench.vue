<template>
  <div class="hello">
    <h1>Workbench</h1>
    <div>This is the Workbench.</div>
      <splitpanes style="height: 600px" class="default-theme">
        <pane>
          <h2>Upper Pane [0]</h2>
        </pane>
        <pane>
          <h2>Lower Pane [1]</h2>
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

</style>
