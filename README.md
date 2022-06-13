# bith-annotator

This tool is a proof of concept for writing editorial annotations
as Linked Open Data, bringing together MELD and Edirom.

This app is written with Vue.js / Vuex, whereas MELD is based on
React / Redux. The bridging between these two technology stacks
happens in the Vuex store, which is described in more detail in the
*/src/store/index.js* file.

Authentication to SolidPODs, which are used for data storage, is
initiated in the */src/components/AppHeader/UserManagement.vue*
component, but also affects the Vuex store in */src/store/index.js*.

This prototype is work in progress and may change anytime.

At this point, it is required to have a WebId from
https://broker.pod.inrupt.com. This will change.

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
#### Runs on PORT 8081
```
PORT=8081 npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
