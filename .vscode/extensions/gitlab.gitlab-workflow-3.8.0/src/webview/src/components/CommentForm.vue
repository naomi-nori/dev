<script>
export default {
  props: {
    issuable: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      note: '',
      isSaving: false,
      isFailed: false,
      command: 'saveNote',
    };
  },
  computed: {
    buttonTitle() {
      return this.isSaving ? 'Saving...' : 'Comment';
    },
    canSubmit() {
      return !this.isSaving && this.note.length > 0;
    },
  },
  methods: {
    getNoteType() {
      return this.issuable.sha
        ? { type: 'merge_request', path: 'merge_requests' }
        : { type: 'issue', path: 'issues' };
    },
    addComment() {
      if (!this.canSubmit) {
        return;
      }

      const { issuable, note, command } = this;

      this.isSaving = true;
      this.isFailed = false;
      const noteType = this.getNoteType();
      window.vsCodeApi.postMessage({ command, issuable, note, noteType });
    },
    handleKeydown({ key, ctrlKey, shiftKey, metaKey, altKey }) {
      if (key === 'Enter' && (ctrlKey || metaKey) && !shiftKey && !altKey) {
        this.addComment();
      }
    },
  },
  mounted() {
    window.addEventListener('message', event => {
      if (event.data.type === 'noteSaved') {
        if (event.data.status !== false) {
          this.note = '';
        } else {
          this.isFailed = true;
        }

        this.isSaving = false;
      }
    });
  },
};
</script>

<template>
  <div class="main-comment-form">
    <textarea v-model="note" @keydown="handleKeydown" placeholder="Write a comment..." />
    <button @click="addComment" :disabled="!canSubmit">
      {{ buttonTitle }}
    </button>
    <span v-if="isFailed">Failed to save your comment. Please try again.</span>
  </div>
</template>

<style lang="scss">
.main-comment-form {
  margin: 20px 0 30px 0;

  textarea {
    width: 100%;
    min-height: 140px;
    border-radius: 4px;
    padding: 16px;
    font-size: 13px;
    box-sizing: border-box;
    border: 1px solid var(--vscode-input-border);
    resize: vertical;
    margin-bottom: 8px;

    &:focus {
      outline: 0;
      border-color: var(--vscode-focusBorder);
      box-shadow: 0 0 0 0.2rem var(--vscode-widget-shadow);
    }
  }

  button {
    background-color: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border-color: var(--vscode-button-background);
    border-radius: 3px;
    padding: 6px 10px;
    font-size: 14px;
    outline: 0;
    margin-right: 10px;
    cursor: pointer;

    &:disabled {
      opacity: 0.9;
      cursor: default;
    }

    &:hover {
      background-color: var(--vscode-button-hoverBackground);
      border-color: var(--vscode-button-hoverBackground);
    }
  }
}
</style>
