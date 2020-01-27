export const io = {};
export const users = {};
export let simulationId = undefined;
export const grid = {
    width: 46,
    height: 20,
    cellCount: 920,
    gridList: []
};
export let currentTick = 0;
export let cellsAlive = 0;
export let cellsCreated = 0;
export const minInterval = 500; //500ms
export const maxInterval = 5000; //5000ms
