<script>
import Note from './Note';
import icons from '../assets/icons';

export default {
  name: 'Discussion',
  props: {
    noteable: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isRepliesVisible: true,
    };
  },
  components: {
    Note,
  },
  computed: {
    initialDiscussion() {
      return this.noteable.notes[0];
    },
    replies() {
      return this.noteable.notes.slice(1);
    },
    hasReplies() {
      return this.replies.length > 0;
    },
    toggleRepliesText() {
      return this.isRepliesVisible ? 'Collapse replies' : 'Expand replies';
    },
    toggleRepliesIcon() {
      return this.isRepliesVisible ? this.chevronDownSvg : this.chevronRightSvg;
    },
  },
  methods: {
    toggleReplies() {
      this.isRepliesVisible = !this.isRepliesVisible;
    },
  },
  created() {
    this.chevronDownSvg = icons.chevronDown;
    this.chevronRightSvg = icons.chevronRight;
  },
};
</script>

<template>
  <div :class="{ collapsed: !isRepliesVisible }" class="discussion">
    <note :noteable="initialDiscussion" />
    <div v-if="hasReplies" @click="toggleReplies" class="toggle-widget">
      <span class="chevron" v-html="toggleRepliesIcon" /> {{ toggleRepliesText }}
    </div>
    <template v-if="isRepliesVisible">
      <note v-for="note in replies" :key="note.id" :noteable="note" />
    </template>
  </div>
</template>

<style lang="scss">
.discussion {
  margin-top: 16px;
  border: 1px solid;
  border-color: var(--vscode-panel-border);
  border-radius: 4px;
  background: var(--vscode-editor-background);

  &.collapsed {
    .toggle-widget {
      border-radius: 0 0 4px 4px;
    }
  }

  > .note {
    border: none;
    margin: 0;
  }

  .toggle-widget {
    background: var(--vscode-activityBar-dropBackground);
    padding: 8px 16px;
    cursor: pointer;
    user-select: none;
    position: relative;
  }

  .chevron svg {
    width: 10px;
    height: 10px;
  }
}
</style>
