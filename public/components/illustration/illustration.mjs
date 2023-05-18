import { store } from '../../store.mjs'

const illustrationComponent = {
  props: ['image'],
  template: `<div class="illustration">
  <img
    v-if="store.illustrationUrl"
    :src="store.illustrationUrl"
  />

  <div class="lds-dual-ring">
  </div>
</div>
`,
  setup: function() {
    return {
      store,
    };
  },
};

export { illustrationComponent };
