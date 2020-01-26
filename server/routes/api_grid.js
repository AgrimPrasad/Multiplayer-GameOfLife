import { Router } from 'express';
import shortid from 'shortid';
import { grid as _grid, simulationId, io } from '../shared';

let router = Router();

router.get('/current', function(req, res, next) {
    res.json({
        error: false,
        grid: _grid,
        isRunning: (simulationId != undefined)
    });
});

router.get('/start', function(req, res, next) {
    if (!res.user) {
        return next(new Error('socketId not found in list of users'));
    }
    
    if (simulationId) {
        res.json({
            error: false,
        });
        
        return;
    }
    
    let message = {
        messageType: 'userStartedSimulation',
        timestamp: new Date(),
        user: {
            userId: res.user.userId,
            username: res.user.username,
            userColor: res.user.userColor,
        }
    };
    
    /**
     * Returns the amount of neighbours for
     * a specific cell on the grid.
     *
     * @param {number} posX - the x position
     * @param {number} posY - the Y position
     * @param {array} grid - copy of the shared grid
     * @return {number} neighbours - amount of neighbours
     */
    let _getNeighbours = function(posX, posY, grid) {
        let neighbours = 0;
        if (posX <= grid.width && posY <= grid.height) {
            for (let offsetX = -1; offsetX < 2; offsetX++) {
                for (let offsetY = -1; offsetY < 2; offsetY++) {
                    let newX = posX + offsetX;
                    let newY = posY + offsetY;
                    // check if offset is:
                    // on current cell, out of bounds and if isAlive
                    // for cell true
                    if (
                        (offsetX != 0 || offsetY != 0) &&
                        newX >= 0 &&
                        newX < grid.width &&
                        newY >= 0 &&
                        newY < grid.height &&
                        grid.gridList[posX + offsetX][posY + offsetY].isAlive == true
                    ) {
                        neighbours++;
                    }
                }
            }
        }
        return neighbours;
    };

    // Start simulation
    simulationId = setInterval(function() {
        // Backup current grid
        let backup = _grid.gridList.map(function(arr) {
                return arr.slice();
        });

        // Review rules for each cell
        for (let i = 0; i < _grid.width; i++) {
            for (let j = 0; j < _grid.height; j++) {
                let liveNeighborsCount = _getNeighbours(i, j, backup);

                if (_grid.cells[i][j] == true) {
                    if (liveNeighborsCount < 2 || liveNeighborsCount > 3) {
                        _grid.cells[i][j] = false;
                    }
                }
                else {
                    if (liveNeighborsCount == 3) {
                        _grid.cells[i][j] = true;
                    }
                }
            }
        }
        
        // Broadcast message
        io.sockets.emit('gridUpdate', {
            grid: _grid
        });
        
    }, 1000);

    // Save message
    // messages.push(message);

    // Broadcast message
    io.sockets.emit('userStartedSimulation', {
        message: message
    });

    res.json({
        error: false
    });
});

router.get('/pause', function(req, res, next) {

    if (!res.user) {
        return next(new Error('socketId not found in list of users'));
    }
    
    if (!simulationId) {
        res.json({
            error: false
        });
        
        return;
    }
    
    let message = {
        messageType: 'userPausedSimulation',
        timestamp: new Date(),
        user: {
            userId: res.user.userId,
            username: res.user.username,
        }
    };

    // Pause simulation
    clearInterval(simulationId);
    simulationId = undefined;
    
    // Save message
    // messages.push(message);

    // Broadcast message
    io.sockets.emit('userPausedSimulation', {
        message: message
    });

    res.json({
        error: false
    });
});

router.get('/click', function(req, res, next) {

    if (!res.user) {
        return next(new Error('socketId not found in list of users'));
    }
    
    let message = {
        messageType: 'userClickedGrid',
        timestamp: new Date(),
        user: {
            userId: res.user.userId,
            username: res.user.username,
        },
        x: req.query.x,
        y: req.query.y
    };

    // Current value
    let currentValue = _grid.cells[req.query.x][req.query.y];
    
    // Toggle
    _grid.cells[req.query.x][req.query.y] = !_grid.cells[req.query.x][req.query.y];

    // Save message
    // messages.push(message);

    // Broadcast message
    io.sockets.emit('userClickedGrid', {
        message: message
    });

    res.json({
        error: false
    });
});

export default router;
