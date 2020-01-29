import { Router } from "express";

let router = Router();

/* eslint-disable-next-line no-unused-vars */
router.get("/", function(req, res, next) {
  res.sendFile("public/index.html");
});

export default router;
