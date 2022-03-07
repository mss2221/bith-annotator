<template>
  <div class="root">
    <template v-if="perspective==='facsimile'">
      <Facsimile :idSeed="'facs_' + index" :manifest="arr.MEI"/>
    </template>
    <template v-if="perspective==='render'">
      <div class="title">{{ shortTitle}}</div>
      <Verovio :idSeed="'pane_' + index" :uri="arr.MEI" settings="fullScore"/>
    </template>

  </div>
</template>

<script>
import { prefix as pref } from './../../meld/prefixes'
import Verovio from './Verovio.vue'
import Facsimile from './Facsimile.vue'

export default {
  name: 'Display_Pane',
  components: {
    Verovio,
    Facsimile
  },
  props: {
    arr: Object,
    index: Number,
    perspective: String
  },
  computed: {
    shortTitle: function() {
      return this.arr.shortTitle
    }
  },
  panePosition: function() {
    return this.index + " index number"
  }
}

</script>


<style>

.root {
  width: 100%;
  height: 100%;
}
.title {
  font-weight: bold;
  }
</style>
