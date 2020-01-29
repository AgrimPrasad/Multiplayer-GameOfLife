import express from "express";
import logger from "morgan";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import compression from "compression";

import * as shared from "./shared";
import * as util from "./util";

let app = express();

// enable cors as client could be on a different server
// for a production application, domains should instead be selectively whitelisted for cors
app.use(cors());

// enable gzip compression
app.use(compression());

// A default engine is required, even though we render plain html
app.set("views", "./public");
app.set("view engine", "ejs");

// Initiate Grid at server startup
shared.grid = util.initCells(shared.grid);

// Middleware: app.use([path], f),
//    [path] is optional, default is '/'
//    f acts as a middleware function to be called when the path matches
// The order of which middleware are defined is important (eg. move logger down)
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser("cookieSecret"));
app.use(logger("dev"));

// Custom middleware
// Executed in every "/api/.*" request, after all the previous app.use() have been executed,
app.use("/api/", function(req, res, next) {
  res.user = undefined;

  if (req.method === "GET") {
    if (app.get("env") === "development") {
      /* eslint-disable-next-line no-console */
      console.log("in custom middleware, req.query:", req.query);
    }
    if (req.query.socketId != null) {
      res.user = shared.users[req.query.socketID];
    }
  } else if (req.method === "POST") {
    if (app.get("env") === "development") {
      /* eslint-disable-next-line no-console */
      console.log("in custom middleware, req.body:", req.body);
    }
    res.user = shared.users[req.body.socketID];
  }

  next();
});

// Router
app.use("/", require("./routes/viewsRoutes").default);
app.use("/api/users", require("./routes/api_users").default);
app.use("/api/grid", require("./routes/api_grid").default);
app.use("/api/server", require("./routes/api_server").default);

/* eslint-disable-next-line no-unused-vars */
app.use(function(err, req, res, next) {
  res.status(err.status || 500);

  res.json({
    error: true,
    message: err.message
  });
});

export default app;
