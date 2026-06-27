import { relations } from "drizzle-orm";
import { users, userRoles, students, supervisors, preferences, allocations } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  roles: many(userRoles),
  studentProfile: many(students),
  supervisorProfile: many(supervisors),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, { fields: [students.userId], references: [users.id] }),
  preferences: many(preferences),
  allocation: many(allocations),
}));

export const supervisorsRelations = relations(supervisors, ({ one, many }) => ({
  user: one(users, { fields: [supervisors.userId], references: [users.id] }),
  preferences: many(preferences),
  allocations: many(allocations),
}));

export const preferencesRelations = relations(preferences, ({ one }) => ({
  student: one(students, { fields: [preferences.studentId], references: [students.id] }),
  supervisor: one(supervisors, { fields: [preferences.supervisorId], references: [supervisors.id] }),
}));

export const allocationsRelations = relations(allocations, ({ one }) => ({
  student: one(students, { fields: [allocations.studentId], references: [students.id] }),
  supervisor: one(supervisors, { fields: [allocations.supervisorId], references: [supervisors.id] }),
}));
