// lib/validations/schemas.ts
// Zod validation schemas for API endpoints

import { z } from 'zod';

export const createMemberSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().optional(),
  dateOfBirth: z.string().date().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  membershipPlanId: z.string().uuid(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  fitnessGoals: z.array(z.string()).optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
});

export const bookClassSchema = z.object({
  classScheduleId: z.string().uuid(),
  notes: z.string().optional(),
});

export const createClassScheduleSchema = z.object({
  classId: z.string().uuid(),
  trainerId: z.string().uuid().optional(),
  areaId: z.string().uuid().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  capacityOverride: z.number().positive().optional(),
  priceOverride: z.number().positive().optional(),
  instructorNotes: z.string().optional(),
});

export const recordHealthMetricsSchema = z.object({
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  bodyFatPercentage: z.number().min(0).max(100).optional(),
  muscleMass: z.number().positive().optional(),
  measurements: z.object({
    chest: z.number().positive().optional(),
    waist: z.number().positive().optional(),
    hips: z.number().positive().optional(),
    bicep_left: z.number().positive().optional(),
    bicep_right: z.number().positive().optional(),
    thigh_left: z.number().positive().optional(),
    thigh_right: z.number().positive().optional(),
  }).optional(),
  restingHeartRate: z.number().positive().optional(),
  bloodPressureSystolic: z.number().positive().optional(),
  bloodPressureDiastolic: z.number().positive().optional(),
  notes: z.string().optional(),
});

export const createWorkoutSchema = z.object({
  templateId: z.string().uuid().optional(),
  workoutDate: z.string().date(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  exercises: z.array(z.object({
    exerciseId: z.string().uuid(),
    sets: z.array(z.object({
      reps: z.number().positive(),
      weight: z.number().nonnegative().optional(),
      duration: z.number().positive().optional(), // for time-based exercises
      distance: z.number().positive().optional(), // for cardio
      restTime: z.number().nonnegative().optional(),
    })),
    notes: z.string().optional(),
  })),
  notes: z.string().optional(),
  moodRating: z.number().min(1).max(5).optional(),
  energyLevel: z.number().min(1).max(5).optional(),
});