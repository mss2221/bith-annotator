<template>
  <div :class="{'active': code !== ''}" class="modal" id="ldDetailsModal">
  <a href="#close" class="modal-overlay" aria-label="Close" @click="close"></a>
  <div class="modal-container">
    <div class="modal-header">
      <a href="#close" class="btn btn-clear float-right" aria-label="Close" @click="close"></a>
      <div class="modal-title h5">Object Details</div>
    </div>
    <div class="modal-body">
      <div class="content">
        <pre>
        {{ code }}
        </pre>
      </div>
    </div>
    <div class="modal-footer">
      <a class="btn btn-link" href="#close" @click="close">Close</a>
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'LdDetailOverlay',
  components: {

  },
  computed: {
    code: function () {
      return this.$store.getters.ldDetails
    }
  },
  methods: {
    close: function (e) {
      this.$store.dispatch('setLdDetails', '')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import '@/css/_variables.scss';

.modal-container {
  max-width: 60vw;
  max-height: 95vh;
}

pre {
  font-size: .6rem;
  padding: .5rem;
  background-color: #e5e5e5;
  border: .5px solid #999;
  border-radius: 5px;
  overflow: scroll;
  cursor: default;
}

</style>
