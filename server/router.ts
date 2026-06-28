import { authRouter } from "./auth-router.js";
import { studentRouter } from "./studentRouter.js";
import { supervisorRouter } from "./supervisorRouter.js";
import { adminRouter } from "./adminRouter.js";
import { createRouter, publicQuery } from "./middleware.js";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  student: studentRouter,
  supervisor: supervisorRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
