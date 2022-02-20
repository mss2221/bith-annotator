<template>
  <div class="work">
    <h1>Work {{ id }}</h1>

  </div>
</template>

<script>
export default {
  name: 'Library_Work',
  props: {
    id: String
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
.work {
  margin: 2rem;
  background-color: yellow;
}
</style>
