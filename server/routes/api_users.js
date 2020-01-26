import { Router } from 'express';
import { users as _users } from '../shared';
import { chain } from 'underscore';

let router = Router();

router.get('/list', function (req, res, next) {
    res.json({
        error: false,
        users: chain(_users)
            .map(function (user) {
                return {
                    userId: user.userId,
                    username: user.username
                }
            }),
    });
});

export default router;
