import { authRouter } from "./auth-router";
import { studentRouter } from "./studentRouter";
import { supervisorRouter } from "./supervisorRouter";
import { adminRouter } from "./adminRouter";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  student: studentRouter,
  supervisor: supervisorRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
