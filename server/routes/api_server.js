import { Router } from "express";

var router = Router();

/* eslint-disable-next-line no-unused-vars */
router.get("/info", function(req, res, next) {
  res.json({
    error: false,
    serverInfo: {
      port: process.env.PORT || 3000
    }
  });
});

export default router;
