# Multiplayer-GameOfLife

Multiplayer Conway's Game of Life implemented with Vue.js, Node.js and socket.io

## Architecture

This implementation has the following high-level architecture:

### Client

Vue.js based app with socket.io client-side library.

Vue.js was chosen for the following reasons:

1. Mature client-side library with a lively ecosystem.

1. Simpler framework as compared to alternatives such as React. The core of the framework simply consists of HTML templating, component level scoped CSS and JavaScript for logic handling.

1. Standard tooling: Rather than the myriad of different library options present for alternatives such as React, most implementations use `vue-router` for client-side routing and `vuex` for state management.

socket.io was chosen due to the following features:

1. In-built connection/disconnection logic.

1. Connection resilience with transparent fallback from WebSocket to other polling techniques such as Ajax and long-polling.

### Server

Node.js (Express) based server with socket.io server-side library for handling communications between different players.

This choice was made due to socket.io being well integrated with the Node.js ecosystem.

### Tests

Tests are run using the [Jest](https://jestjs.io/) testing and mocking library, which was chosen due to it being an integrated framework for testing, mocking and asserting which works with both Vue.js and Express.js

1. To run both client and server tests, run `npm run test` which will trigger `jest`.

1. All test files are in the `__test__` directory. Note that currently, only a few tests have been added as smoke tests for both the client and server.

### CI/CD

The server is deployed on Heroku, while the client is deployed to Netlify. This ensures segregation of client and server code, while allowing us to deploy the client as a static app served with a built-in Netlify CDN.

#### Continuous Integration

Tests are run using GitHub Actions. The GitHub Actions steps are configured in `.github/workflows/workflow.yaml` and are used both for running tests and for deploying the backend app to Heroku.

The test step runs `npm test` using the `jest` library as mentioned in the `Tests` section above.

#### Backend Continuous Delivery

These are the Github Actions steps defined for deploying the backend to Heroku.

1. `Dockerfile` configured in the root of this repo is used to build a docker image for the server.

1. [Heroku Actions](https://github.com/actions/heroku) plugin is then used to push the built server image to the Heroku Container Registry.

1. The same plugin is then used to release the server image to the backend app.

#### Frontend Continuous Delivery

Frontend deployment to Netlify is configured using a `netlify.toml` file present at the root of this repo.

1. The client app is built using `npm run build-client` which triggers the `vue-cli-service` to build a static production site.

1. The static files are then deployed to Netlify using appropriate environment variables to configure the server address accessed by the frontend.

## Local Development

[TODO] Add steps on how to set up local environment for development, testing and deployment.

1. This repo follows the [Git Flow workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) with `master` branch used for production and `next` branch used as a development branch for integration testing.

1. Feature branches are branched from `next` usually, and pull requests are created towards `next`.

1. A merge to `next` branch results in deployment to a `stage` environment where testing is performed before deployment to production.

1. After integration testing has been performed, a pull request is opened from the `next` branch towards the `master` branch. Once this pull request is merged, the latest `master` changes are updated on production.

## Implementation Details

### Game Logic

#### Basic Conway's Game of Life Logic

1. Any live cell with fewer than two live neighbours dies, as if caused by under-population.

1. Any live cell with two or three live neighbours lives on to the next generation.

1. Any live cell with more than three live neighbours dies, as if by overcrowding.

1. Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

#### Client Logic

1. The game is implemented in ticks of 1-second interval. Every second, the state of the entire grid is re-evaluated based on new inputs received from different clients.

1. The browser connects to a Node.js API which allows multiple clients to share the same world-view.

1) When a user clicks anywhere on the grid, a live cell is created at that location with the user's colour. A given cell is associated with a single colour throughout its lifetime and dead cells are coloured white.

1) When a dead cell is revived, it is given a colour which is the mathematical average of its neighbours.

1) User connection/disconnection logic is handed off to socket.io + cookie handling of user details.

#### Server Logic

1. The server-side logic is implemented as a set of REST-ful API endpoints and socket.io pub-sub messages, which together provide functionality such as user management and grid state management.

1. Each client is assigned a unique nickname and colour on initial connection through socket.io

1. The list of users is broadcast to all clients, which then display this information on the frontend in real-time.

1. Events from the frontend (such as user clicks on the grid, the start of a simulation etc.) are all synchronised using socket.io pub-sub messages.

   1. In general, the flow of messages is `client creates event` -> emits the event to server -> server updates shared state if applicable (e.g. a list of users or active cells) -> server broadcasts the update to all users.

1. Client connection/disconnection events are handled using socket.io's built-in functionality to detect such events. Furthermore, care is taken on the client to sync the latest grid state and user list state immediately after reconnection.

## Limitations

1. Multi-cell updates (e.g. clicking on the `Random` button or loading patterns) doesn't take effect immediately on the frontend if a simulation is running and a new update comes in. Logic could be added to block new simulation updates after such updates.

1. The footer is not visible in the viewport on iPhone Safari and the user has to scroll down to view the footer. This issue is not present on common Android phones tested here and should be fixable using CSS media queries.

1. The drag functionality on the cell grid is limited to mouse events currently and doesn't work on mobile. A mobile touch-friendly library such as [vue-touch](https://alligator.io/vuejs/vue-touch-events/) could be used to respond to such mobile drag events.

1. Currently, the client and server code share the same `node_modules` dependencies, due to which the JS bundle on the client is quite big (almost 0.5 MB). Approaches to fix this include:

   1. Using a library such as [Lerna](https://lerna.js.org/) to change this repo into a mono-repo (aka multi-package repository), with separate client and server directories using some common dependencies where applicable.

## Extension Ideas

1. Document the API using [OpenAPI 3.0](https://swagger.io/docs/specification/about/) (previously known as Swagger).

1. Server scaling: The list of users and there associated metadata (such as username and colours) could be stored in a shared cache such as Redis. The same could be done for the global grid state.

   1. This way, each server instance becomes stateless by itself, with the actual state being stored/retrieved by each instance from Redis.
   1. Furthermore, redis locks can be used to prevent race conditions in updates with multiple instances.

1. User authentication could be implemented as an additional set of `user` endpoints. Unauthenticated users would not be able to access any grid-specific endpoints.

## Credits

This project was inspired in various ways by the following existing projects:

1. [Ijee/Game-of-Life-Vue2](https://github.com/Ijee/Game-of-Life-Vue2) Vue based implementation of the Game of Life. Much of the CSS styling and Vue component organization comes from here.

1. [germanger/iosocket-game-of-life](https://github.com/germanger/iosocket-game-of-life) socket.io and Angular.js based implementation of Game of Life. The Multi-player logic takes inspiration from this project.
