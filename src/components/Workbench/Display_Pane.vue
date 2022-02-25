<template>
  <div class="root">
    <div v-if="perspective==='facsimile'">
      IIIF {{ shortTitle }}
    </div>
    <div v-if="perspective==='render'">
      Verovio {{ arr.MEI }}
    </div>

  </div>
</template>

<script>
import { prefix as pref } from './../../meld/prefixes'
export default {
  name: 'Display_Pane',
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


<style></style>
