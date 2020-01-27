import { Router } from "express";
import shortid from "shortid";
import * as shared from "../shared";
import * as util from "../util";

let router = Router();

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
    return next(new Error("no interval query param defined in /start request"));
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
  shared.simulationId = setInterval(function() {
    // Backup current grid and grid list
    let backupGridList = shared.grid.gridList.map(function(arr) {
      return arr.slice();
    });

    let backupGrid = {};
    Object.assign(backupGrid, shared.grid);
    backupGrid.gridList = backupGridList;

    // update backup grid for latest tick
    // and update shared grid thereafter
    backupGrid = util.update(backupGrid);
    shared.grid = backupGrid;
    shared.currentTick++;

    // Broadcast message
    shared.io.sockets.emit("gridUpdate", {
      grid: shared.grid
    });
  }, interval);

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
      username: res.user.username
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

  let message = {
    messageType: "userClickedGrid",
    timestamp: new Date(),
    user: {
      userId: res.user.userId,
      username: res.user.username
    },
    x: req.query.x,
    y: req.query.y
  };

  // Current value
  let currentValue = shared.grid.cells[req.query.x][req.query.y];

  // Toggle
  shared.grid.cells[req.query.x][req.query.y] = !shared.grid.cells[req.query.x][
    req.query.y
  ];

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

export default router;
