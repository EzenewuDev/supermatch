import { z } from "zod";
import { createRouter, adminQuery } from "./middleware.js";
import {
  findAllStudents,
  findStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentCount,
  getAllocatedCount,
  getUnallocatedCount,
  getDepartments,
  getLevels,
} from "./queries/students.js";
import {
  findAllSupervisors,
  findSupervisorById,
  createSupervisor,
  updateSupervisor,
  deleteSupervisor,
  getSupervisorCount,
  getLoadDistribution,
} from "./queries/supervisors.js";
import {
  findAllAllocations,
  getFirstPreferenceRate,
  getRecentAllocations,
  runAllocationAlgorithm,
  exportAllocationsToCSV,
} from "./queries/allocations.js";

export const adminRouter = createRouter({
  dashboard: createRouter({
    kpis: adminQuery.query(async () => {
      const [totalStudents, allocated, unallocated, totalSupervisors, firstPrefRate] =
        await Promise.all([
          getStudentCount(),
          getAllocatedCount(),
          getUnallocatedCount(),
          getSupervisorCount(),
          getFirstPreferenceRate(),
        ]);

      return {
        totalStudents,
        allocated,
        unallocated,
        totalSupervisors,
        firstPreferenceRate: firstPrefRate,
      };
    }),

    loadDistribution: adminQuery.query(async () => {
      return getLoadDistribution();
    }),

    recentAllocations: adminQuery.query(async () => {
      return getRecentAllocations(10);
    }),
  }),

  students: createRouter({
    list: adminQuery
      .input(
        z
          .object({
            page: z.number().int().min(1).optional(),
            limit: z.number().int().min(1).max(100).optional(),
            search: z.string().optional(),
            department: z.string().optional(),
            level: z.string().optional(),
            status: z.string().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return findAllStudents({
          page: input?.page,
          limit: input?.limit,
          search: input?.search,
          department: input?.department,
          level: input?.level,
          status: input?.status,
        });
      }),

    get: adminQuery
      .input(z.object({ id: z.number().int() }))
      .query(async ({ input }) => {
        return findStudentById(input.id);
      }),

    create: adminQuery
      .input(
        z.object({
          studentId: z.string().min(1).max(50),
          name: z.string().min(1).max(255),
          cgpa: z.number().min(0).max(4),
          department: z.string().min(1).max(100),
          level: z.string().min(1).max(20),
        })
      )
      .mutation(async ({ input }) => {
        return createStudent({
          studentId: input.studentId,
          name: input.name,
          cgpa: input.cgpa,
          department: input.department,
          level: input.level,
        });
      }),

    update: adminQuery
      .input(
        z.object({
          id: z.number().int(),
          studentId: z.string().min(1).max(50).optional(),
          name: z.string().min(1).max(255).optional(),
          cgpa: z.number().min(0).max(4).optional(),
          department: z.string().min(1).max(100).optional(),
          level: z.string().min(1).max(20).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData: Record<string, unknown> = {};
        if (data.studentId) updateData.studentId = data.studentId;
        if (data.name) updateData.name = data.name;
        if (data.cgpa !== undefined) updateData.cgpa = String(data.cgpa);
        if (data.department) updateData.department = data.department;
        if (data.level) updateData.level = data.level;
        return updateStudent(id, updateData);
      }),

    delete: adminQuery
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        await deleteStudent(input.id);
        return { success: true };
      }),

    import: adminQuery
      .input(
        z.object({
          csvData: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        const lines = input.csvData.trim().split("\n");
        const errors: string[] = [];
        let imported = 0;

        // Skip header if present
        const startIndex =
          lines[0].toLowerCase().includes("studentid") ||
          lines[0].toLowerCase().includes("name")
            ? 1
            : 0;

        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
          if (cols.length < 5) {
            errors.push(`Row ${i + 1}: Insufficient columns`);
            continue;
          }

          const [studentId, name, cgpaStr, department, level] = cols;
          const cgpa = parseFloat(cgpaStr);

          if (!studentId || !name || isNaN(cgpa) || !department || !level) {
            errors.push(`Row ${i + 1}: Invalid data`);
            continue;
          }

          if (cgpa < 0 || cgpa > 4) {
            errors.push(`Row ${i + 1}: CGPA must be between 0 and 4`);
            continue;
          }

          try {
            await createStudent({
              studentId,
              name,
              cgpa: cgpa,
              department,
              level,
            });
            imported++;
          } catch {
            errors.push(`Row ${i + 1}: Failed to insert`);
          }
        }

        return { imported, errors };
      }),

    meta: adminQuery.query(async () => {
      const [departments, levels] = await Promise.all([
        getDepartments(),
        getLevels(),
      ]);
      return { departments, levels };
    }),
  }),

  supervisors: createRouter({
    list: adminQuery.query(async () => {
      return findAllSupervisors();
    }),

    get: adminQuery
      .input(z.object({ id: z.number().int() }))
      .query(async ({ input }) => {
        return findSupervisorById(input.id);
      }),

    create: adminQuery
      .input(
        z.object({
          name: z.string().min(1).max(255),
          department: z.string().min(1).max(100),
          maxStudents: z.number().int().min(1).max(10).default(5),
        })
      )
      .mutation(async ({ input }) => {
        return createSupervisor({
          name: input.name,
          department: input.department,
          maxStudents: input.maxStudents,
          currentLoad: 0,
          isAvailable: true,
        });
      }),

    update: adminQuery
      .input(
        z.object({
          id: z.number().int(),
          name: z.string().min(1).max(255).optional(),
          department: z.string().min(1).max(100).optional(),
          maxStudents: z.number().int().min(1).max(10).optional(),
          isAvailable: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateSupervisor(id, data);
      }),

    delete: adminQuery
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        await deleteSupervisor(input.id);
        return { success: true };
      }),
  }),

  allocate: createRouter({
    run: adminQuery.mutation(async () => {
      return runAllocationAlgorithm();
    }),

    results: adminQuery
      .input(
        z
          .object({
            filter: z.enum(["all", "allocated", "unallocated"]).optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return findAllAllocations(input?.filter || "all");
      }),

    export: adminQuery
      .input(
        z.object({
          format: z.enum(["csv", "json"]).default("csv"),
        })
      )
      .query(async ({ input }) => {
        if (input.format === "csv") {
          return exportAllocationsToCSV();
        }
        // JSON format
        const results = await findAllAllocations("all");
        return JSON.stringify(results, null, 2);
      }),
  }),
});
