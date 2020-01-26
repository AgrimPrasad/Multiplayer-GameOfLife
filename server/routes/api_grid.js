import { Router } from 'express';
import shortid from 'shortid';
import { grid as _grid, simulationId, io } from '../shared';

let router = Router();

router.get('/current', function(req, res, next) {
    res.json({
        error: false,
        grid: _grid,
        running: (simulationId != undefined)
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
     * @return {number} neighbours - amount of neighbours
     */
    let _getNeighbours = function(posX, posY) {
        let neighbours = 0;
        if (posX <= _grid.width && posY <= _grid.height) {
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
                        newX < _grid.width &&
                        newY >= 0 &&
                        newY < _grid.height &&
                        _grid.gridList[posX + offsetX][posY + offsetY].isAlive == true
                    ) {
                        neighbours++;
                    }
                }
            }
        }
        return neighbours;
    };

    /**
     * Returns the amount of live neighbours for
     * a specific cell on the grid.
     *
     * @param {number} posX - the x position
     * @param {number} posY - the Y position
     * @return {number} neighbours - amount of neighbours
     */
    let _countLiveNeighbors = function(row, col, grid) {
    	let count = 0;

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                let neighborRow = row + i;
                let neighborColumn = col + j;

                // The cell itself is not a neighbor
                if (i == 0 && j == 0) {
                    continue;
                }

                // Border cases
                if ((neighborRow == -1) || (neighborRow == _grid.width) || (neighborColumn == -1) || (neighborColumn == _grid.height)) {
                    continue;
                }

                // We've found a live neighbor
                if (grid[neighborRow][neighborColumn]) {
                	count++;
                }
            }
        }

        return count;
    }

    // Start simulation
    simulationId = setInterval(function() {
        // Backup current grid
        let backup = _grid.cells.map(function(arr) {
                return arr.slice();
        });

        // Review rules for each cell
        for (let i = 0; i < _grid.width; i++) {
            for (let j = 0; j < _grid.height; j++) {
                let liveNeighborsCount = _countLiveNeighbors(i, j, backup);

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