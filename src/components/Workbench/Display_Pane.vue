<template>
  <div class="root">
    <div v-if="perspective==='facsimile'">
      <Facsimile :idSeed="'facs_' + index" :manifest="arr.MEI"/>
    </div>
    <div v-if="perspective==='render'">
      <div class="title">{{ shortTitle}}</div>
      <Verovio :idSeed="'pane_' + index" :uri="arr.MEI" settings="fullScore"/>
    </div>

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
.title {
  font-weight: bold;
  }
</style>
