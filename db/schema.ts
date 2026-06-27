import {
  sqliteTable,
  integer,
  text,
  real,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// ── Built-in auth users table ──
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  unionId: text("unionId").unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("passwordHash"),
  avatar: text("avatar"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: integer("lastSignInAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── Application-specific roles (student, supervisor, admin) ──
export const userRoles = sqliteTable(
  "user_roles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["student", "supervisor", "admin"] }).notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    userRoleUnique: uniqueIndex("user_role_unique").on(table.userId, table.role),
  })
);

export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = typeof userRoles.$inferInsert;

// ── Students ──
export const students = sqliteTable(
  "students",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("userId")
      .references(() => users.id, { onDelete: "set null" }),
    studentId: text("studentId").notNull().unique(),
    name: text("name").notNull(),
    cgpa: real("cgpa").notNull(),
    department: text("department").notNull(),
    level: text("level").notNull(),
    preferenceSubmitted: integer("preferenceSubmitted", { mode: "boolean" })
      .default(false)
      .notNull(),
    allocationStatus: text("allocationStatus", { enum: ["pending", "allocated", "unallocated"] })
      .default("pending")
      .notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    cgpaIdx: index("cgpa_idx").on(table.cgpa),
    deptIdx: index("dept_idx").on(table.department),
    statusIdx: index("status_idx").on(table.allocationStatus),
  })
);

export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;

// ── Supervisors ──
export const supervisors = sqliteTable(
  "supervisors",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("userId")
      .references(() => users.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    department: text("department").notNull(),
    maxStudents: integer("maxStudents").default(5).notNull(),
    currentLoad: integer("currentLoad").default(0).notNull(),
    isAvailable: integer("isAvailable", { mode: "boolean" })
      .default(true)
      .notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    supDeptIdx: index("sup_dept_idx").on(table.department),
    availableIdx: index("available_idx").on(table.isAvailable),
  })
);

export type Supervisor = typeof supervisors.$inferSelect;
export type InsertSupervisor = typeof supervisors.$inferInsert;

// ── Preferences (student-ranked supervisor choices) ──
export const preferences = sqliteTable(
  "preferences",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    studentId: integer("studentId")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    supervisorId: integer("supervisorId")
      .notNull()
      .references(() => supervisors.id, { onDelete: "cascade" }),
    preferenceRank: integer("preferenceRank").notNull(),
    submittedAt: integer("submittedAt", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    studentIdx: index("pref_student_idx").on(table.studentId),
    supervisorIdx: index("pref_supervisor_idx").on(table.supervisorId),
    uniqueStudentSupervisor: uniqueIndex("unique_student_supervisor").on(
      table.studentId,
      table.supervisorId
    ),
    uniqueStudentRank: uniqueIndex("unique_student_rank").on(
      table.studentId,
      table.preferenceRank
    ),
  })
);

export type Preference = typeof preferences.$inferSelect;
export type InsertPreference = typeof preferences.$inferInsert;

// ── Allocations (final assignment results) ──
export const allocations = sqliteTable(
  "allocations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    studentId: integer("studentId")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    supervisorId: integer("supervisorId")
      .notNull()
      .references(() => supervisors.id, { onDelete: "cascade" }),
    preferenceRank: integer("preferenceRank").notNull(),
    allocatedAt: integer("allocatedAt", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    allocStudentUnique: uniqueIndex("alloc_student_unique").on(table.studentId),
    allocSupervisorIdx: index("alloc_supervisor_idx").on(table.supervisorId),
  })
);

export type Allocation = typeof allocations.$inferSelect;
export type InsertAllocation = typeof allocations.$inferInsert;
