<template>
  <div class="root">
    <template v-if="perspective==='facsimile'">
      <Facsimile :idSeed="'facs_' + index" :uri="arr.iiif" :index="index"/>
    </template>
    <template v-if="perspective==='render'">
      <div class="title">{{ shortTitle}}</div>
      <Verovio :idSeed="'pane_' + index" :uri="arr.MEI" settings="fullScore"/>
    </template>

  </div>
</template>

<script>
import Verovio from '@/components/SelectionTool/Verovio.vue'
import Facsimile from '@/components/SelectionTool/Facsimile.vue'

export default {
  name: 'DisplayPane',
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
    shortTitle: function () {
      return this.arr.shortTitle
    }
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
