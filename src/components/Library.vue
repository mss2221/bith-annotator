<template>
  <div class="hello">
    <h1>Library</h1>
    <Library_Work v-for="work in worklist" v-bind:id="work['@id']"/>
    
  </div>
</template>

<script>
import Library_Work from './Library/Library_Work.vue'

export default {
  name: 'Library',
  components: {
    Library_Work
  },
  computed: {
    worklist: function() {
      return this.$store.getters.worklist
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
