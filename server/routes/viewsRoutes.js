import { Router } from 'express';

let router = Router();

router.get('/', function(req, res, next) {
    res.sendFile('public/index.html');
});

export default router;
