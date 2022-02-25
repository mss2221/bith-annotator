<template>
  <tr class="arrangement">
    <td class="shortTitle">{{ shortTitle }}</td>
    <td class="arranger">{{ arranger }}</td>
    <td class="publisher">{{ publisher }}</td>
    <td class="date">{{ date }}</date>
    <!-- <td class="catNumber">{{ catNumber}}</td> -->
    <td class="buttons">
      <button v-on:click="selectRendering" class="btn btn-sm textBtn">Render</button>
      <button v-on:click="selectFacs" class="btn btn-sm facsBtn">Facsimile</button>
    </td>
  </tr>
</template>

<script>
import { prefix as pref } from './../../meld/prefixes'
export default {
  name: 'Library_Arrangement',
  props: {
    work: Object,
    arr: Object
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
    }
  },
  methods: {
    selectRendering: function () {
      const obj= {
        "perspective":"render",
        "arrangement":this.arr
      }
      console.log('Selecting the Verovio view, which means pulling MEI from ' + this.arr.MEI, obj)
      this.$store.dispatch('addView', obj)
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
  color:#d60036;
  .facsBtn {
    margin-left: .5rem;
  }
}

</style>
