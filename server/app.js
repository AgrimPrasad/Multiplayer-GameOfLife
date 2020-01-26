import { createServer } from 'http';
import express from 'express';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'body-parser';
import { generate } from 'shortid';
import randomColor from 'randomcolor';
import { chain } from 'underscore';

import { grid, io, users as _users } from './shared';
import { cellCalc } from './util';

export let app = express();
let server = createServer(app);

// A default engine is required, even though we render plain html
app.set('views', './public');
app.set('view engine', 'ejs');

// Initiate Grid at server startup
grid = cellCalc(grid);

// Initiate Socket.io using the same http server
// created above
io = require('socket.io').listen(server);

// On a new connection event,
// create a new user
// and announce to all users
io.sockets.on('connection', function (socket) {
    var userId = generate();

    var user = {
        userId: userId,
        socketId: socket.id,
        username: userId,
        userColor: randomColor()
    };

    _users[socket.id] = user;

    // Log
    var message = {
        messageType: 'userConnected',
        timestamp: new Date(),
        user: {
            userId: user.userId,
            username: user.username,
            userColor: user.userColor,
        }
    };

    // messages.push(message);

    // Respond to the connecting user
    socket.emit('Welcome', user);

    // Broadcast to all users
    io.sockets.emit('userConnected', {
        users: chain(_users)
            .map(function (user) {
                return {
                    userId: user.userId,
                    username: user.username,
                    userColor: user.userColor
                }
            }),
        message: message
    });

    // Handle disconnection immediately
    // Re-connect would be a new connection
    socket.on('disconnect', function () {

        delete _users[socket.id];

        // Log
        var message = {
            messageType: 'userDisconnected',
            timestamp: new Date(),
            user: {
                userId: user.userId,
                username: user.username,
                userColor: user.userColor,
            }
        };

        // messages.push(message);

        // Broadcast disconnection to all users
        io.sockets.emit('userDisconnected', {
            user: user,
            users: chain(_users)
                .map(function (user) {
                    return {
                        userId: user.userId,
                        username: user.username,
                        userColor: user.userColor,
                    }
                }),
            message: message
        });
    });
});

// Start server
server.listen(process.env.PORT || 3000);

// Middleware: app.use([path], f),
//    [path] is optional, default is '/'
//    f acts as a middleware function to be called when the path matches
// The order of which middleware are defined is important (eg. move logger down)
app.use('/', json());
app.use('/', urlencoded());
app.use('/', cookieParser('cookieSecret'));
app.use('/', logger('dev'));

// Custom middleware
// Executed in every "/api/.*" request, after all the previous app.use() have been executed,
app.use('/api/', function (req, res, next) {
    res.user = undefined;

    if (req.query.socketId != null) {
        res.user = _users[req.query.socketId];
    }

    next();
});

// Router
app.use('/', require('./routes/viewsRoutes').default);
app.use('/api/users', require('./routes/api_users').default);
app.use('/api/grid', require('./routes/api_grid').default);
app.use('/api/server', require('./routes/api_server').default);

app.use(function (err, req, res, next) {
    res.status(err.status || 500);

    res.json({
        error: true,
        message: err.message
    });
});

export default app;

console.log("Running...");
