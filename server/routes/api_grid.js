import { Router } from "express";
import shortid from "shortid";
import * as shared from "../shared";
import * as util from "../util";

let router = Router();

// GET request to get the current state of the grid
// i.e. state of all cells, as well as whether
// the simulation is running
router.get("/current", function(req, res, next) {
  res.json({
    error: false,
    grid: shared.grid,
    isRunning: shared.simulationId != undefined
  });
});

// POST request to start simulation if not
// started already
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

  const currentSpeed = Math.round(100000 / interval);

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
  shared.simulationId = setInterval(
    util.startSimulation,
    interval,
    res.user.userColor
  );

  // Save message
  // messages.push(message);

  // Broadcast message
  shared.io.sockets.emit("userStartedSimulation", {
    message: message
  });

  res.json({
    error: false
  });
});

// POST request to pause simulation if
// started already
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

  // Save message
  // messages.push(message);

  // Broadcast message
  shared.io.sockets.emit("userPausedSimulation", {
    message: message
  });

  res.json({
    error: false
  });
});

// POST request to change grid state
// when a user clicks on the grid
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

  // Save message
  // messages.push(message);

  // Broadcast message
  shared.io.sockets.emit("userClickedGrid", {
    message: message
  });

  res.json({
    error: false
  });
});

// POST request to change grid state
// when a user clicks on multiple cells on the grid
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

  // Save message
  // messages.push(message);

  // Broadcast message
  shared.io.sockets.emit("userClickedMultiple", {
    message: message
  });

  res.json({
    error: false
  });
});

// POST request to reset grid state
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
    shared.simulationId = setInterval(
      util.startSimulation,
      interval,
      res.user.userColor
    );
  }

  // Save message
  // messages.push(message);

  // Broadcast message
  shared.io.sockets.emit("userResetGrid", {
    message: message
  });

  res.json({
    error: false
  });
});

// POST request to change timer interval
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
    shared.simulationId = setInterval(
      util.startSimulation,
      interval,
      res.user.userColor
    );
  }

  // Save message
  // messages.push(message);

  // Broadcast message
  shared.io.sockets.emit("userChangedInterval", {
    message: message
  });

  res.json({
    error: false
  });
});

export default router;
