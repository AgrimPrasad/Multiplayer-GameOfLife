import { Router } from 'express';

var router = Router();

router.get('/info', function(req, res, next) {

    res.json({
        error: false,
        serverInfo: {
            port: process.env.PORT || 3000
        }
    });
});

export default router;
