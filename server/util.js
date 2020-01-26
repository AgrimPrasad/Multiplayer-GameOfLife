/**
 * Creates a 2D-Array Grid during runtime for
 * the website to use for most operations.
 */
export let cellCalc = function(grid) {
    for (let i = 0; i < grid.width; i++) {
        grid.gridList[i] = [];
        for (let j = 0; j < grid.height; j++) {
            grid.gridList[i][j] = { isAlive: false };
        }
    }

    return grid
}
