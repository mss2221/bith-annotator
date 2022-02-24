<template>
  <div>Hello arr meta {{ this.perspective }}</div>
</template>

<script>
import { prefix as pref } from './../../meld/prefixes'
export default {
  name: 'ArrangementMetadata',
  props: {
    perspective: String,
    arr: Object,
    index: Number
  },
  // computed: {
  //   shortTitle: function() {
  //     return this.arr.shortTitle
  //   },
  //   arranger: function() {
  //     return this.arr.arranger[pref.rdfs + 'label']
  //   },
  //   publisher: function() {
  //     return this.arr.publisher[pref.rdfs + 'label']
  //   },
  //   date: function() {
  //     return this.arr.date
  //   },
  //   catNumber: function() {
  //     return this.arr.catNumber
  //   }
  // },
  methods: {
    selectRendering: function () {
      console.log('Selecting the Verovio view, which means pulling MEI from ' + this.arr.MEI)
    },
    selectFacs: function () {
      console.log('Selecting the Facsimile.')
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.arrangement {
  color:red;
  .facsBtn {
    margin-left: .5rem;
  }
}

</style>
