export const io = {};
export const users = {};
export let simulationId = undefined;
export const minInterval = 500; //500ms
export const maxInterval = 5000; //5000ms

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
