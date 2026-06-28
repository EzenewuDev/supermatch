import { createRouter, authedQuery } from "./middleware.js";
import { findSupervisorWithStudents } from "./queries/supervisors.js";
import { getDb } from "./queries/connection.js";
import { supervisors } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const supervisorRouter = createRouter({
  dashboard: authedQuery.query(async ({ ctx }) => {
    const db = getDb();

    // Find supervisor for this user
    const supervisorRows = await db
      .select()
      .from(supervisors)
      .where(eq(supervisors.userId, ctx.user.id))
      .limit(1);

    let supervisor = supervisorRows[0];
    if (!supervisor) {
      // Demo fallback: get first supervisor
      const allSupervisors = await db
        .select()
        .from(supervisors)
        .orderBy(supervisors.id)
        .limit(1);
      supervisor = allSupervisors[0];
    }

    if (!supervisor) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Supervisor record not found",
      });
    }

    const result = await findSupervisorWithStudents(supervisor.id);
    if (!result) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Supervisor data not found",
      });
    }

    return {
      supervisor: {
        id: result.id,
        name: result.name,
        department: result.department,
        maxStudents: result.maxStudents,
        currentLoad: result.currentLoad,
        isAvailable: result.isAvailable,
        remainingSlots: result.maxStudents - result.currentLoad,
      },
      assignedStudents: result.assignedStudents || [],
    };
  }),

  updateSettings: authedQuery
    .input(
      z.object({
        maxStudents: z.number().int().min(1).max(20),
        isAvailable: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Find supervisor for this user
      const supervisorRows = await db
        .select()
        .from(supervisors)
        .where(eq(supervisors.userId, ctx.user.id))
        .limit(1);

      let supervisor = supervisorRows[0];
      if (!supervisor) {
        // Demo fallback
        const allSupervisors = await db
          .select()
          .from(supervisors)
          .orderBy(supervisors.id)
          .limit(1);
        supervisor = allSupervisors[0];
      }

      if (!supervisor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Supervisor record not found",
        });
      }

      await db
        .update(supervisors)
        .set({
          maxStudents: input.maxStudents,
          isAvailable: input.isAvailable,
        })
        .where(eq(supervisors.id, supervisor.id));

      return { success: true };
    }),
});
