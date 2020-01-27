import { Router } from "express";
import { chain } from "underscore";

import * as shared from "../shared";

let router = Router();

router.get("/list", function(req, res, next) {
  res.json({
    error: false,
    users: chain(shared.users).map(function(user) {
      return {
        userId: user.userId,
        username: user.username,
        userColor: user.userColor
      };
    })
  });
});

export default router;
