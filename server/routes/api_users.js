import { Router } from "express";
import { chain } from "underscore";

import * as shared from "../shared";

let router = Router();

/**
 * Get a list of users currently connected to the server
 * @route GET /api/users/list
 * @group users - Operations related to users
 * @returns {object} 200 - An object with error(false) + user count + users array of user IDs, usernames and colors
 * @returns {Error}  500 - Unexpected error
 */
/* eslint-disable-next-line no-unused-vars */
router.get("/list", function(req, res, next) {
  res.json({
    error: false,
    users: chain(shared.users).map(function(user) {
      return {
        userId: user.userId,
        username: user.username,
        userColor: user.userColor
      };
    }),
    userCount: Object.keys(shared.users).length
  });
});

export default router;
