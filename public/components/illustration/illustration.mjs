import { store } from '../../store.mjs'

const illustrationComponent = {
  props: ['image'],
  template: `<div class="illustration">
  <img
    v-if="store.illustrationUrl"
    :src="store.illustrationUrl"
  />
</div>
`,
  setup: function() {
    return {
      store,
    };
  },
};

export { illustrationComponent };
