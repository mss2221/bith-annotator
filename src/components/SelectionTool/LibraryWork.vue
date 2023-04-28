<template>
  <div class="work">
    <div class="composer">{{ composer }}</div>
    <div class="workLabel">{{ label }}</div>
    <div class="published">{{ published }}</div>
    <div class="opus">{{ opus }}</div>
    <!--<span class="id">{{ id }}</span>-->
    <div class="arrangements">
      <div class="heading">{{ arrangements.length }}</div>
      <table class="table table-striped">
        <thead>
          <tr>
            <th class="shortTitle">Title</th>
            <th class="arranger">Arranger</th>
            <th class="publisher">Publisher</th>
            <th class="year">Year</th>
            <th>Open Perspective</th>
          </tr>
        </thead>
        <tbody>
          <LibraryArrangement v-for="(arr, i) in arrangements" v-bind:key="i" v-bind:arr="arr" v-bind:work="work"/>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { prefix as pref } from '@/meld/prefixes.js'
import LibraryArrangement from '@/components/SelectionTool/LibraryArrangement.vue'
export default {
  name: 'LibraryWork',
  components: {
    LibraryArrangement
  },
  props: {
    id: String,
    work: Object
  },
  methods: {

  },
  computed: {
    /* worklist: function() {
      return this.$store.getters.worklist
    }, */
    composer: function () {
      return this.work[pref.rdau + 'P60426'][pref.rdfs + 'label']
    },
    label: function () {
      return this.work[pref.rdfs + 'label']
    },
    published: function () {
      return this.work[pref.gndo + 'dateOfPublication']
    },
    opus: function () {
      return this.work[pref.gndo + 'opusNumericDesignationOfMusicalWork']
    },
    arrangements: function () {
      return this.$store.getters.arrangementsForWork(this.id)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.work {
  margin: 1rem 0;
  padding: .3rem .5rem;
  text-align: left;
  background-color: #f5f5f5;
  border-radius: .3rem;
  border: .5px solid #999999;

  .composer {
    font-size: .8rem;
    font-weight: 700;
    margin: 0;
    padding: 0;
  }

  .workLabel {
    font-size: 1rem;
    font-weight: 400;
    margin: 0;
    padding: 0;
  }

  .published {
    display: inline-block;
    font-size: .7rem;
    margin: 0 .5rem 0 0;
    &:before {
      content: 'Published: '
    }
    &:after {
      content: ','
    }
  }

  .opus {
    display: inline-block;
    font-size: .7rem;
    margin: 0;
    &:before {
      content: 'Opus: '
    }
  }

  .arrangements {
    background-color: #ffffff;
    border: .5px solid #999999;
    border-radius: .3rem;
    padding: .2rem .4rem;
    margin-top:.5rem;

    .heading {
      font-weight: bold;
      &:before {
        content: 'Arrangements: '
      }
    }

    table {
      width: 100%;
      margin: 0 0 .2rem;
      border-collapse: collapse;

      .table td, .table th {
        padding: .2rem .4rem;
      }
    }
  }

}
</style>
