<template>
  <div>
    <div class="modeButtons btn-group btn-group-block">
      <button :class="{'btn-primary': !showAnnotationTool}" @click="select" class="btn btn-sm">select</button>
      <button :class="{'btn-primary': showAnnotationTool}" @click="annotate" class="btn btn-sm">annotate</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OverviewTool',
  components: {
  },
  computed: {
    showAnnotationTool: function () {
      return this.$store.getters.annotationToolVisible
    }
  },
  methods: {
    select: function () {
      this.$store.dispatch('setSelectionMode')
    },
    annotate: function () {
      this.$store.dispatch('setAnnotationMode')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

.modeButtons {
  margin: .5rem;
}

</style>
