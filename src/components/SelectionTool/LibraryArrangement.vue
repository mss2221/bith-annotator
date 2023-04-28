<template>
  <tr class="arrangement">
    <td class="shortTitle">{{ shortTitle }}</td>
    <td class="arranger">{{ arranger }}</td>
    <td class="publisher">{{ publisher }}</td>
    <td class="date">{{ date }}</td>
    <!-- <td class="catNumber">{{ catNumber}}</td> -->
    <td class="buttons">
      <button v-on:click="selectFacs" :disabled="this.arr.iiif === false" class="btn btn-sm facsBtn">IIIF</button>
      <button v-on:click="selectRendering" :disabled="this.arr.MEI === false" class="btn btn-sm textBtn">Transcript</button>
    </td>
  </tr>
</template>

<script>
import { prefix as pref } from '@/meld/prefixes'
export default {
  name: 'LibraryArrangement',
  props: {
    work: Object,
    arr: Object
  },
  computed: {
    shortTitle: function () {
      return this.arr.shortTitle
    },
    arranger: function () {
      if (this.arr.arranger) {
        if (typeof this.arr.arranger === 'string') {
          return this.arr.arranger
        } else if (this.arr.arranger[pref.rdfs + 'label']) {
          return this.arr.arranger[pref.rdfs + 'label']
        } else if (this.arr.arranger['@id']) {
          return this.arr.arranger['@id']
        }
        return undefined
      }
      return undefined
    },
    publisher: function () {
      if (this.arr.publisher) {
        return this.arr.publisher[pref.rdfs + 'label']
      }
      return undefined
    },
    date: function () {
      return this.arr.date
    },
    catNumber: function () {
      return this.arr.catNumber
    }
  },
  methods: {
    selectRendering: function () {
      if (this.arr.MEI !== false) {
        const obj = {
          perspective: 'render',
          arrangement: this.arr
        }
        // console.log('Selecting the Verovio view, which means pulling MEI from ' + this.arr.MEI, obj)
        this.$store.dispatch('addView', obj)
        this.$store.dispatch('toggleLibraryModal')
      }
    },
    selectFacs: function () {
      if (this.arr.iiif !== false) {
        const obj = {
          perspective: 'facsimile',
          arrangement: this.arr
        }
        // console.log('Selecting the Facsimile.')
        this.$store.dispatch('addView', obj)
        this.$store.dispatch('toggleLibraryModal')
      }
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.arrangement {
  font-weight: 300;
  font-size: .7rem;

  .facsBtn {
    margin-right: .5rem;
  }

  td {
    padding: .2rem .4rem .2rem .2rem;
  }
}

</style>
