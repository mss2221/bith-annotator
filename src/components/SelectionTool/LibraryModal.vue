<template>
  <div :class="{'active': libraryModalVisible}" class="modal" id="libraryModal">
  <a href="#close" class="modal-overlay" aria-label="Close" @click="close"></a>
  <div class="modal-container">
    <div class="modal-header">
      <a href="#close" class="btn btn-clear float-right" aria-label="Close" @click="close"></a>
      <div class="modal-title h5">Library</div>
    </div>
    <div class="modal-body">
      <div class="content">
        <LibraryWork v-for="(work, i) in worklist" v-bind:key="'work' + i" v-bind:id="work['@id']" v-bind:work="work"/>
      </div>
    </div>
    <div class="modal-footer">
      <a class="btn btn-link" href="#close" @click="close">Close</a>
    </div>
  </div>
</div>
</template>

<script>
import LibraryWork from '@/components/SelectionTool/LibraryWork.vue'

export default {
  name: 'LibraryModal',
  components: {
    LibraryWork
  },
  computed: {
    libraryModalVisible: function () {
      return this.$store.getters.libraryModalVisible
    },
    worklist: function () {
      return this.$store.getters.worklist
    },
    arrangements: function () {
      return this.$store.getters.arrangements
    }
  },
  methods: {
    close: function (e) {
      e.preventDefault()
      this.$store.dispatch('toggleLibraryModal')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

.modal-container {
  max-width: 95vw;
  max-height: 95vh;
}

</style>
