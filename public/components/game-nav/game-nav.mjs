const gameNavComponent = {
  template: `<nav class="game-nav">
  <button
    class="game-nav__button game-nav__button--chat"
    @click="$emit('changenav', 1)"
  >
  </button>
  <button
    class="game-nav__button game-nav__button--notebook"
    @click="$emit('changenav', 2)"
  >
  </button>
  <button
    class="game-nav__button game-nav__button--travel"
    @click="$emit('changenav', 3)"
  >
  </button>
</nav>`
};

export { gameNavComponent };
