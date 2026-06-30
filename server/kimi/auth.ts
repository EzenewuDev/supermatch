import * as cookie from "cookie";
import { Session } from "../../contracts/constants.js";
import { Errors } from "../../contracts/errors.js";
import { verifySessionToken } from "./session.js";
import { findUserById, findUserByEmail, createUser, updateLastSignIn, assignUserRole } from "../queries/users.js";
import { createHash } from "crypto";

// Simple hash function (NOT PRODUCTION READY - just for demo)
function simpleHash(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

function simpleCompare(password: string, hash: string): boolean {
  const hashedPassword = simpleHash(password);
  return hashedPassword === hash;
}

export async function authenticateRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    console.warn("[auth] No session cookie found in request.");
    throw Errors.forbidden("Invalid authentication token.");
  }
  const claim = await verifySessionToken(token);
  if (!claim) {
    throw Errors.forbidden("Invalid authentication token.");
  }
  const user = await findUserById(claim.userId);
  if (!user) {
    throw Errors.forbidden("User not found. Please re-login.");
  }
  return user;
}

export async function signupUser(
  name: string,
  email: string,
  password: string,
  role: "student" | "supervisor",
) {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }
  const passwordHash = simpleHash(password);
  const result = await createUser({
    name,
    email,
    passwordHash,
  });
  const userId = result.insertedId;
  await assignUserRole(userId, role);
  await updateLastSignIn(userId);
  const user = await findUserById(userId);
  if (!user) throw new Error("Failed to create user");
  return user;
}

export async function loginUser(
  email: string,
  password: string,
) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("Invalid email or password");
  }
  if (!user.passwordHash) {
    throw new Error("Invalid email or password");
  }
  const isValid = simpleCompare(password, user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid email or password");
  }
  await updateLastSignIn(user.id);
  return user;
}
