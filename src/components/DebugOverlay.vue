<template>
  <div class="debugOverlay">
    <div class="content">
      <header>
        <i v-on:click="toggleDebugOverlay" class="icon icon-cross"></i>
        <h1>Debug</h1>
      </header>
      <Splitpanes horizontal style="height: calc(100% - 2rem);" class="default-theme">
        <pane size="70" min-size="5" max-size="80">
          <Splitpanes vertical class="default-theme">
            <pane>
              <h2>Observations ({{observations.length}})</h2>
              <div class="scrollable">
                <JsonListEntry v-for="o in observations" v-bind:file="o" class="jsonFile"/>
              </div>
            </pane>
            <pane>
              <h2>Musical Materials ({{musicalMaterials.length}})</h2>
              <div class="scrollable">
                <JsonListEntry v-for="m in musicalMaterials" v-bind:file="m" class="jsonFile"/>
              </div>
            </pane>
            <pane>
              <h2>Extracts ({{extracts.length}})</h2>
              <div class="scrollable">
                <JsonListEntry v-for="e in extracts" v-bind:file="e" class="jsonFile"/>
              </div>
            </pane>
            <pane>
              <h2>Selections ({{selections.length}})</h2>
              <div class="scrollable">
                <JsonListEntry v-for="s in selections" v-bind:file="s" class="jsonFile"/>
              </div>
            </pane>
          </Splitpanes>
        </pane>
        <pane>
          <pre id="debugJsonPreview"></pre>
        </pane>
      </Splitpanes>
    </div>
  </div>
</template>

<script>
import { Splitpanes, Pane } from 'splitpanes'
import JsonListEntry from './Debug/JsonListEntry.vue'

export default {
  name: 'DebugOverlay',
  components: {
    Splitpanes,
    Pane,
    JsonListEntry
  },
  computed: {
    observations: function() {
      return this.$store.getters.observations
    },
    musicalMaterials: function() {
      return this.$store.getters.musicalMaterials
    },
    extracts: function() {
      return this.$store.getters.extracts
    },
    selections: function() {
      return this.$store.getters.selections
    }
  },
  methods: {
    toggleDebugOverlay: function () {
      console.log('hurz!')
      this.$store.dispatch('toggleDebugOverlay')
    }
  },
  created: function () {

    const musMat = {
      "@type": "https://example.com/Terms/MusicalMaterial",
      "@id": "https://bithUsr.inrupt.net/public/objects/musicalMaterial-169c02951eb9.jsonld",
      "http://purl.org/dc/terms/created": "2022-02-02T11:31:43.714Z",
      "http://purl.org/dc/terms/creator": "https://bithUsr.inrupt.net/profile/card#me",
      "https://www.w3.org/2000/01/rdf-schema#label": "First 4 measures of 1st theme of Op. 92/ii",
      "http://purl.org/vocab/frbr/core#embodiment": [
        "https://bithUsr.inrupt.net/public/objects/extract-e28b5c68",
        "https://bithUsr.inrupt.net/public/objects/extract-f7c4dc30"
      ]
    }

    const ex1 = {
       "@type": "https://example.com/Terms/Extract",
       "@id": "https://bithUsr.inrupt.net/public/objects/extract-e28b5c68",
       "http://purl.org/dc/terms/created": "2022-02-02T11:31:43.714Z",
       "http://purl.org/dc/terms/creator": "https://bithUsr.inrupt.net/profile/card#me",
       "https://www.w3.org/2000/01/rdf-schema#label": "Pittman, Star Shining Brightly, mm 3-6",
       "http://purl.org/vocab/frbr/core#embodiment": [
          "https://bithUsr.inrupt.net/public/objects/selection-8bf70834.jsonld",
          "https://bithUsr.inrupt.net/public/objects/selection-b324afee9.jsonld"
        ]
    }

    const sel1 = {
       "@type": "https://example.com/Terms/Selection",
       "@id": "https://bithUsr.inrupt.net/public/objects/selection-8bf70834.jsonld",
       "http://purl.org/dc/terms/created": "2022-02-02T11:31:43.714Z",
       "http://purl.org/dc/terms/creator": "https://bithUsr.inrupt.net/profile/card#me",
       "https://www.w3.org/2000/01/rdf-schema#label": "measures 3-6 Pittman arrangement, MEI encoding of Augener edition",
       "http://purl.org/vocab/frbr/core#part": [
          "https://raw.githubusercontent.com/DomesticBeethoven/data/main/mei/op.%2092/StimKlvAugener%20-%20D-BNba%20C92_48/D-BNbaC92_48.mei#ma3ee7212-2876-4cc9-a208-5e27950f5f51",
          "https://raw.githubusercontent.com/DomesticBeethoven/data/main/mei/op.%2092/StimKlvAugener%20-%20D-BNba%20C92_48/D-BNbaC92_48.mei#m89f276eb-3d23-4413-9edd-b324afee9a8f",
          "https://raw.githubusercontent.com/DomesticBeethoven/data/main/mei/op.%2092/StimKlvAugener%20-%20D-BNba%20C92_48/D-BNbaC92_48.mei#m26ce15c8-9470-4055-8a81-48fe2e952c3d",
          "https://raw.githubusercontent.com/DomesticBeethoven/data/main/mei/op.%2092/StimKlvAugener%20-%20D-BNba%20C92_48/D-BNbaC92_48.mei#md118d3fa-d513-45d6-8461-83a1caeab151"
       ]
    }
    const sel2 = {
       "@type": "https://example.com/Terms/Selection",
       "@id": "https://bithUsr.inrupt.net/public/objects/selection-b324afee9.jsonld",
       "http://purl.org/dc/terms/created": "2022-02-02T11:31:43.714Z",
       "http://purl.org/dc/terms/creator": "https://bithUsr.inrupt.net/profile/card#me",
       "https://www.w3.org/2000/01/rdf-schema#label": "measures 3-6 Pittman arr., recorded by Männerchor Bad Saulgau",
       "http://purl.org/vocab/frbr/core#part": [
          "https://example.org/pittman.mp3#t4,15"
       ]
     }

    const ex2 = {
       "@type": "https://example.com/Terms/Extract",
       "@id": "https://bithUsr.inrupt.net/public/objects/extract-f7c4dc30",
       "http://purl.org/dc/terms/created": "2022-02-02T11:31:43.714Z",
       "http://purl.org/dc/terms/creator": "https://bithUsr.inrupt.net/profile/card#me",
       "https://www.w3.org/2000/01/rdf-schema#label": "Silcher, Gesang des Peris,  mm1-4",
       "http://purl.org/vocab/frbr/core#embodiment": [
          "https://bithUsr.inrupt.net/public/objects/selection-2dbcc8cc.jsonld"
       ]
    }

    const sel3 = {
       "@type": "https://example.com/Terms/Selection",
       "@id": "https://bithUsr.inrupt.net/public/objects/selection-2dbcc8cc.jsonld",
       "http://purl.org/dc/terms/created": "2022-02-02T11:31:43.714Z",
       "http://purl.org/dc/terms/creator": "https://bithUsr.inrupt.net/profile/card#me",
       "https://www.w3.org/2000/01/rdf-schema#label": "Gesang des Peris, MEI encoding of 1871 Silcher edition",
       "http://purl.org/vocab/frbr/core#part": [
          "https://raw.githubusercontent.com/DomesticBeethoven/data/main/mei/op.%2092/StimKlvZumsteeg%20-%20D-BNba%20C%20SILCH_5/D-BNbaC_SILCH_5.mei#m2dbcc8cc-eff1-418b-8014-37c8a4d1b502",
          "https://raw.githubusercontent.com/DomesticBeethoven/data/main/mei/op.%2092/StimKlvZumsteeg%20-%20D-BNba%20C%20SILCH_5/D-BNbaC_SILCH_5.mei#m95e99f55-7309-4470-adf3-40e39f49bfe9",
          "https://raw.githubusercontent.com/DomesticBeethoven/data/main/mei/op.%2092/StimKlvZumsteeg%20-%20D-BNba%20C%20SILCH_5/D-BNbaC_SILCH_5.mei#m4993c2af-d064-4b2b-a592-36fbe8d4ab58",
          "https://raw.githubusercontent.com/DomesticBeethoven/data/main/mei/op.%2092/StimKlvZumsteeg%20-%20D-BNba%20C%20SILCH_5/D-BNbaC_SILCH_5.mei#m453fa20c-7c87-4ca6-b037-e1d8512acf11"
       ]
    }

    // this.$store.dispatch('createDataObject',{type: 'musicalMaterial', object: musMat})
    // this.$store.dispatch('createDataObject',{type: 'extract', object: ex1})
    // this.$store.dispatch('createDataObject',{type: 'extract', object: ex2})
    // this.$store.dispatch('createDataObject',{type: 'selection', object: sel1})
    // this.$store.dispatch('createDataObject',{type: 'selection', object: sel2})
    // this.$store.dispatch('createDataObject',{type: 'selection', object: sel3})
    console.log('added stuff')
  }
}
</script>

<style lang="scss" scoped>
.debugOverlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  z-index: 20000;
  background-color: rgba(0,0,0,.2);
  backdrop-filter: blur(5px);

  .content {
    backdrop-filter: blur(5px);
    position: absolute;
    top: 1.5rem;
    left: 1.5rem;
    right: 1.5rem;
    bottom: 1.5rem;
    border: .5px solid #999999;
    border-radius: .4rem;
    background-color: #ffffff;
    box-shadow: 0 .2rem 1rem rgba(0,0,0,.5);

    header {
      border-bottom: .5px solid #999999;
      background-color: #e5e5e5;
      border-radius: .4rem .4rem 0 0;
      h1 {
        font-size: .9rem;
        font-weight: 700;
        text-align: left;
        margin: 0;
        padding: .1rem .5rem;
      }
      i {
        float: right;
        margin: .3rem;
        cursor: pointer;
      }
    }

    h2 {
      text-align: left;
      font-size: .8rem;
      font-weight: bold;
      margin: 0 0 .2rem;
      padding: .1rem;
    }

    .splitpanes.default-theme .splitpanes__pane {
      overflow-y: auto;
    }

    #debugJsonPreview {
      text-align: left;
      font-family: monospace;
      font-size: .7rem;
      padding: .5rem 1rem;
      background-color: #ffffff;
      overflow: auto;
    }

  }
}
</style>
