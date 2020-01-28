import http from "http";
import shortid from "shortid";
import { chain } from "underscore";
import socketIO from "socket.io";

import app from "./app";
import * as shared from "./shared";
import * as util from "./util";

// started in separate file to more easily
// test the app
let server = http.createServer(app);
// Start server
server.listen(process.env.PORT || 3000);

// Initiate Socket.io using the same http server
// created above
shared.io = socketIO.listen(server);

// On a new connection event,
// create a new user
// and announce to all users
shared.io.sockets.on("connection", function(socket) {
  if (app.get("env") === "development") {
    console.log("client connected!");
  }

  var userId = shortid.generate();

  var user = {
    userId: userId,
    socketId: socket.id,
    username: userId,
    userColor: util.getUniqueColor()
  };

  shared.users[socket.id] = user;

  // Log
  var message = {
    messageType: "userConnected",
    timestamp: new Date(),
    user: {
      userId: user.userId,
      username: user.username,
      userColor: user.userColor
    }
  };

  // messages.push(message);

  // Respond to the connecting user
  socket.emit("welcome", user);

  // Broadcast to all users
  shared.io.sockets.emit("userConnected", {
    users: chain(shared.users).map(function(user) {
      return {
        userId: user.userId,
        username: user.username,
        userColor: user.userColor
      };
    }),
    message: message
  });

  // Handle disconnection immediately
  // Re-connect would be a new connection
  socket.on("disconnect", function() {
    if (app.get("env") === "development") {
      console.log("client disconnected!");
    }

    delete shared.users[socket.id];

    // Log
    var message = {
      messageType: "userDisconnected",
      timestamp: new Date(),
      user: {
        userId: user.userId,
        username: user.username,
        userColor: user.userColor
      }
    };

    // messages.push(message);

    // Broadcast disconnection to all users
    shared.io.sockets.emit("userDisconnected", {
      user: user,
      users: chain(shared.users).map(function(user) {
        return {
          userId: user.userId,
          username: user.username,
          userColor: user.userColor
        };
      }),
      message: message
    });
  });
});

console.log("Running...");
