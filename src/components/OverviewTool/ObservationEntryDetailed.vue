<template>
  <tr class="observationEntryDetailed" @click="activateThing" :class="{'active': activated, 'affectedCurrent': affectedByCurrentAnnot, 'affectedActive': affectedByActiveAnnot}" :data-level="this.level" :title="type + ': ' + id" :data-id="id">
    <td class="content">
      <template v-if="!activated || !isCurrent">
        <span class="plain">{{body}}</span>
      </template>
      <template v-else>
        <textarea class="form-input" id="obEditBody" v-model.trim="body" placeholder="Enter your observation" rows="3"></textarea>
      </template>
    </td>
    <td class="actions">
      <i class="icon icon-plus" v-if="!isCurrent && ableToBeEdited && !affectedByCurrentAnnot" @click.stop="add" title="add"></i>
      <i class="icon icon-minus" v-if="!isCurrent && ableToBeEdited && affectedByCurrentAnnot" @click.stop="remove" title="remove"></i>
      <i class="icon icon-edit" v-if="!isCurrent && activated" @click.stop="startEditing" title="edit observation"></i>
      <i class="icon icon-cross" v-if="isCurrent" @click.stop="discardChanges" title="cancel changes"></i>
      <i class="icon icon-check" v-if="isCurrent" @click.stop="saveChanges" title="save changes"></i>
    </td>
    <td class="resp" :title="resp">
      <i class="icon icon-people"></i>
    </td>
    <td class="showDetails">
      <i class="icon icon-search" @click.stop="showLD"></i>
    </td>
  </tr>
</template>

<script>
import {
  getThingAll,
  getStringNoLocale,
  solidDatasetAsTurtle
} from '@inrupt/solid-client'
import { prefix as pref } from '@/meld/prefixes.js'
import { getChildType } from '@/store/tools/solidHelpers.js'
import { bithTypes } from '@/meld/constants.js'

export default {
  name: 'ObservationEntryDetailed',
  components: {

  },
  props: {
    file: Object,
    type: String,
    level: Number
  },
  computed: {
    id: function () {
      const url = getThingAll(this.file)[0].url
      if (url.indexOf('.well-known/sdk-local-node/') !== -1) {
        return url.split('.well-known/sdk-local-node/')[1]
      } else if (url.indexOf('#') !== -1) {
        return url.split('#')[0]
      } else {
        return url
      }
    },
    activated: function () {
      return this.$store.getters.activeThingIDByType(this.type) === this.id
    },
    currentThing: function () {
      const thing = this.$store.getters.currentThingByTypeAndID(this.type, this.id)

      if (thing === undefined) {
        return null
      }
      return thing
    },
    isCurrent: function () {
      return this.currentThing !== null
    },
    childType: function () {
      return getChildType(this.type)
    },
    children: function () {
      const children = this.$store.getters.childrenByTypeAndID(this.type, this.id)
      return children
    },
    body: {
      get () {
        const thing = getThingAll(this.file)[0]
        const body = getStringNoLocale(thing, pref.oa + 'bodyValue')

        return body
      },
      set (val) {
        this.$store.dispatch('changeCurrentDataObject', {
          type: 'observation',
          id: this.id,
          prop: pref.oa + 'bodyValue',
          method: 'setStringNoLocale',
          val
        })
      }
    },
    resp: function () {
      const file = (this.isCurrent) ? this.$store.getters.currentThingByTypeAndID(this.type, this.id) : this.file
      const thing = getThingAll(file)[0]
      const user = getStringNoLocale(thing, pref.dct + 'creator')
      return user
    },
    affectedByCurrentAnnot: function () {
      const affectedArr = this.$store.getters.affectedByCurrentAnnot[bithTypes.observation]
      return affectedArr.indexOf(this.id) !== -1
    },
    affectedByActiveAnnot: function () {
      const affectedArr = this.$store.getters.affectedByActiveAnnot[bithTypes.observation]
      return affectedArr.indexOf(this.id) !== -1
    },
    ableToBeEdited: function () {
      const obj = this.$store.getters.ableToBeEdited
      const bool = obj[bithTypes.observation]
      return bool
    }
  },
  methods: {
    activateThing: function (e) {
      console.log('activating ' + this.type + ' ' + this.id, e)
      if (e.target.localName === 'textarea') {
        return
      }

      if (!this.activated) {
        this.$store.dispatch('activateThing', { type: this.type, id: this.id })
      } else {
        this.$store.dispatch('activateThing', { type: this.type, id: null })
      }
      this.$store.dispatch('activateThing', { type: bithTypes.musicalMaterial, id: null })
      this.$store.dispatch('activateThing', { type: bithTypes.extract, id: null })
      this.$store.dispatch('activateThing', { type: bithTypes.selection, id: null })
    },
    startEditing: function () {
      this.$store.dispatch('activateThing', { type: this.type, id: this.id })
      this.$store.dispatch('makeCurrent', { type: this.type, object: this.file })
    },
    saveChanges: function () {
      this.$store.dispatch('saveChanges')
    },
    discardChanges: function () {
      this.$store.dispatch('discardChanges')
    },
    add: function () {
      console.log('add this to current thing')
      this.$store.dispatch('toggleUriAtCurrentThing', { target: this.id, operation: 'add' })
    },
    remove: function () {
      console.log('remove this from current thing')
      this.$store.dispatch('toggleUriAtCurrentThing', { target: this.id, operation: 'remove' })
    },
    showLD: async function (e) {
      const ttl = await solidDatasetAsTurtle(this.file, { prefixes: pref })
      // console.log(this.id + ' (' + ttl.length + ')')
      this.$store.dispatch('setLdDetails', ttl)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/css/_variables.scss';

.table tbody tr.active, .table.table-striped tbody tr.active {
  background-color: #6aa4fc;
}

.table tbody tr.active, .table.table-striped tbody tr.affectedActive {
  background-color: #bad3f9;
}

.table tbody tr.active, .table.table-striped tbody tr.affectedCurrent {
  background-color: #a8c9fb;
}

.observationEntryDetailed {
  text-align: left;
  margin: 0 0 .05rem;
  padding: .05rem;
  font-size: .8rem;

  td {
    padding: .2rem .3rem;
    vertical-align: top;

    &.content {
      .plain {
        overflow: hidden;
        text-overflow: ellipsis;
        max-height: 1rem;
        display: inline-block;
      }
    }

    &.showDetails, &.resp {
      width: .5rem;
    }

    &.actions {
      width: 2.5rem;

      i {
        cursor: pointer;
      }

      i + i {
        margin-left: .2rem;
      }
    }
  }

  &.active[data-level="1"] > .firstLine {
    background-color: lighten($uiHighlightColor, 30%);
  }

  &.active[data-level="2"] > .firstLine {
    background-color: lighten($uiHighlightColor, 40%);
  }

  &[data-level="2"] {
    margin-left: 1.5rem;
    font-size: .6rem;
  }

  &.active {
    & > .firstLine > i {
      transform: rotate(0deg);
    }
  }
}
</style>
