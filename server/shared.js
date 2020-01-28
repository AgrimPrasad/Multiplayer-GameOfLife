export const io = {};
export const users = {};
export let simulationId = undefined;
export const minInterval = 1000; //1000ms
export const maxInterval = 10000; //10000ms

const width = 46;
const height = 20;
const cellCount = width * height;
export const grid = {
  width: width,
  height: height,
  cellCount: cellCount,
  cellsAlive: 0,
  cellsCreated: 0,
  currentSpeed: 100,
  currentTick: 0,
  gridList: []
};
