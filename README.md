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

[TODO: Add testing information]

### CI/CD

This example can be deployed on Heroku.

[TODO: add more deployment details, including CI/CD etc.]

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

1. Each client is assigned a unique nickname and colour. This information is saved in a browser cookie the first time a user hits the API and is retrieved from the browser cookie on subsequent visits.

1. When a user clicks anywhere on the grid, a live cell is created at that location with the user's colour. A given cell is associated with a single colour throughout its lifetime and dead cells are coloured white.

1. When a dead cell is revived, it is given a colour which is the mathematical average of its neighbours.

1. User connection/disconnection logic is handed off to socket.io + cookie handling of user details.

#### Server Logic

1. The server-side logic is implemented as a set of REST-ful API endpoints, which provide functionality such as user management and grid state management.

#### Server API Documentation

The API is documented using [OpenAPI 3.0](https://swagger.io/docs/specification/about/) (previously known as Swagger) and is available at [TODO add link]

## Extension Ideas

1. For scaling the server, the list of users and there associated metadata (such as username and colours) could be stored in a shared cache such as Redis. The same could be done for the global grid state. This way, each server instance becomes stateless by itself, with the actual state being stored/retrieved by each instance from Redis.

1. User authentication could be implemented as an additional set of `user` endpoints. Unauthenticated users would not be able to access any grid-specific endpoints.

## Credits

This project was inspired in various ways by the following existing projects:

1. [Ijee/Game-of-Life-Vue2](https://github.com/Ijee/Game-of-Life-Vue2) Vue based implementation of the Game of Life. Much of the CSS styling and Vue component organization comes from here.

1. [germanger/iosocket-game-of-life](https://github.com/germanger/iosocket-game-of-life) socket.io and Angular.js based implementation of Game of Life. The Multi-player logic takes inspiration from this project.
