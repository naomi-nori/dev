<script>
import UserAvatar from './UserAvatar';
import NoteBody from './NoteBody';
import Date from './Date';

export default {
  name: 'Note',
  props: {
    noteable: {
      type: Object,
      required: true,
    },
  },
  components: {
    UserAvatar,
    NoteBody,
    Date,
  },
  computed: {
    author() {
      return this.noteable.author;
    },
  },
};
</script>

<template>
  <li class="note">
    <div class="timeline-entry-inner">
      <div class="timelineIcon">
        <user-avatar :user="author" :size="40" :show-username="false" />
      </div>
      <div class="timelineContent">
        <div class="note-header">
          <user-avatar :user="author" :size="40" :show-avatar="false" style="margin-right: 2px;" />
          ·
          <date :date="noteable.created_at" style="margin-left: 2px;" />
        </div>
        <note-body :note="noteable" />
      </div>
    </div>
  </li>
</template>

<style lang="scss">
.note {
  border: 1px solid;
  border-color: var(--vscode-panel-border);
  border-radius: 4px;
  padding: 16px;
  margin: 16px 0;
  background: var(--vscode-editor-background);
  box-sizing: border-box;
  display: block;
  position: relative;

  .timeline-entry-inner {
    position: relative;
  }

  .timelineIcon {
    float: left;
    position: relative;
  }

  .timelineContent {
    position: relative;
  }

  .note-header {
    display: flex;
    min-height: 29px;
  }

  .note-body {
    display: block;
  }

  table:not(.code) {
    margin: 16px 0;
    border: 0;
    width: auto;
    display: block;
    overflow-x: auto;
    border-collapse: collapse;
  }

  table:not(.code) tbody td {
    border: 1px solid;
    border-color: var(--vscode-panel-border);
    border-collapse: collapse;
    border-image-repeat: stretch;
    padding-bottom: 10px;
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 10px;
    text-align: start;
    text-size-adjust: 100%;
    vertical-align: middle;
    box-sizing: border-box;
  }

  table:not(.code) thead th {
    border-bottom: 2px solid;
    border-right: 1px solid;
    border-left: 1px solid;
    border-top: 1px solid;
    border-color: var(--vscode-panel-border);
    border-collapse: collapse;
    border-image-repeat: stretch;
    padding-bottom: 10px;
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 10px;
    text-align: start;
    text-size-adjust: 100%;
    vertical-align: middle;
    box-sizing: border-box;
  }
}
</style>
