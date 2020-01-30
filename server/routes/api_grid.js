import { Router } from "express";
import * as shared from "../shared";
import * as util from "../util";

let router = Router();

/**
 * Get the current state of the grid
 * @route GET /api/grid/current
 * @group grid - Operations about the grid of cells
 * @returns {object} 200 - An object with error(false) + current cell grid object + simulation running status
 * @returns {Error}  500 - Unexpected error
 */
/* eslint-disable-next-line no-unused-vars */
router.get("/current", function(req, res, next) {
  res.json({
    error: false,
    grid: shared.grid,
    isRunning: shared.simulationId != undefined
  });
});

/**
 * Start the simulation if not started yet.
 * userStartedSimulation event is broadcast using socket.io
 * @route POST /api/grid/start
 * @group grid - Operations about the grid of cells
 * @param {string} socketID.body.required - socket ID from socket.io client connection
 * @param {number} interval.body.required - interval (in ms) to run the simulation at
 * @returns {object} 200 - An object with error (if any)
 * @returns {Error}  500 - Unexpected error
 */
router.post("/start", function(req, res, next) {
  // user populated in response by middleware
  if (!res.user) {
    return next(new Error("socketId not found in list of users"));
  }

  // a simulation is already running
  if (shared.simulationId) {
    res.json({
      error: false
    });

    return;
  }

  if (!req.body.interval) {
    return next(new Error("no interval defined in body of /start request"));
  }

  const interval = parseInt(req.body.interval);
  if (interval < shared.minInterval || interval > shared.maxInterval) {
    return next(
      new Error(
        "invalid interval query param in /start request:",
        req.body.interval
      )
    );
  }

  let message = {
    messageType: "userStartedSimulation",
    timestamp: new Date(),
    user: {
      userId: res.user.userId,
      username: res.user.username,
      userColor: res.user.userColor
    }
  };

  // Start simulation
  shared.simulationId = setInterval(util.startSimulation, interval);

  // Broadcast message
  shared.io.sockets.emit("userStartedSimulation", {
    message: message
  });

  res.json({
    error: false
  });
});

/**
 * Pause the simulation if started already.
 * userPausedSimulation event is broadcast using socket.io
 * @route POST /api/grid/pause
 * @group grid - Operations about the grid of cells
 * @param {string} socketID.body.required - socket ID from socket.io client connection
 * @returns {object} 200 - An object with error (if any)
 * @returns {Error}  500 - Unexpected error
 */
router.post("/pause", function(req, res, next) {
  if (!res.user) {
    return next(new Error("socketId not found in list of users"));
  }

  if (!shared.simulationId) {
    res.json({
      error: false
    });

    return;
  }

  let message = {
    messageType: "userPausedSimulation",
    timestamp: new Date(),
    user: {
      userId: res.user.userId,
      username: res.user.username,
      userColor: res.user.userColor
    }
  };

  // Pause simulation
  clearInterval(shared.simulationId);
  shared.simulationId = undefined;

  // Broadcast message
  shared.io.sockets.emit("userPausedSimulation", {
    message: message
  });

  res.json({
    error: false
  });
});

/**
 * Change the grid state by registering a click on the grid
 * userClickedGrid event is broadcast using socket.io
 * @route POST /api/grid/click
 * @group grid - Operations about the grid of cells
 * @param {string} socketID.body.required - socket ID from socket.io client connection
 * @param {number} x.body.required - x coordinate of cell
 * @param {number} y.body.required - y coordinate of cell
 * @param {boolean} isAlive.body.required - whether the cell should become alive or dead
 * @returns {object} 200 - An object with error (if any)
 * @returns {Error}  500 - Unexpected error
 */
router.post("/click", function(req, res, next) {
  if (!res.user) {
    return next(new Error("socketId not found in list of users"));
  }

  const xPos = req.body.x;
  const yPos = req.body.y;
  const isAlive = req.body.isAlive;

  let message = {
    messageType: "userClickedGrid",
    timestamp: new Date(),
    user: {
      userId: res.user.userId,
      username: res.user.username,
      userColor: res.user.userColor
    },
    x: xPos,
    y: yPos,
    isAlive: isAlive
  };

  shared.grid = util.setCell(
    xPos,
    yPos,
    isAlive,
    res.user.userColor,
    shared.grid
  );

  // Broadcast message
  shared.io.sockets.emit("userClickedGrid", {
    message: message
  });

  res.json({
    error: false
  });
});

/**
 * Change the grid state by registering clicks on multiple cells on the grid (e.g. for pattern)
 * userClickedMultiple event is broadcast using socket.io
 * @route POST /api/grid/clicks
 * @group grid - Operations about the grid of cells
 * @param {string} socketID.body.required - socket ID from socket.io client connection
 * @param {object} cells.body.required - Array of modified cell objects with x, y and isAlive values for each cell
 * @returns {object} 200 - An object with error (if any)
 * @returns {Error}  500 - Unexpected error
 */
router.post("/clicks", function(req, res, next) {
  if (!res.user) {
    return next(new Error("socketId not found in list of users"));
  }

  const cells = req.body.cells;

  cells.forEach(cell => {
    const xPos = cell.x;
    const yPos = cell.y;
    const isAlive = cell.isAlive;

    shared.grid = util.setCell(
      xPos,
      yPos,
      isAlive,
      res.user.userColor,
      shared.grid
    );
  });

  let message = {
    messageType: "userClickedMultiple",
    timestamp: new Date(),
    user: {
      userId: res.user.userId,
      username: res.user.username,
      userColor: res.user.userColor
    },
    cells: cells
  };

  // Broadcast message
  shared.io.sockets.emit("userClickedMultiple", {
    message: message
  });

  res.json({
    error: false
  });
});

/**
 * Reset all cells on the grid and restart simulation
 * userResetGrid event is broadcast using socket.io
 * @route POST /api/grid/reset
 * @group grid - Operations about the grid of cells
 * @param {string} socketID.body.required - socket ID from socket.io client connection
 * @returns {object} 200 - An object with error (if any)
 * @returns {Error}  500 - Unexpected error
 */
router.post("/reset", function(req, res, next) {
  if (!res.user) {
    return next(new Error("socketId not found in list of users"));
  }

  const simulationWasRunning = !!shared.simulationId;

  //Pause simulation if running
  if (simulationWasRunning) {
    // Pause simulation
    clearInterval(shared.simulationId);
    shared.simulationId = undefined;
  }

  let message = {
    messageType: "userResetGrid",
    timestamp: new Date(),
    user: {
      userId: res.user.userId,
      username: res.user.username,
      userColor: res.user.userColor
    }
  };

  shared.grid = util.initCells(shared.grid);

  // Restart simulation if it was running before
  if (simulationWasRunning) {
    const interval = Math.round(100000 / shared.grid.currentSpeed);
    shared.simulationId = setInterval(util.startSimulation, interval);
  }

  // Broadcast message
  shared.io.sockets.emit("userResetGrid", {
    message: message
  });

  res.json({
    error: false
  });
});

/**
 * Change the timer interval for the simulation.
 * userChangedInterval event is broadcast using socket.io
 * @route POST /api/grid/interval
 * @group grid - Operations about the grid of cells
 * @param {string} socketID.body.required - socket ID from socket.io client connection
 * @param {number} interval.body.required - interval (in ms) to run the simulation at
 * @returns {object} 200 - An object with error (if any)
 * @returns {Error}  500 - Unexpected error
 */
router.post("/interval", function(req, res, next) {
  if (!res.user) {
    return next(new Error("socketId not found in list of users"));
  }

  if (!req.body.interval) {
    return next(new Error("no interval defined in body of /start request"));
  }

  const interval = parseInt(req.body.interval);
  if (interval < shared.minInterval || interval > shared.maxInterval) {
    return next(
      new Error(
        "invalid interval query param in /interval request:",
        req.body.interval
      )
    );
  }

  const simulationWasRunning = !!shared.simulationId;

  //Pause simulation if running
  if (simulationWasRunning) {
    // Pause simulation
    clearInterval(shared.simulationId);
    shared.simulationId = undefined;
  }

  let message = {
    messageType: "userChangedInterval",
    timestamp: new Date(),
    user: {
      userId: res.user.userId,
      username: res.user.username,
      userColor: res.user.userColor
    },
    interval: interval
  };

  shared.grid.currentSpeed = Math.round(100000 / interval);
  // Restart simulation if it was running before
  if (simulationWasRunning) {
    shared.simulationId = setInterval(util.startSimulation, interval);
  }

  // Broadcast message
  shared.io.sockets.emit("userChangedInterval", {
    message: message
  });

  res.json({
    error: false
  });
});

export default router;
