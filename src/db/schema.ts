import { pgTable, serial, varchar, integer, decimal, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table for client information
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  age: integer('age'),
  weight: decimal('weight', { precision: 5, scale: 2 }),
  height: varchar('height', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Workout types/categories
export const workoutTypes = pgTable('workout_types', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Individual exercises
export const exercises = pgTable('exercises', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  videoUrl: text('video_url'),
  isWarmup: boolean('is_warmup').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Workout plans - links users to workout types
export const workoutPlans = pgTable('workout_plans', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  workoutTypeId: integer('workout_type_id').references(() => workoutTypes.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Workout exercises - specific exercise details for a workout plan
export const workoutExercises = pgTable('workout_exercises', {
  id: serial('id').primaryKey(),
  workoutPlanId: integer('workout_plan_id').references(() => workoutPlans.id, { onDelete: 'cascade' }),
  exerciseId: integer('exercise_id').references(() => exercises.id, { onDelete: 'cascade' }),
  reps: varchar('reps', { length: 50 }),
  sets: integer('sets').default(1),
  orderIndex: integer('order_index').default(0),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Instructions and disclaimers
export const instructions = pgTable('instructions', {
  id: serial('id').primaryKey(),
  type: varchar('type', { length: 50 }).notNull().unique(),
  title: varchar('title', { length: 255 }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Nutrition data (optional)
export const nutritionFoods = pgTable('nutrition_foods', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  caloriesPer100g: decimal('calories_per_100g', { precision: 8, scale: 2 }),
  fatPer100g: decimal('fat_per_100g', { precision: 8, scale: 2 }),
  carbsPer100g: decimal('carbs_per_100g', { precision: 8, scale: 2 }),
  proteinPer100g: decimal('protein_per_100g', { precision: 8, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations for better querying
export const usersRelations = relations(users, ({ many }) => ({
  workoutPlans: many(workoutPlans),
}));

export const workoutTypesRelations = relations(workoutTypes, ({ many }) => ({
  workoutPlans: many(workoutPlans),
}));

export const exercisesRelations = relations(exercises, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workoutPlansRelations = relations(workoutPlans, ({ one, many }) => ({
  user: one(users, {
    fields: [workoutPlans.userId],
    references: [users.id],
  }),
  workoutType: one(workoutTypes, {
    fields: [workoutPlans.workoutTypeId],
    references: [workoutTypes.id],
  }),
  workoutExercises: many(workoutExercises),
}));

export const workoutExercisesRelations = relations(workoutExercises, ({ one }) => ({
  workoutPlan: one(workoutPlans, {
    fields: [workoutExercises.workoutPlanId],
    references: [workoutPlans.id],
  }),
  exercise: one(exercises, {
    fields: [workoutExercises.exerciseId],
    references: [exercises.id],
  }),
}));

// TypeScript types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type WorkoutType = typeof workoutTypes.$inferSelect;
export type NewWorkoutType = typeof workoutTypes.$inferInsert;
export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;
export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type NewWorkoutPlan = typeof workoutPlans.$inferInsert;
export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type NewWorkoutExercise = typeof workoutExercises.$inferInsert;
export type Instruction = typeof instructions.$inferSelect;
export type NewInstruction = typeof instructions.$inferInsert;