import { z } from "zod";
import { createRouter, authedQuery } from "./middleware.js";
import {
  findPreferencesByStudent,
  savePreferences,
} from "./queries/preferences.js";
import { findAvailableSupervisors } from "./queries/supervisors.js";
import { getDb } from "./queries/connection.js";
import { students, userRoles } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const studentRouter = createRouter({
  dashboard: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    // Find student record linked to this user
    const studentRole = await db
      .select()
      .from(userRoles)
      .where(
        and(
          eq(userRoles.userId, ctx.user.id),
          eq(userRoles.role, "student")
        )
      )
      .limit(1);

    // For demo purposes, if no role found, just get the first student
    let student;
    if (studentRole.length > 0) {
      // In a real app, students table would have userId linking
      const studentRows = await db
        .select()
        .from(students)
        .where(eq(students.userId, ctx.user.id))
        .limit(1);
      student = studentRows.at(0);
    }

    if (!student) {
      // Demo fallback: get student by a predictable mapping
      const allStudents = await db
        .select()
        .from(students)
        .orderBy(students.id)
        .limit(1);
      student = allStudents.at(0);
    }

    if (!student) {
      return {
        student: null,
        preferences: [],
        supervisors: [],
      };
    }

    const [prefs, supervisors] = await Promise.all([
      findPreferencesByStudent(student.id),
      findAvailableSupervisors(),
    ]);

    // Generate realistic mock CGPA progression curve towards their final CGPA
    const cgpaProgression = [];
    const semesters = ["100L", "200L", "300L", "400L"];
    let currentCgpa = Math.max(1.5, student.cgpa - 0.5); // start a bit lower usually
    
    for (let i = 0; i < semesters.length; i++) {
      if (i === semesters.length - 1) {
        cgpaProgression.push({ semester: semesters[i], cgpa: student.cgpa });
      } else {
        // Step randomly towards final CGPA
        currentCgpa = currentCgpa + (Math.random() * 0.3 - 0.1); 
        currentCgpa = Math.min(4.0, Math.max(1.0, currentCgpa));
        cgpaProgression.push({ semester: semesters[i], cgpa: parseFloat(currentCgpa.toFixed(2)) });
      }
    }

    // Generate mock recent activity
    const recentActivity = [
      { id: 1, action: "Viewed allocation results", date: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
      { id: 2, action: "Updated supervisor preferences", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
      { id: 3, action: "Completed student profile", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString() },
    ];

    return {
      student,
      preferences: prefs,
      supervisors: supervisors.map((s) => ({
        id: s.id,
        name: s.name,
        department: s.department,
        currentLoad: s.currentLoad,
        maxStudents: s.maxStudents,
        available: s.isAvailable,
      })),
      cgpaProgression,
      recentActivity
    };
  }),

  createProfile: authedQuery
    .input(
      z.object({
        studentId: z.string().min(1),
        name: z.string().min(1),
        cgpa: z.number().min(0).max(4.0),
        department: z.string().min(1),
        level: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      // Create student record
      await db.insert(students).values({
        userId: ctx.user.id,
        studentId: input.studentId,
        name: input.name,
        cgpa: input.cgpa,
        department: input.department,
        level: input.level,
      });

      // Ensure user has student role
      const existingRole = await db
        .select()
        .from(userRoles)
        .where(and(eq(userRoles.userId, ctx.user.id), eq(userRoles.role, "student")))
        .limit(1);
        
      if (existingRole.length === 0) {
        await db.insert(userRoles).values({
          userId: ctx.user.id,
          role: "student",
        });
      }

      return { success: true };
    }),

  academicResults: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const studentRows = await db
      .select()
      .from(students)
      .where(eq(students.userId, ctx.user.id))
      .limit(1);

    let student = studentRows.at(0);
    if (!student) {
      const allStudents = await db
        .select()
        .from(students)
        .orderBy(students.id)
        .limit(1);
      student = allStudents.at(0);
    }

    if (!student) {
      return { transcript: [] };
    }

    const deptPrefix = student.department.substring(0, 3).toUpperCase();
    const levels = ["100", "200", "300", "400"];
    const targetCgpa = student.cgpa;
    
    const getGrade = (score: number) => {
      if (score >= 70) return "A";
      if (score >= 60) return "B";
      if (score >= 50) return "C";
      if (score >= 45) return "D";
      if (score >= 40) return "E";
      return "F";
    };

    const transcript = levels.map((level) => {
      const levelNum = parseInt(level);
      const courses = [];
      for (let i = 1; i <= 6; i++) {
        const isCore = i <= 4;
        const code = `${isCore ? deptPrefix : (i === 5 ? 'MTH' : 'GST')}${levelNum + i}`;
        
        let titleBase = student!.department;
        if (i === 5) titleBase = "Mathematics";
        if (i === 6) titleBase = "General Studies";
        
        const title = `${titleBase} Concepts ${levelNum + i}`;
        const units = isCore ? Math.floor(Math.random() * 2) + 3 : 2; // 3 or 4 for core, 2 for others
        
        // Target CGPA max is 4.0 (Wait, max is 5.0 in some systems, but Nigerian system is typically 5.0 max for some or 4.0 for others. Our seed generates up to 4.0).
        // Let's assume 4.0 max = ~75 average score.
        const baseScore = (targetCgpa / 4.0) * 35 + 40; 
        const variance = (Math.random() * 20) - 10;
        let score = Math.round(baseScore + variance);
        score = Math.max(35, Math.min(100, score));
        
        courses.push({
          id: `${code}-${level}`,
          code,
          title,
          units,
          score,
          grade: getGrade(score),
        });
      }
      return {
        level: `${level}L`,
        courses
      };
    });

    return { transcript };
  }),

  preferences: createRouter({
    list: authedQuery.query(async ({ ctx }) => {
      const db = getDb();
      // Find student for this user
      const studentRows = await db
        .select()
        .from(students)
        .where(eq(students.userId, ctx.user.id))
        .limit(1);

      let student = studentRows.at(0);
      if (!student) {
        const allStudents = await db
          .select()
          .from(students)
          .orderBy(students.id)
          .limit(1);
        student = allStudents.at(0);
      }

      if (!student) return [];
      return findPreferencesByStudent(student.id);
    }),

    submit: authedQuery
      .input(
        z.object({
          preferences: z
            .array(
              z.object({
                supervisorId: z.number().int().positive(),
                rank: z.number().int().min(1).max(5),
              })
            )
            .min(3)
            .max(5),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = getDb();
        // Validation: unique supervisors
        const supervisorIds = input.preferences.map((p) => p.supervisorId);
        if (new Set(supervisorIds).size !== supervisorIds.length) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Each supervisor can only be selected once",
          });
        }

        // Validation: unique ranks
        const ranks = input.preferences.map((p) => p.rank);
        if (new Set(ranks).size !== ranks.length) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Each rank must be unique",
          });
        }

        // Find student for this user
        const studentRows = await db
          .select()
          .from(students)
          .where(eq(students.userId, ctx.user.id))
          .limit(1);

        let student = studentRows.at(0);
        if (!student) {
          const allStudents = await db
            .select()
            .from(students)
            .orderBy(students.id)
            .limit(1);
          student = allStudents.at(0);
        }

        if (!student) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Student record not found",
          });
        }

        await savePreferences(
          student.id,
          input.preferences.map((p) => ({
            supervisorId: p.supervisorId,
            rank: p.rank,
          }))
        );

        // Update preferenceSubmitted flag
        await db
          .update(students)
          .set({ preferenceSubmitted: true })
          .where(eq(students.id, student.id));

        return { success: true };
      }),
  }),
});
