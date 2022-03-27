<template>
  <div :id="id" class="jsonFile" v-on:click="showJson">
    <span class="id">{{ id }}</span>
    <span class="desc">{{ label }}</span>
  </div>
</template>

<script>
import { Splitpanes, Pane } from 'splitpanes'
import {
  getThingAll,
  getStringNoLocale,
  thingAsMarkdown
} from '@inrupt/solid-client'
import { prefix as pref } from './../../meld/prefixes'

export default {
  name: 'JsonListEntry',
  components: {

  },
  props: {
    file: Object
  },
  computed: {
    label: function() {
      const thing = getThingAll(this.file)[0]
      const label = getStringNoLocale(thing, pref.rdfs + 'label')

      return label
    },
    id: function() {
      const url = getThingAll(this.file)[0].url
      if(url.indexOf('.well-known/sdk-local-node/') !== -1) {
        return url.split('.well-known/sdk-local-node/')[1]
      } else if (url.indexOf('#') !== -1) {
        return url.split('#')[0]
      } else {
        return url
      }
    }
  },
  methods: {
    showJson: function (e) {
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
