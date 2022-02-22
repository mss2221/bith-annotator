<template>
  <div class="work">
    <div class="composer">{{ composer }}</div>
    <div class="workLabel">{{ label }}</div>
    <div class="published">{{ published }}</div>
    <div class="opus">{{ opus }}</div>
    <!--<span class="id">{{ id }}</span>-->
  </div>
</template>

<script>
import { prefix as pref } from './../../meld/prefixes'
export default {
  name: 'Library_Work',
  props: {
    id: String,
    work: Object
  },
  computed: {
    /*worklist: function() {
      return this.$store.getters.worklist
    },*/
    composer: function() {
      return this.work[pref.rdau + 'P60426'][pref.rdfs + 'label']
    },
    label: function() {
      return this.work[pref.rdfs + 'label']
    },
    published: function() {
      return this.work[pref.gndo + 'dateOfPublication']
    },
    opus: function() {
      return this.work[pref.gndo + 'opusNumericDesignationOfMusicalWork']
    }

    /*,
    work: function() {
      return this.$store.getters.work(this.props.id)
    }*/
  }
}
/*
{
  "@id":"http://d-nb.info/gnd/300016417",
  "http://rdaregistry.info/Elements/u/P60426":{
    "@id":"http://d-nb.info/gnd/118508288",
    "http://www.w3.org/2000/01/rdf-schema#label":"Ludwig van Beethoven"
  },
  "http://www.w3.org/2000/01/rdf-schema#label":"Sinfonien, Nr. 7, op. 92 (A-Dur)",
  "https://d-nb.info/standards/elementset/gnd#dateOfPublication":"1816",
  "https://d-nb.info/standards/elementset/gnd#opusNumericDesignationOfMusicalWork":"92"
}
*/
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.work {
  margin: 1rem 2rem;
  padding: .5rem 1rem;
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

}
</style>
