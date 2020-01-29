import { Router } from "express";

let router = Router();

/**
 * Get the homepage of the server
 * Only links to the API docs page
 * @route GET /
 * @group home - Server Homepage
 * @produces text/html
 * @returns {html} 200 - text body
 * @returns {Error}  500 - Unexpected error
 */
/* eslint-disable-next-line no-unused-vars */
router.get("/", function(req, res, next) {
  res.sendFile("static/index.html", { root: "./server" });
});

export default router;
