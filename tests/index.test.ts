import { getHello } from "../src/index";

describe("index module", () => {
  test("getHello works", () => {
    expect(getHello("Foo")).toBe("Hello Foo!");
  });
});
