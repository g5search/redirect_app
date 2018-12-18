const app = require("../../app/lib/index");
const request = require("supertest");

describe("GET wildcard.com", () => {
  test("host is equal to root domain", async () => {
    request(app)
      .get("/wildcard/test/subdir")
      .set("Host", "wildcard.com")
      .expect(301);
  });
});

describe("GET wildcard.com", () => {
  test("no redirect configured", async () => {
    request(app)
      .get("/")
      .set("Host", "www.wildcard.com")
      .expect(404);
  });
});

describe("GET loop.com", () => {
  test("Redirect Loop", async () => {
    request(app)
      .get("/")
      .set("Host", "loop.com")
      .set("Protocol", "http")
      .expect(200)
      .then();
  });
});
