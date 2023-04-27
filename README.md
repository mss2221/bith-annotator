# BitH Annotator

This tool is a proof of concept for writing editorial annotations
as Linked Open Data, bringing together MELD and Edirom. The work
was jointly funded by the UK Arts and Humanities Research Council
(AHRC), project reference
[AH/T01279X/1](https://gtr.ukri.org/projects?ref=AH%2FT01279X%2F1)),
and the Deutsche Forschungsgemeinschaft (DFG), Projektnummer
[429039809](https://gepris.dfg.de/gepris/projekt/429039809). The
project website can be found at https://domestic-beethoven.eu/, while the
prototype is deployed to https://tool.domestic-beethoven.eu/.

This tool serves as a proof of concept for a Linked Open Data app that
will pull in and display publicly available data about arrangements of
musical works (mostly by Ludwig van Beethoven), from multiple sources.
It is then possible to create annotations about those arrangements, and
store them as Linked Open Data in *Solid Pods*. These are freely
available "personal online data stores", which allow a user to retain
full control about their data. This means that our project will have no
access to (or even knowledge about) annotations created with the BitH
Annotator. For now, the only supported Pod Provider is
https://solidcommunity.net/, and data is stored in a public folder of a user's
pod. While this prototype does not support loading arbitrary Pods, it is
possible to share the link to a Pod and thus share the data. As a proof of
concept, the prototype will also by default load data from a Pod maintained by
our project, containing exemplary observations for a number of Beethoven
arrangements. It is possible to add individual observations that will base on
the ones provided by us. All data generated follows a specific
[data model](https://domestic-beethoven.eu/assets/docs/BitHModelDocumentation_v0.2.1.pdf),
which is also a research outcome of our project.

This prototype app is written with Vue.js 3 / Vuex, whereas MELD is based on
React / Redux. The bridging between these two technology stacks
happens in the Vuex store, which is described in more detail in the
*/src/store/modules/graphModule.js* file.

Authentication to SolidPODs, which are used for data storage, is
initiated in the */src/components/AppHeader/UserManagement.vue*
component, but also affects the Vuex store in */src/store/modules/userModule.js*.

The App is deployed using a multistage Dockerfile, using NodeJS to build the
tool, and then an nginx-based Container to serve it.

The tool will load data as specified in */public/rdf/BitHCollection.jsonld*.
From there, MELD will load additional data following the graph traversal rules
specified in */src/config/traversal.config.js*. Some of the data is loaded from
the project API, deployed from https://api.domestic-beethoven.eu. This API will
serve MEI files for rendering, but also auto-generated LOD representations
of the metadata contained in those MEI files, and, in some cases, auto-generated
IIIF Manifests. That API has been developed in collaboration with the
[Beethovens Werkstatt](https://beethovens-werkstatt.de) project, and is
available from https://github.com/DomesticBeethoven/api.

Development of this prototype relies in NodeJS v14 and NPM 6.

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```
