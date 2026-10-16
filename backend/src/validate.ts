/**
 * @module validate
 * Shared request-validation helpers used by all route handlers.
 */
import { Response } from "express";

/**
 * Checks that every field in `fields` is present (non-null, non-undefined) in `body`.
 * If any field is missing, responds with HTTP 400 and a descriptive error message,
 * then returns `false` so the caller can early-exit.
 *
 * @param body   - The parsed `req.body` object.
 * @param fields - List of required field names.
 * @param res    - Express response object used to send the 400 reply.
 * @returns `true` when all fields are present, `false` when validation fails.
 */
export function requireFields(
  body: Record<string, unknown>,
  fields: string[],
  res: Response,
): boolean {
  const missing = fields.filter(
    (f) => body[f] === undefined || body[f] === null,
  );
  if (missing.length > 0) {
    // Respond with the list of missing fields to help API consumers debug quickly.
    res
      .status(400)
      .json({ error: `Champs requis manquants : ${missing.join(", ")}` });
    return false;
  }
  return true;
}
