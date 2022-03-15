<template>
  <div :id="id" class="jsonFile" v-on:click="showJson">
    <span class="id">{{ id }}</span>
    <span class="desc">{{ label }}</span>
  </div>
</template>

<script>
import { Splitpanes, Pane } from 'splitpanes'

export default {
  name: 'JsonListEntry',
  components: {

  },
  props: {
    file: Object
  },
  computed: {
    label: function() {
      return this.file['https://www.w3.org/2000/01/rdf-schema#label']
    },
    id: function() {
      return this.file['@id']
    }
  },
  methods: {
    showJson: function (e) {
      console.log('hurz! ' + this.id)
      document.querySelectorAll('.jsonFile.active').forEach(file => file.classList.remove('active'))
      e.target.closest('.jsonFile').classList.add('active')
      document.querySelector('#debugJsonPreview').innerHTML = JSON.stringify(this.file, null, 2)
      //this.$store.dispatch('toggleDebugOverlay')
    }
  },
  created: function () {

  }
}
</script>

<style lang="scss" scoped>
.jsonFile {
  text-align: left;
  margin: 0 0 .1rem;
  padding: .1rem .2rem;
  border: .5px solid #999999;
  background-color: #ffffff;

  &.active {
    background-color: #e5f5ff;
  }

  span {
    display: block;
    &.id {
      color: #666666;
      font-family: monospace;
      font-size: .45rem;
    }
  }
}
</style>
