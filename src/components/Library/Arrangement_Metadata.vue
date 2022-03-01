<template>
<div align="left">
<!-- <div v-if="this.index===1" class="title">Lower pane selection</div> -->
  <!-- <div v-else  class="title">Pane number {{ selectionNumber }}</div> -->
    <!-- <div class="title" style="font-weight:bold">Pane number {{ selectionNumber }}</div> -->
    <div>
      <span>Selection {{ index +1 }}
      </span>
      <span style="float:right; padding-right:1rem; padding-top:.5rem">
        <button v-on:click="removeView" class="btn btn-sm">
          <i class="icon icon-delete"></i>
        </button>
      </span>
    </div>
    <div><label class="title">Title:</label> {{ this.shortTitle }}</div>
    <div><label class="title">Arranger:</label> {{ this.arranger }}</div>
    <div><label class="title">Publisher:</label> {{ this.publisher }}</div>
    <div><label class="title">Date:</label> {{ this.date }}</div>
    <div><label class="title">Catalog Number:</label> {{ this.catNumber }}</div>

</div>
</template>

<script>
import { prefix as pref } from './../../meld/prefixes'
export default {
  name: 'Arrangement_Metadata',
  props: {
    perspective: String,
    arr: Object,
    index: Number
  },
  computed: {
    shortTitle: function() {
      return this.arr.shortTitle
    },
    arranger: function() {
      return this.arr.arranger[pref.rdfs + 'label']
    },
    publisher: function() {
      return this.arr.publisher[pref.rdfs + 'label']
    },
    date: function() {
      return this.arr.date
    },
    catNumber: function() {
      return this.arr.catNumber
    },
    panePosition: function() {
      return this.index + " index number"
    },
    selectionNumber: function() {
      return this.index + 1
    }
  },
  methods: {
    selectRendering: function () {
      console.log('Selecting the Verovio view, which means pulling MEI from ' + this.arr.MEI)
  },
    removeView: function () {
      this.$store.dispatch('removeView', this.index)
  },
    selectFacs: function () {
      console.log('Selecting the Facsimile.')
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.title {
  font-weight: bold;
  }
.arrangement {
  color:red;
  .facsBtn {
    margin-left: .5rem;
  }
.button {
  padding: 50px;
}
  label {
    font-weight: bold;
    color: red;
  }
}

</style>
