import { Router } from "express";

let router = Router();

/* eslint-disable-next-line no-unused-vars */
router.get("/", function(req, res, next) {
  res.sendFile("static/index.html", { root: "./server" });
});

export default router;
