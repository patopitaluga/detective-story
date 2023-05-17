import { store } from '../../store.mjs'

const notebookComponent = {
  template: `<div class="notebook">
  <div v-html="store.notepadText"></div>
</div>`,
  setup: function() {
    return {
      store,
    };
  },
};

export { notebookComponent };
