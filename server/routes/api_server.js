import { Router } from "express";

var router = Router();

/**
 * Get information about the server's current environment
 * @route GET /api/server/info
 * @group server - Information about the server
 * @returns {object} 200 - An object with error(false) + server info such as the port on which it is running
 * @returns {Error}  500 - Unexpected error
 */
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
