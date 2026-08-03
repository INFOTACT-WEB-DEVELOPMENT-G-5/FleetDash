const turf = require("@turf/turf");

describe("Geofence Turf logic", () => {
  test("detects point inside circle zone", () => {
    const center = turf.point([80.2707, 13.0827]);
    const circle = turf.circle(center, 2, { units: "kilometers" });
    const inside = turf.point([80.271, 13.083]);
    const outside = turf.point([80.5, 13.5]);

    expect(turf.booleanPointInPolygon(inside, circle)).toBe(true);
    expect(turf.booleanPointInPolygon(outside, circle)).toBe(false);
  });

  test("detects polygon enter/exit boundary", () => {
    const polygon = turf.polygon([
      [
        [76.95, 11.01],
        [76.96, 11.01],
        [76.96, 11.02],
        [76.95, 11.02],
        [76.95, 11.01],
      ],
    ]);

    expect(turf.booleanPointInPolygon(turf.point([76.955, 11.015]), polygon)).toBe(true);
    expect(turf.booleanPointInPolygon(turf.point([77.0, 11.0]), polygon)).toBe(false);
  });
});

describe("Telemetry parser shape", () => {
  test("parser returns numeric coordinates", async () => {
    const parseTelemetry = require("../workers/parser.worker");
    const result = await parseTelemetry({
      vehicleId: "FD-001",
      lat: "11.0168",
      lng: "76.9558",
      speed: "42",
      fuel: "80",
      status: "Active",
    });

    expect(result.vehicleId).toBe("FD-001");
    expect(typeof result.lat).toBe("number");
    expect(typeof result.lng).toBe("number");
    expect(result.speed).toBe(42);
  });
});
