import http from "http";
import request from "supertest";
import * as shared from "../server/shared";
import app from "../server/app";

const port = 3002;
let server;

beforeAll(done => {
  server = http.createServer(app);
  server.listen({ port }, done);
});

afterAll(done => {
  server.close(done);
});

afterEach(() => {
  // reset shared grid after each test
  shared.grid = {
    width: 46,
    height: 20,
    cellCount: 920,
    cellsAlive: 0,
    cellsCreated: 0,
    currentSpeed: 100,
    currentTick: 0,
    gridList: []
  };
});

describe("Get Endpoints", () => {
  it("should get the correct current state of the grid", async () => {
    shared.grid.cellsAlive = 2;

    const res = await request(app).get("/api/grid/current");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("error");
    expect(res.body).toHaveProperty("grid");
    expect(res.body).toHaveProperty("isRunning");
    expect(res.body.error).toBeFalsy();
    expect(res.body.isRunning).toBeFalsy();
    expect(res.body.grid.width).toEqual(46);
    expect(res.body.grid.height).toEqual(20);
    expect(res.body.grid.cellCount).toEqual(920);
    expect(res.body.grid.cellsAlive).toEqual(2);
  });
});
