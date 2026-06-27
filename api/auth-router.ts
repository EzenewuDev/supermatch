import * as cookie from "cookie";
import { z } from "zod";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies.js";
import { createRouter, authedQuery, publicQuery } from "./middleware.js";
import { signupUser, loginUser } from "./kimi/auth.js";
import { signSessionToken } from "./kimi/session.js";

export const authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),
  signup: publicQuery
    .input(z.object({ name: z.string().min(1), email: z.string().email(), password: z.string().min(6) }))
    .mutation(async ({ ctx, input }) => {
      const user = await signupUser(input.name, input.email, input.password);
      const token = await signSessionToken({ userId: user.id });
      const opts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          httpOnly: opts.httpOnly,
          path: opts.path,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: Session.maxAgeMs / 1000,
        }),
      );
      return user;
    }),
  login: publicQuery
    .input(z.object({ email: z.string().email(), password: z.string().min(6) }))
    .mutation(async ({ ctx, input }) => {
      const user = await loginUser(input.email, input.password);
      const token = await signSessionToken({ userId: user.id });
      const opts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          httpOnly: opts.httpOnly,
          path: opts.path,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: Session.maxAgeMs / 1000,
        }),
      );
      return user;
    }),
  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
});
