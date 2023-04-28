<template>
  <tr class="observationEntryDetailed" @click="activateThing" :class="{'active': activated, 'affectedCurrent': affectedByCurrentAnnot, 'affectedActive': affectedByActiveAnnot}" :data-level="this.level" :title="type + ': ' + uri" :data-id="uri">
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
      <i class="icon icon-edit" v-if="!isCurrent && activated && usersOwnThing" @click.stop="startEditing" title="edit observation"></i>
      <i class="icon icon-cross" v-if="isCurrent" @click.stop="discardChanges" title="cancel changes"></i>
      <i class="icon icon-check" v-if="isCurrent" @click.stop="saveChanges" title="save changes"></i>
    </td>
    <td class="resp" :title="resp">
      <i v-if="usersOwnThing" class="icon icon-people"></i>
    </td>
    <td class="showDetails">
      <i class="icon icon-search" @click.stop="showLD"></i>
    </td>
  </tr>
</template>

<script>
import {
  asUrl,
  createSolidDataset,
  setThing,
  getUrl,
  getStringNoLocale,
  solidDatasetAsTurtle
} from '@inrupt/solid-client'
import { prefix as pref } from '@/meld/prefixes.js'
import { getChildType } from '@/store/tools/solidHelpers.js'
import { bithTypes, displayPrefixes } from '@/meld/constants.js'

export default {
  name: 'ObservationEntryDetailed',
  components: {

  },
  props: {
    thing: Object,
    type: String,
    level: Number
  },
  computed: {
    uri: function () {
      const baseUrl = this.$store.getters.dataBaseUrl
      const url = asUrl(this.thing, baseUrl)
      return url
    },
    usersOwnThing: function () {
      const creator = getUrl(this.thing, pref.dct + 'creator')
      const user = this.$store.getters.solidId
      return creator === user
    },
    activated: function () {
      return this.$store.getters.activeThingIDByType(this.type) === this.uri
    },
    currentThing: function () {
      const thing = this.$store.getters.currentThingByTypeAndID(this.type, this.uri)

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
      const children = this.$store.getters.childrenByTypeAndID(this.type, this.uri)
      return children
    },
    body: {
      get () {
        const body = getStringNoLocale(this.thing, pref.oa + 'bodyValue')

        return body
      },
      set (val) {
        this.$store.dispatch('changeCurrentDataObject', {
          type: 'observation',
          uri: this.uri,
          prop: pref.oa + 'bodyValue',
          method: 'setStringNoLocale',
          val
        })
      }
    },
    resp: function () {
      const user = getStringNoLocale(this.thing, pref.dct + 'creator')
      return user
    },
    affectedByCurrentAnnot: function () {
      const affectedArr = this.$store.getters.affectedByCurrentAnnot.observation
      return affectedArr.indexOf(this.uri) !== -1
    },
    affectedByActiveAnnot: function () {
      const affectedArr = this.$store.getters.affectedByActiveAnnot.observation
      return affectedArr.indexOf(this.uri) !== -1
    },
    ableToBeEdited: function () {
      const obj = this.$store.getters.ableToBeEdited
      const bool = obj.observation
      return bool
    }
  },
  methods: {
    activateThing: function (e) {
      // console.log('activating ' + this.type + ' ' + this.uri, e)
      if (e.target.localName === 'textarea') {
        return
      }

      if (!this.activated) {
        this.$store.dispatch('activateThing', this.uri)
      } else {
        this.$store.dispatch('deActivateThing', bithTypes.observation)
      }
      this.$store.dispatch('deActivateThing', bithTypes.musicalMaterial)
      this.$store.dispatch('deActivateThing', bithTypes.extract)
      this.$store.dispatch('deActivateThing', bithTypes.selection)
    },
    startEditing: function () {
      this.$store.dispatch('activateThing', this.uri)
      this.$store.dispatch('makeCurrent', this.thing) // { type: this.type, object: this.file })
    },
    saveChanges: function () {
      this.$store.dispatch('saveChanges')
    },
    discardChanges: function () {
      this.$store.dispatch('discardChanges')
    },
    add: function () {
      console.log('add this to current thing')
      this.$store.dispatch('toggleUriAtCurrentThing', { uri: this.uri, operation: 'add' })
    },
    remove: function () {
      console.log('remove this from current thing')
      this.$store.dispatch('toggleUriAtCurrentThing', { uri: this.uri, operation: 'remove' })
    },
    showLD: async function (e) {
      let ds = createSolidDataset()
      ds = setThing(ds, this.thing)

      const ttl = await solidDatasetAsTurtle(ds, { prefixes: displayPrefixes })
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
