<template>
<h2>Display Pane {{ index }}</h2>
</template>

<script>
import { prefix as pref } from './../../meld/prefixes'
export default {
  name: 'Display_Pane',
  props: {
    arr: Object
  },
  computed: {
    views: function() {
      return this.$store.getters.views
      console.log(this.$store.getters.views)
    }
  }
}

</script>


<style></style>
