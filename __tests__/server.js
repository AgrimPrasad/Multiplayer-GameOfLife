import request from "supertest";
import * as shared from "../server/shared";
import app from "../server/app";

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
