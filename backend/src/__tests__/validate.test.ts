import { requireFields } from "../validate";
import { Response } from "express";

function mockRes() {
  const res = {
    statusCode: 200,
    body: null as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: unknown) {
      this.body = data;
      return this;
    },
  };
  return res as unknown as Response & { statusCode: number; body: unknown };
}

describe("requireFields", () => {
  it("returns true when all required fields are present", () => {
    const res = mockRes();
    const result = requireFields({ a: 1, b: "hello" }, ["a", "b"], res);
    expect(result).toBe(true);
  });

  it("returns false and sends 400 when a field is missing", () => {
    const res = mockRes();
    const result = requireFields({ a: 1 }, ["a", "b"], res);
    expect(result).toBe(false);
    expect(res.statusCode).toBe(400);
    expect((res.body as { error: string }).error).toMatch(/b/);
  });

  it("returns false when a field is null", () => {
    const res = mockRes();
    const result = requireFields({ a: null }, ["a"], res);
    expect(result).toBe(false);
    expect(res.statusCode).toBe(400);
  });

  it('returns true when all fields have falsy-but-defined values (0, false, "")', () => {
    const res = mockRes();
    const result = requireFields(
      { a: 0, b: false, c: "" },
      ["a", "b", "c"],
      res,
    );
    // '' and 0 and false are not null/undefined — should pass
    expect(result).toBe(true);
  });
});
