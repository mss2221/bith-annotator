<template>
  <tr class="musMatEntryDetailed" @click="activateThing" :class="{'active': activated, 'affectedCurrent': affectedByCurrentAnnot, 'affectedActive': affectedByActiveAnnot}" :data-level="this.level" :title="type + ': ' + id" :data-id="id">
    <td class="thingLabel">
      <template v-if="isCurrent && activated">
        <input type="text" v-model.trim="label"/>
      </template>
      <template v-else>
        <span class="itemLabel">{{ label }}</span>
      </template>
    </td>
    <!--<td class="arrTitle">
      {{ arrangement?.shortTitle }}
    </td>
    <td class="arranger">
      {{arranger}}
    </td>-->
    <td class="actions">
      <i class="icon icon-plus" v-if="!isCurrent && ableToBeEdited && !affectedByCurrentAnnot" @click.stop="add" title="add"></i>
      <i class="icon icon-minus" v-if="!isCurrent && ableToBeEdited && affectedByCurrentAnnot" @click.stop="remove" title="remove"></i>
      <i class="icon icon-edit" v-if="!isCurrent && activated" @click.stop="startEditing" title="edit musical material"></i>
      <i class="icon icon-cross" v-if="isCurrent" @click.stop="discardChanges" title="cancel changes"></i>
      <i class="icon icon-check" v-if="isCurrent" @click.stop="saveChanges" title="save changes"></i>
    </td>
    <td class="resp" :title="resp">
      <i class="icon icon-people"></i>
    </td>
    <td class="showDetails">
      <i class="icon icon-search" @click.stop="showLD"></i>
    </td>

    <!--<div class="firstLine">

      <div class="editButtons float-right">
        <template v-if="isCurrent && activated && this.level === 1">
          <i class="icon icon-cross" @click.stop="discardChanges" title="cancel changes"></i>
          <i class="icon icon-check" @click.stop="saveChanges" title="save changes"></i>
        </template>
        <template v-if="!isCurrent && activated && this.level === 1">
          <i class="icon icon-edit" @click.stop="startEditing"></i>
        </template>
        <i class="icon icon-search" @click.stop="showLD"></i>
      </div>
      <i class="icon icon-caret" v-if="this.level === 1" @click.stop="deactivateThing"></i>

    </div>
    <div v-if="activated && this.level === 1" class="contents">
      <GraphEntry v-for="(c, cI) in children" :key="cI" :file="c" :level="this.level + 1" :type="childType"/>
    </div>-->
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
  name: 'MusMatEntryDetailed',
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
    label: {
      get () {
        const file = (this.isCurrent) ? this.$store.getters.currentThingByTypeAndID(this.type, this.id) : this.file
        const thing = getThingAll(file)[0]
        let label = getStringNoLocale(thing, pref.rdfs + 'label')

        if (label === '') {
          label = '[no label]'
        }

        return label
      },
      set (val) {
        this.$store.dispatch('changeCurrentDataObject', {
          type: this.type,
          id: this.id,
          prop: pref.rdfs + 'label',
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
      const affectedArr = this.$store.getters.affectedByCurrentAnnot[bithTypes.musicalMaterial]
      console.log('allAffected:')
      console.log(this.$store.getters.affectedByCurrentAnnot)
      return affectedArr.indexOf(this.id) !== -1
    },
    affectedByActiveAnnot: function () {
      const affectedArr = this.$store.getters.affectedByActiveAnnot[bithTypes.musicalMaterial]
      return affectedArr.indexOf(this.id) !== -1
    },
    ableToBeEdited: function () {
      const obj = this.$store.getters.ableToBeEdited
      const bool = obj[bithTypes.musicalMaterial]
      return bool
    }
  },
  methods: {
    activateThing: function (e) {
      console.log('activating ' + this.type + ' ' + this.id)

      if (e.target.localName === 'input') {
        return
      }

      if (!this.activated) {
        this.$store.dispatch('activateThing', { type: this.type, id: this.id })
      } else {
        this.$store.dispatch('activateThing', { type: this.type, id: null })
      }
      this.$store.dispatch('activateThing', { type: bithTypes.observation, id: null })
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

.musMatEntryDetailed {
  text-align: left;
  margin: 0 0 .05rem;
  padding: .05rem;
  font-size: .8rem;

  td {
    padding: .2rem .3rem;
    vertical-align: top;

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

  .firstLine {
    height: 30px;
    border-radius: 3px;

    & > i {
      transform: rotate(-90deg);
      display: inline-block;
      width: 1rem;
    }

    .editButtons {
      margin: 0 .3rem;

      i {
        margin-left: .3rem;
      }
    }

    .itemLabel {

    }
  }
}
</style>
