import { shallowMount } from "@vue/test-utils";
import Grid from "../src/components/Grid";

const gridFactory = (values = {}) => {
  return shallowMount(Grid, {
    data() {
      return {
        ...values
      };
    }
  });
};

describe("Grid", () => {
  let currentGridMockResp = {};
  beforeEach(() => {
    currentGridMockResp = {
      error: false,
      grid: {
        width: 1,
        height: 1,
        cellCount: 1,
        cellsAlive: 0,
        cellsCreated: 0,
        currentSpeed: 100,
        currentTick: 0,
        gridList: [[{ isAlive: false, color: "#ffffff" }]]
      },
      isRunning: true
    };

    // mock response for fetchCells
    fetch.mockResponse(JSON.stringify(currentGridMockResp));
  });

  afterEach(() => {
    fetch.resetMocks();
  });

  it("renders the correct markup", () => {
    const wrapper = gridFactory();
    expect(wrapper.html()).toContain('<div class="game-grid columns">');
  });

  it("should call the current grid endpoint after mounting", () => {
    const wrapper = gridFactory();
    expect(fetch.mock.calls.length).toEqual(1);
    expect(fetch.mock.calls[0][0]).toEqual("/api/grid/current");
  });
});
