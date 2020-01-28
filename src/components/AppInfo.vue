<template>
  <div class="gameinfo">
    <h1 class="title">Game of Life - Multiplayer</h1>
    <h2 class="subtitle">
      Multiplayer implementation of John Conway's Game of Life built with
      Vue.js, Express and socket.io
    </h2>
    <hr />
    <div class="content">
      <h5 class="title is-5">About the game:</h5>
      <p>
        Created in 1970, John Horton Conway made this well known game also known
        as 'Life'. The game is automated and based on 4 rules that determine the
        status of all cells inside the grid. A cell can either be 'alive' or
        'dead'. Every turn (tick) rules get applied to all cells that are
        currently alive. Further Information can be found
        <a
          target="_blank"
          rel="noopener"
          href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life"
          >here</a
        >.
      </p>
      <br />
      <h5 class="title is-5">The rules:</h5>
      <ol>
        <li>
          You get assigned a random username and color on connection. You can
          also view a list of other connected users.
        </li>
        <li>
          Any live cell with fewer than two live neighbours dies, as if by
          <strong>under population</strong>.
        </li>
        <li>
          Any live cell with two or three neighbours lives on to the next
          generation.
        </li>
        <li>
          Any live cell with more than three live neighbours dies, as if by
          <strong>overpopulation</strong>.
        </li>
        <li>
          Any dead cell with exactly three live neighbours becomes a live cell,
          as if by <strong>reproduction</strong>. This cell's color is the
          average of its neighbours which revive it.
        </li>
      </ol>
      <br />
      <h5 class="title is-5">Controls</h5>
      <ul>
        <li>
          Click on any cell to make it alive. The cell will receive your user's
          color.
        </li>
        <li>
          Click and drag on the grid of cells to make multiple cells alive with
          your user's color.
        </li>
        <li>
          Click on the <strong>Play/Pause</strong> button to start or pause a
          simulation.
        </li>
        <li>
          Click on the <strong>Speed Up/Slow Down</strong> buttons to change the
          simulation speed.
        </li>
        <li>
          Click on the <strong>Reset</strong> button to clear the screen and
          restart a running simulation.
        </li>
        <li>
          Click on the <strong>Import</strong> button to display some
          interesting patterns on the screen.
        </li>
        <li>
          If you find an interesting pattern, you can click the
          <strong>Export</strong> button and copy the current pattern to the
          clipboard.
        </li>
      </ul>
      <br />
      <h5 class="title is-5">Credits</h5>
      <p>
        This project was inspired in various ways by the following existing
        projects:
      </p>
      <ul>
        <li>
          <a
            target="_blank"
            rel="noopener"
            href="https://github.com/Ijee/Game-of-Life-Vue2"
            >Ijee/Game-of-Life-Vue2</a
          >
          Vue based single-player implementation of the Game of Life. Much of
          the CSS styling and Vue component organization comes from here.
        </li>
        <li>
          <a
            target="_blank"
            rel="noopener"
            href="https://github.com/germanger/iosocket-game-of-life"
            >germanger/iosocket-game-of-life</a
          >
          socket.io and Angular.js based implementation of Game of Life. The
          Multi-player logic takes inspiration from this project.
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  created() {},
  methods: {}
};
</script>

<style>
.subtitle {
  color: grey;
}
hr {
  border: 1px solid #000;
}
</style>
