// lib/db/schema.ts
// GymMate Complete Drizzle ORM Schema
// Comprehensive Gym Management SaaS Platform

import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  timestamp, 
  integer, 
  decimal, 
  boolean, 
  jsonb, 
  date,
  time,
  inet,
  check,
  unique,
  index
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// =====================================================
// CORE TENANT & USER MANAGEMENT
// =====================================================

// Gyms table (SaaS tenants)
export const gyms = pgTable('gyms', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  country: varchar('country', { length: 50 }),
  postalCode: varchar('postal_code', { length: 20 }),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  website: varchar('website', { length: 255 }),
  logoUrl: varchar('logo_url', { length: 500 }),

  // Business settings
  timezone: varchar('timezone', { length: 50 }).default('UTC'),
  currency: varchar('currency', { length: 3 }).default('USD'),
  businessHours: jsonb('business_hours'),

  // SaaS subscription
  subscriptionPlan: varchar('subscription_plan', { length: 50 }).default('starter'),
  subscriptionStatus: varchar('subscription_status', { length: 20 }).default('active'),
  subscriptionExpiresAt: timestamp('subscription_expires_at'),
  maxMembers: integer('max_members').default(200),

  // Features enabled
  featuresEnabled: jsonb('features_enabled').default([]),

  // Status
  isActive: boolean('is_active').default(true),
  onboardingCompleted: boolean('onboarding_completed').default(false),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Users table (multi-tenant)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  gymId: uuid('gym_id').references(() => gyms.id, { onDelete: 'cascade' }),

  // Authentication
  email: varchar('email', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }),
  emailVerified: boolean('email_verified').default(false),
  emailVerificationToken: varchar('email_verification_token', { length: 255 }),
  passwordResetToken: varchar('password_reset_token', { length: 255 }),
  passwordResetExpires: timestamp('password_reset_expires'),

  // Profile
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  dateOfBirth: date('date_of_birth'),
  gender: varchar('gender', { length: 10 }),
  profilePhotoUrl: varchar('profile_photo_url', { length: 500 }),

  // Role & Status
  role: varchar('role', { length: 50 }).notNull().default('member'),
  status: varchar('status', { length: 20 }).default('active'),

  // Preferences
  preferences: jsonb('preferences').default({}),

  // Security
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  twoFactorSecret: varchar('two_factor_secret', { length: 255 }),
  lastLoginAt: timestamp('last_login_at'),
  loginAttempts: integer('login_attempts').default(0),
  lockedUntil: timestamp('locked_until'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  gymEmailUnique: unique().on(table.gymId, table.email),
}));

// =====================================================
// MEMBERSHIP MANAGEMENT
// =====================================================

// Membership plans/types
export const membershipPlans = pgTable('membership_plans', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  gymId: uuid('gym_id').references(() => gyms.id, { onDelete: 'cascade' }),

  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  billingCycle: varchar('billing_cycle', { length: 20 }).notNull(),
  durationMonths: integer('duration_months'),

  // Features
  classCredits: integer('class_credits'),
  guestPasses: integer('guest_passes').default(0),
  trainerSessions: integer('trainer_sessions').default(0),
  amenities: jsonb('amenities').default([]),

  // Restrictions
  peakHoursAccess: boolean('peak_hours_access').default(true),
  offPeakOnly: boolean('off_peak_only').default(false),
  specificAreas: jsonb('specific_areas'),

  // Status
  isActive: boolean('is_active').default(true),
  isFeatured: boolean('is_featured').default(false),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Members
export const members = pgTable('members', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  membershipNumber: varchar('membership_number', { length: 50 }).unique(),

  // Member details
  joinDate: date('join_date').defaultNow(),
  status: varchar('status', { length: 20 }).default('active'),

  // Emergency contact
  emergencyContactName: varchar('emergency_contact_name', { length: 255 }),
  emergencyContactPhone: varchar('emergency_contact_phone', { length: 20 }),
  emergencyContactRelationship: varchar('emergency_contact_relationship', { length: 50 }),

  // Health information
  medicalConditions: text('medical_conditions').array(),
  allergies: text('allergies').array(),
  medications: text('medications').array(),
  fitnessGoals: text('fitness_goals').array(),
  experienceLevel: varchar('experience_level', { length: 20 }),

  // Preferences
  preferredWorkoutTimes: jsonb('preferred_workout_times'),
  communicationPreferences: jsonb('communication_preferences'),

  // Payment methods
  paymentMethods: jsonb('payment_methods').default([]),

  // Waiver & agreements
  waiverSigned: boolean('waiver_signed').default(false),
  waiverSignedDate: date('waiver_signed_date'),
  photoConsent: boolean('photo_consent').default(false),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Member memberships (subscription instances)
export const memberMemberships = pgTable('member_memberships', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  memberId: uuid('member_id').references(() => members.id, { onDelete: 'cascade' }),
  membershipPlanId: uuid('membership_plan_id').references(() => membershipPlans.id),

  // Subscription period
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),

  // Billing
  monthlyAmount: decimal('monthly_amount', { precision: 10, scale: 2 }).notNull(),
  billingCycle: varchar('billing_cycle', { length: 20 }).notNull(),
  nextBillingDate: date('next_billing_date'),

  // Usage tracking
  classCreditsRemaining: integer('class_credits_remaining'),
  guestPassesRemaining: integer('guest_passes_remaining'),
  trainerSessionsRemaining: integer('trainer_sessions_remaining'),

  // Status
  status: varchar('status', { length: 20 }).default('active'),
  autoRenew: boolean('auto_renew').default(true),

  // Freezing/holding
  isFrozen: boolean('is_frozen').default(false),
  frozenUntil: date('frozen_until'),
  freezeReason: text('freeze_reason'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// =====================================================
// STAFF & TRAINER MANAGEMENT
// =====================================================

// Trainers
export const trainers = pgTable('trainers', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),

  // Professional info
  specializations: text('specializations').array(),
  bio: text('bio'),
  hourlyRate: decimal('hourly_rate', { precision: 10, scale: 2 }),
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).default('0.00'),

  // Certifications
  certifications: jsonb('certifications').default([]),

  // Availability
  defaultAvailability: jsonb('default_availability'),

  // Employment
  hireDate: date('hire_date'),
  employmentType: varchar('employment_type', { length: 20 }),

  // Status
  isActive: boolean('is_active').default(true),
  isAcceptingClients: boolean('is_accepting_clients').default(true),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Staff (non-trainer employees)
export const staff = pgTable('staff', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),

  // Job details
  position: varchar('position', { length: 100 }),
  department: varchar('department', { length: 50 }),
  hourlyWage: decimal('hourly_wage', { precision: 10, scale: 2 }),

  // Employment
  hireDate: date('hire_date'),
  employmentType: varchar('employment_type', { length: 20 }),

  // Schedule
  defaultSchedule: jsonb('default_schedule'),

  // Permissions
  permissions: jsonb('permissions').default([]),

  // Status
  isActive: boolean('is_active').default(true),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// =====================================================
// CLASSES & SCHEDULING
// =====================================================

// Class types/categories
export const classCategories = pgTable('class_categories', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  gymId: uuid('gym_id').references(() => gyms.id, { onDelete: 'cascade' }),

  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  color: varchar('color', { length: 7 }),
  icon: varchar('icon', { length: 50 }),

  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Classes
export const classes = pgTable('classes', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  gymId: uuid('gym_id').references(() => gyms.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').references(() => classCategories.id),

  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  durationMinutes: integer('duration_minutes').notNull(),
  capacity: integer('capacity').default(20),

  // Pricing
  price: decimal('price', { precision: 10, scale: 2 }).default('0.00'),
  creditsRequired: integer('credits_required').default(1),

  // Requirements
  skillLevel: varchar('skill_level', { length: 20 }),
  ageRestriction: varchar('age_restriction', { length: 50 }),
  equipmentNeeded: text('equipment_needed').array(),

  // Content
  imageUrl: varchar('image_url', { length: 500 }),
  videoUrl: varchar('video_url', { length: 500 }),
  instructions: text('instructions'),

  // Status
  isActive: boolean('is_active').default(true),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Areas/Rooms in the gym
export const gymAreas = pgTable('gym_areas', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  gymId: uuid('gym_id').references(() => gyms.id, { onDelete: 'cascade' }),

  name: varchar('name', { length: 100 }).notNull(),
  areaType: varchar('area_type', { length: 50 }),
  capacity: integer('capacity'),
  amenities: text('amenities').array(),

  // Booking rules
  requiresBooking: boolean('requires_booking').default(false),
  advanceBookingHours: integer('advance_booking_hours').default(24),

  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Class schedules
export const classSchedules = pgTable('class_schedules', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  classId: uuid('class_id').references(() => classes.id, { onDelete: 'cascade' }),
  trainerId: uuid('trainer_id').references(() => trainers.id),
  areaId: uuid('area_id').references(() => gymAreas.id),

  // Timing
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),

  // Overrides for this specific instance
  capacityOverride: integer('capacity_override'),
  priceOverride: decimal('price_override', { precision: 10, scale: 2 }),

  // Status
  status: varchar('status', { length: 20 }).default('scheduled'),
  cancellationReason: text('cancellation_reason'),

  // Notes
  instructorNotes: text('instructor_notes'),
  adminNotes: text('admin_notes'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Class bookings
export const classBookings = pgTable('class_bookings', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  memberId: uuid('member_id').references(() => members.id, { onDelete: 'cascade' }),
  classScheduleId: uuid('class_schedule_id').references(() => classSchedules.id, { onDelete: 'cascade' }),

  bookingDate: timestamp('booking_date').defaultNow(),
  status: varchar('status', { length: 20 }).default('confirmed'),

  // Payment
  creditsUsed: integer('credits_used').default(1),
  amountPaid: decimal('amount_paid', { precision: 10, scale: 2 }).default('0.00'),

  // Attendance
  checkedInAt: timestamp('checked_in_at'),
  checkedOutAt: timestamp('checked_out_at'),

  // Cancellation
  cancelledAt: timestamp('cancelled_at'),
  cancellationReason: text('cancellation_reason'),

  // Notes
  memberNotes: text('member_notes'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Waitlists for fully booked classes
export const classWaitlists = pgTable('class_waitlists', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  memberId: uuid('member_id').references(() => members.id, { onDelete: 'cascade' }),
  classScheduleId: uuid('class_schedule_id').references(() => classSchedules.id, { onDelete: 'cascade' }),

  position: integer('position').notNull(),
  joinedAt: timestamp('joined_at').defaultNow(),
  notifiedAt: timestamp('notified_at'),
  expiresAt: timestamp('expires_at'),

  status: varchar('status', { length: 20 }).default('waiting'),
});

// =====================================================
// PERSONAL TRAINING
// =====================================================

// Personal training sessions
export const personalTrainingSessions = pgTable('personal_training_sessions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  trainerId: uuid('trainer_id').references(() => trainers.id, { onDelete: 'cascade' }),
  memberId: uuid('member_id').references(() => members.id, { onDelete: 'cascade' }),
  areaId: uuid('area_id').references(() => gymAreas.id),

  // Timing
  scheduledStart: timestamp('scheduled_start').notNull(),
  scheduledEnd: timestamp('scheduled_end').notNull(),
  actualStart: timestamp('actual_start'),
  actualEnd: timestamp('actual_end'),

  // Pricing
  rate: decimal('rate', { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),

  // Session details
  sessionType: varchar('session_type', { length: 50 }),
  focusAreas: text('focus_areas').array(),
  exercisesPerformed: jsonb('exercises_performed'),

  // Status
  status: varchar('status', { length: 20 }).default('scheduled'),

  // Notes
  trainerNotes: text('trainer_notes'),
  memberFeedback: text('member_feedback'),
  memberRating: integer('member_rating'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  memberRatingCheck: check('member_rating_check', sql`${table.memberRating} >= 1 AND ${table.memberRating} <= 5`),
}));

// =====================================================
// WORKOUTS & FITNESS TRACKING
// =====================================================

// Exercise library
export const exercises = pgTable('exercises', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  gymId: uuid('gym_id').references(() => gyms.id, { onDelete: 'cascade' }),

  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }),
  muscleGroups: text('muscle_groups').array(),
  equipmentNeeded: text('equipment_needed').array(),

  // Instructions
  description: text('description'),
  instructions: text('instructions'),
  safetyTips: text('safety_tips'),

  // Media
  imageUrl: varchar('image_url', { length: 500 }),
  videoUrl: varchar('video_url', { length: 500 }),
  animationUrl: varchar('animation_url', { length: 500 }),

  // Difficulty
  difficultyLevel: varchar('difficulty_level', { length: 20 }),

  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Workout templates
export const workoutTemplates = pgTable('workout_templates', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  gymId: uuid('gym_id').references(() => gyms.id, { onDelete: 'cascade' }),
  createdBy: uuid('created_by').references(() => users.id),

  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }),
  difficultyLevel: varchar('difficulty_level', { length: 20 }),
  estimatedDuration: integer('estimated_duration'),

  // Template data
  exercises: jsonb('exercises'),

  // Sharing
  isPublic: boolean('is_public').default(false),
  isFeatured: boolean('is_featured').default(false),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Member workouts (logged sessions)
export const workouts = pgTable('workouts', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  memberId: uuid('member_id').references(() => members.id, { onDelete: 'cascade' }),
  templateId: uuid('template_id').references(() => workoutTemplates.id),

  workoutDate: date('workout_date').notNull(),
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),

  // Workout data
  exercises: jsonb('exercises').notNull(),

  // Metrics
  totalVolume: decimal('total_volume', { precision: 10, scale: 2 }),
  caloriesBurned: integer('calories_burned'),

  // Status
  status: varchar('status', { length: 20 }).default('completed'),

  // Notes
  notes: text('notes'),
  moodRating: integer('mood_rating'),
  energyLevel: integer('energy_level'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  moodRatingCheck: check('mood_rating_check', sql`${table.moodRating} >= 1 AND ${table.moodRating} <= 5`),
  energyLevelCheck: check('energy_level_check', sql`${table.energyLevel} >= 1 AND ${table.energyLevel} <= 5`),
}));

// =====================================================
// HEALTH METRICS & BODY TRACKING
// =====================================================

// Health metrics
export const healthMetrics = pgTable('health_metrics', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  memberId: uuid('member_id').references(() => members.id, { onDelete: 'cascade' }),

  recordedDate: date('recorded_date').notNull(),

  // Basic metrics
  weight: decimal('weight', { precision: 5, scale: 2 }),
  height: decimal('height', { precision: 5, scale: 2 }),
  bodyFatPercentage: decimal('body_fat_percentage', { precision: 5, scale: 2 }),
  muscleMass: decimal('muscle_mass', { precision: 5, scale: 2 }),
  boneDensity: decimal('bone_density', { precision: 5, scale: 2 }),

  // Calculated metrics
  bmi: decimal('bmi', { precision: 5, scale: 2 }),
  bmr: integer('bmr'),

  // Body measurements
  measurements: jsonb('measurements'),

  // Vital signs
  restingHeartRate: integer('resting_heart_rate'),
  bloodPressureSystolic: integer('blood_pressure_systolic'),
  bloodPressureDiastolic: integer('blood_pressure_diastolic'),

  // Additional metrics
  waterPercentage: decimal('water_percentage', { precision: 5, scale: 2 }),
  visceralFatLevel: integer('visceral_fat_level'),

  // Notes
  notes: text('notes'),
  recordedBy: varchar('recorded_by', { length: 20 }).default('member'),

  createdAt: timestamp('created_at').defaultNow(),
});

// Progress photos
export const progressPhotos = pgTable('progress_photos', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  memberId: uuid('member_id').references(() => members.id, { onDelete: 'cascade' }),

  photoDate: date('photo_date').notNull(),
  photoUrl: varchar('photo_url', { length: 500 }).notNull(),
  photoType: varchar('photo_type', { length: 20 }),

  // Privacy
  isPrivate: boolean('is_private').default(true),

  // Notes
  notes: text('notes'),

  createdAt: timestamp('created_at').defaultNow(),
});

// Fitness goals
export const fitnessGoals = pgTable('fitness_goals', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  memberId: uuid('member_id').references(() => members.id, { onDelete: 'cascade' }),

  goalType: varchar('goal_type', { length: 50 }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),

  // Target values
  targetValue: decimal('target_value', { precision: 10, scale: 2 }),
  targetUnit: varchar('target_unit', { length: 20 }),
  currentValue: decimal('current_value', { precision: 10, scale: 2 }),

  // Timeline
  targetDate: date('target_date'),

  // Status
  status: varchar('status', { length: 20 }).default('active'),
  achievedDate: date('achieved_date'),

  // AI recommendations
  aiRecommendations: jsonb('ai_recommendations'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// =====================================================
// EQUIPMENT & INVENTORY MANAGEMENT
// =====================================================

// Equipment categories
export const equipmentCategories = pgTable('equipment_categories', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  gymId: uuid('gym_id').references(() => gyms.id, { onDelete: 'cascade' }),

  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  maintenanceIntervalDays: integer('maintenance_interval_days').default(30),

  createdAt: timestamp('created_at').defaultNow(),
});

// Equipment
export const equipment = pgTable('equipment', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  gymId: uuid('gym_id').references(() => gyms.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').references(() => equipmentCategories.id),
  areaId: uuid('area_id').references(() => gymAreas.id),

  name: varchar('name', { length: 255 }).notNull(),
  brand: varchar('brand', { length: 100 }),
  model: varchar('model', { length: 100 }),
  serialNumber: varchar('serial_number', { length: 100 }),

  // Purchase info
  purchaseDate: date('purchase_date'),
  purchasePrice: decimal('purchase_price', { precision: 10, scale: 2 }),
  vendor: varchar('vendor', { length: 255 }),
  warrantyExpires: date('warranty_expires'),

  // Physical details
  dimensions: jsonb('dimensions'),
  weightKg: decimal('weight_kg', { precision: 8, scale: 2 }),
  powerRequirements: varchar('power_requirements', { length: 100 }),

  // Status
  status: varchar('status', { length: 20 }).default('operational'),
  conditionRating: integer('condition_rating'),

  // Maintenance
  lastMaintenanceDate: date('last_maintenance_date'),
  nextMaintenanceDate: date('next_maintenance_date'),
  maintenanceNotes: text('maintenance_notes'),

  // QR code for easy access
  qrCode: varchar('qr_code', { length: 255 }),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  conditionRatingCheck: check('condition_rating_check', sql`${table.conditionRating} >= 1 AND ${table.conditionRating} <= 5`),
}));

// Equipment maintenance logs
export const equipmentMaintenance = pgTable('equipment_maintenance', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  equipmentId: uuid('equipment_id').references(() => equipment.id, { onDelete: 'cascade' }),
  performedBy: uuid('performed_by').references(() => users.id),

  maintenanceDate: date('maintenance_date').notNull(),
  maintenanceType: varchar('maintenance_type', { length: 50 }),

  // Work performed
  description: text('description').notNull(),
  partsReplaced: text('parts_replaced').array(),
  cost: decimal('cost', { precision: 10, scale: 2 }),
  vendor: varchar('vendor', { length: 255 }),

  // Status change
  statusBefore: varchar('status_before', { length: 20 }),
  statusAfter: varchar('status_after', { length: 20 }),

  // Next maintenance
  nextMaintenanceDate: date('next_maintenance_date'),

  // Files
  receiptUrl: varchar('receipt_url', { length: 500 }),
  photos: jsonb('photos'),

  createdAt: timestamp('created_at').defaultNow(),
});

// Inventory categories
export const inventoryCategories = pgTable('inventory_categories', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  gymId: uuid('gym_id').references(() => gyms.id, { onDelete: 'cascade' }),

  name: varchar('name', { length: 100 }).notNull(),
  categoryType: varchar('category_type', { length: 50 }),

  createdAt: timestamp('created_at').defaultNow(),
});

// Inventory items
export const inventoryItems = pgTable('inventory_items', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  gymId: uuid('gym_id').references(() => gyms.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').references(() => inventoryCategories.id),

  name: varchar('name', { length: 255 }).notNull(),
  sku: varchar('sku', { length: 100 }),
  barcode: varchar('barcode', { length: 100 }),

  // Product details
  description: text('description'),
  brand: varchar('brand', { length: 100 }),
  unitOfMeasure: varchar('unit_of_measure', { length: 20 }),

  // Inventory tracking
  currentStock: integer('current_stock').default(0),
  minimumStock: integer('minimum_stock').default(0),
  maximumStock: integer('maximum_stock'),
  reorderPoint: integer('reorder_point'),
  reorderQuantity: integer('reorder_quantity'),

  // Costs and pricing
  costPerUnit: decimal('cost_per_unit', { precision: 10, scale: 2 }),
  retailPrice: decimal('retail_price', { precision: 10, scale: 2 }),

  // Suppliers
  primarySupplier: varchar('primary_supplier', { length: 255 }),
  supplierSku: varchar('supplier_sku', { length: 100 }),

  // Storage
  storageLocation: varchar('storage_location', { length: 100 }),
  storageRequirements: text('storage_requirements'),

  // Expiration tracking
  tracksExpiration: boolean('tracks_expiration').default(false),
  shelfLifeDays: integer('shelf_life_days'),

  // Status
  isActive: boolean('is_active').default(true),
  isSellable: boolean('is_sellable').default(false),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Inventory transactions
export const inventoryTransactions = pgTable('inventory_transactions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  itemId: uuid('item_id').references(() => inventoryItems.id, { onDelete: 'cascade' }),
  performedBy: uuid('performed_by').references(() => users.id),

  transactionType: varchar('transaction_type', { length: 20 }),
  quantity: integer('quantity').notNull(),
  unitCost: decimal('unit_cost', { precision: 10, scale: 2 }),

  // Reference
  referenceType: varchar('reference_type', { length: 50 }),
  referenceId: varchar('reference_id', { length: 255 }),

  // Details
  notes: text('notes'),
  expirationDate: date('expiration_date'),
  lotNumber: varchar('lot_number', { length: 100 }),

  transactionDate: timestamp('transaction_date').defaultNow(),
});

// =====================================================
// FINANCIAL MANAGEMENT
// =====================================================

// Payment methods
export const paymentMethods = pgTable('payment_methods', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  memberId: uuid('member_id').references(() => members.id, { onDelete: 'cascade' }),

  methodType: varchar('method_type', { length: 20 }),

  // Card details (encrypted/tokenized)
  cardToken: varchar('card_token', { length: 255 }),
  cardLastFour: varchar('card_last_four', { length: 4 }),
  cardBrand: varchar('card_brand', { length: 20 }),
  cardExpiresMonth: integer('card_expires_month'),
  cardExpiresYear: integer('card_expires_year'),

  // Bank account details (encrypted/tokenized)
  bankToken: varchar('bank_token', { length: 255 }),
  bankRoutingLastFour: varchar('bank_routing_last_four', { length: 4 }),
  bankAccountLastFour: varchar('bank_account_last_four', { length: 4 }),

  // Digital wallet
  walletType: varchar('wallet_type', { length: 20 }),
  walletEmail: varchar('wallet_email', { length: 255 }),

  // Status
  isDefault: boolean('is_default').default(false),
  isActive: boolean('is_active').default(true),

  // Verification
  isVerified: boolean('is_verified').default(false),
  verifiedAt: timestamp('verified_at'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Invoices
export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  gymId: uuid('gym_id').references(() => gyms.id, { onDelete: 'cascade' }),
  memberId: uuid('member_id').references(() => members.id),

  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull().unique(),

  // Amounts
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).default('0.00'),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0.00'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),

  // Dates
  invoiceDate: date('invoice_date').notNull(),
  dueDate: date('due_date').notNull(),

  // Status
  status: varchar('status', { length: 20 }).default('pending'),

  // Payment tracking
  paidAmount: decimal('paid_amount', { precision: 10, scale: 2 }).default('0.00'),
  paidDate: date('paid_date'),

  // Details
  description: text('description'),
  notes: text('notes'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Invoice line items
export const invoiceLineItems = pgTable('invoice_line_items', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: uuid('invoice_id').references(() => invoices.id, { onDelete: 'cascade' }),

  description: varchar('description', { length: 255 }).notNull(),
  quantity: integer('quantity').default(1),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),

  // Reference to what was sold
  itemType: varchar('item_type', { length: 50 }),
  itemId: uuid('item_id'),

  createdAt: timestamp('created_at').defaultNow(),
});

// Payments
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  gymId: uuid('gym_id').references(() => gyms.id, { onDelete: 'cascade' }),
  memberId: uuid('member_id').references(() => members.id),
  invoiceId: uuid('invoice_id').references(() => invoices.id),
  paymentMethodId: uuid('payment_method_id').references(() => paymentMethods.id),

  // Payment details
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp('payment_date').defaultNow(),

  // Payment processing
  paymentProcessor: varchar('payment_processor', { length: 50 }),
  processorTransactionId: varchar('processor_transaction_id', { length: 255 }),
  processorFee: decimal('processor_fee', { precision: 10, scale: 2 }).default('0.00'),

  // Status
  status: varchar('status', { length: 20 }).default('pending'),

  // Failure details
  failureReason: text('failure_reason'),
  failureCode: varchar('failure_code', { length: 50 }),

  // Notes
  notes: text('notes'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Refunds
export const refunds = pgTable('refunds', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  paymentId: uuid('payment_id').references(() => payments.id, { onDelete: 'cascade' }),
  processedBy: uuid('processed_by').references(() => users.id),

  refundAmount: decimal('refund_amount', { precision: 10, scale: 2 }).notNull(),
  refundReason: text('refund_reason'),

  // Processing
  processorRefundId: varchar('processor_refund_id', { length: 255 }),
  processorFee: decimal('processor_fee', { precision: 10, scale: 2 }).default('0.00'),

  status: varchar('status', { length: 20 }).default('pending'),

  refundDate: timestamp('refund_date').defaultNow(),
  completedDate: timestamp('completed_date'),
});

// =====================================================
// POINT OF SALE (POS)
// =====================================================

// POS sales
export const posSales = pgTable('pos_sales', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  gymId: uuid('gym_id').references(() => gyms.id, { onDelete: 'cascade' }),
  memberId: uuid('member_id').references(() => members.id),
  cashierId: uuid('cashier_id').references(() => users.id),

  saleNumber: varchar('sale_number', { length: 50 }).notNull().unique(),

  // Amounts
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).default('0.00'),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0.00'),
  tipAmount: decimal('tip_amount', { precision: 10, scale: 2 }).default('0.00'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),

  // Payment
  paymentMethod: varchar('payment_method', { length: 20 }),
  paymentStatus: varchar('payment_status', { length: 20 }).default('completed'),

  // Customer details (for non-members)
  customerName: varchar('customer_name', { length: 255 }),
  customerEmail: varchar('customer_email', { length: 255 }),
  customerPhone: varchar('customer_phone', { length: 20 }),

  saleDate: timestamp('sale_date').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

// POS sale items
export const posSaleItems = pgTable('pos_sale_items', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  saleId: uuid('sale_id').references(() => posSales.id, { onDelete: 'cascade' }),
  itemId: uuid('item_id').references(() => inventoryItems.id),

  itemName: varchar('item_name', { length: 255 }).notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),

  // Discounts
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0.00'),
  discountReason: varchar('discount_reason', { length: 255 }),

  createdAt: timestamp('created_at').defaultNow(),
});

// =====================================================
// ACCESS CONTROL & SECURITY
// =====================================================

// Access points (doors, gates, turnstiles)
export const accessPoints = pgTable('access_points', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  gymId: uuid('gym_id').references(() => gyms.id, { onDelete: 'cascade' }),
  areaId: uuid('area_id').references(() => gymAreas.id),

  name: varchar('name', { length: 100 }).notNull(),
  deviceId: varchar('device_id', { length: 100 }).unique(),
  deviceType: varchar('device_type', { length: 50 }),

  // Location
  description: text('description'),
  isEntryPoint: boolean('is_entry_point').default(true),
  isExitPoint: boolean('is_exit_point').default(true),

  // Access rules
  requiresMembership: boolean('requires_membership').default(true),
  allowedHoursStart: time('allowed_hours_start'),
  allowedHoursEnd: time('allowed_hours_end'),
  allowedDays: integer('allowed_days').array(),

  // Status
  isActive: boolean('is_active').default(true),
  isOnline: boolean('is_online').default(false),
  lastHeartbeat: timestamp('last_heartbeat'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Member access cards/fobs
export const memberAccessCards = pgTable('member_access_cards', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  memberId: uuid('member_id').references(() => members.id, { onDelete: 'cascade' }),

  cardNumber: varchar('card_number', { length: 100 }).notNull().unique(),
  cardType: varchar('card_type', { length: 20 }),

  // Status
  isActive: boolean('is_active').default(true),
  isTemporary: boolean('is_temporary').default(false),
  expiresAt: timestamp('expires_at'),

  // Lost/stolen
  isLost: boolean('is_lost').default(false),
  lostReportedAt: timestamp('lost_reported_at'),

  issuedDate: date('issued_date').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Access logs
export const accessLogs = pgTable('access_logs', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  memberId: uuid('member_id').references(() => members.id, { onDelete: 'cascade' }),
  accessPointId: uuid('access_point_id').references(() => accessPoints.id),
  cardId: uuid('card_id').references(() => memberAccessCards.id),

  accessTime: timestamp('access_time').notNull(),
  accessType: varchar('access_type', { length: 20 }),

  // Denial reasons
  denialReason: varchar('denial_reason', { length: 100 }),

  // Device info
  deviceResponse: text('device_response'),

  createdAt: timestamp('created_at').defaultNow(),
});

// =====================================================
// MARKETING & COMMUNICATIONS
// =====================================================

// Marketing campaigns
export const marketingCampaigns = pgTable('marketing_campaigns', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  gymId: uuid('gym_id').references(() => gyms.id, { onDelete: 'cascade' }),
  createdBy: uuid('created_by').references(() => users.id),

  name: varchar('name', { length: 255 }).notNull(),
  campaignType: varchar('campaign_type', { length: 50 }),

  // Content
  subject: varchar('subject', { length: 255 }),
  message: text('message'),

  // Targeting
  targetAudience: jsonb('target_audience'),

  // Scheduling
  scheduledFor: timestamp('scheduled_for'),
  sentAt: timestamp('sent_at'),

  // Status
  status: varchar('status', { length: 20 }).default('draft'),

  // Results
  totalRecipients: integer('total_recipients').default(0),
  deliveredCount: integer('delivered_count').default(0),
  openedCount: integer('opened_count').default(0),
  clickedCount: integer('clicked_count').default(0),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Communication preferences
export const communicationPreferences = pgTable('communication_preferences', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),

  // Channel preferences
  emailEnabled: boolean('email_enabled').default(true),
  smsEnabled: boolean('sms_enabled').default(false),
  pushEnabled: boolean('push_enabled').default(true),

  // Content preferences
  marketingEmails: boolean('marketing_emails').default(true),
  classReminders: boolean('class_reminders').default(true),
  paymentNotifications: boolean('payment_notifications').default(true),
  workoutSuggestions: boolean('workout_suggestions').default(true),

  // Frequency
  digestFrequency: varchar('digest_frequency', { length: 20 }).default('weekly'),

  updatedAt: timestamp('updated_at').defaultNow(),
});

// Automated messages
export const automatedMessages = pgTable('automated_messages', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  gymId: uuid('gym_id').references(() => gyms.id, { onDelete: 'cascade' }),

  triggerType: varchar('trigger_type', { length: 50 }),
  messageType: varchar('message_type', { length: 20 }),

  // Timing
  delayHours: integer('delay_hours').default(0),
  sendTime: time('send_time'),

  // Content
  subject: varchar('subject', { length: 255 }),
  messageTemplate: text('message_template'),

  // Status
  isActive: boolean('is_active').default(true),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Message queue
export const messageQueue = pgTable('message_queue', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  campaignId: uuid('campaign_id').references(() => marketingCampaigns.id),
  automatedMessageId: uuid('automated_message_id').references(() => automatedMessages.id),

  messageType: varchar('message_type', { length: 20 }),
  recipient: varchar('recipient', { length: 255 }),

  // Content
  subject: varchar('subject', { length: 255 }),
  message: text('message'),

  // Scheduling
  scheduledFor: timestamp('scheduled_for').notNull(),

  // Status
  status: varchar('status', { length: 20 }).default('pending'),
  sentAt: timestamp('sent_at'),

  // Results
  delivered: boolean('delivered').default(false),
  opened: boolean('opened').default(false),
  clicked: boolean('clicked').default(false),

  // Error handling
  attemptCount: integer('attempt_count').default(0),
  lastError: text('last_error'),

  createdAt: timestamp('created_at').defaultNow(),
});

// =====================================================
// REPORTS & ANALYTICS
// =====================================================

// Analytics events
export const analyticsEvents = pgTable('analytics_events', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  gymId: uuid('gym_id').references(() => gyms.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id),

  eventType: varchar('event_type', { length: 50 }),
  eventName: varchar('event_name', { length: 100 }),

  // Context
  pageUrl: varchar('page_url', { length: 500 }),
  userAgent: text('user_agent'),
  ipAddress: inet('ip_address'),

  // Custom properties
  properties: jsonb('properties'),

  eventTime: timestamp('event_time').defaultNow(),
});

// =====================================================
// SYSTEM & CONFIGURATION
// =====================================================

// System settings per gym
export const gymSettings = pgTable('gym_settings', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  gymId: uuid('gym_id').references(() => gyms.id, { onDelete: 'cascade' }),

  settingKey: varchar('setting_key', { length: 100 }).notNull(),
  settingValue: text('setting_value'),
  settingType: varchar('setting_type', { length: 20 }).default('string'),

  // Metadata
  description: text('description'),
  isPublic: boolean('is_public').default(false),

  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  gymSettingUnique: unique().on(table.gymId, table.settingKey),
}));

// Audit logs
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  gymId: uuid('gym_id').references(() => gyms.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id),

  action: varchar('action', { length: 100 }).notNull(),
  resourceType: varchar('resource_type', { length: 50 }),
  resourceId: uuid('resource_id'),

  // Changes
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),

  // Context
  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'),

  createdAt: timestamp('created_at').defaultNow(),
});

// =====================================================
// RELATIONSHIPS
// =====================================================

export const gymsRelations = relations(gyms, ({ many }) => ({
  users: many(users),
  membershipPlans: many(membershipPlans),
  classCategories: many(classCategories),
  classes: many(classes),
  gymAreas: many(gymAreas),
  exercises: many(exercises),
  workoutTemplates: many(workoutTemplates),
  equipmentCategories: many(equipmentCategories),
  equipment: many(equipment),
  inventoryCategories: many(inventoryCategories),
  inventoryItems: many(inventoryItems),
  invoices: many(invoices),
  payments: many(payments),
  posSales: many(posSales),
  accessPoints: many(accessPoints),
  marketingCampaigns: many(marketingCampaigns),
  automatedMessages: many(automatedMessages),
  analyticsEvents: many(analyticsEvents),
  gymSettings: many(gymSettings),
  auditLogs: many(auditLogs),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  gym: one(gyms, { fields: [users.gymId], references: [gyms.id] }),
  member: one(members, { fields: [users.id], references: [members.userId] }),
  trainer: one(trainers, { fields: [users.id], references: [trainers.userId] }),
  staff: one(staff, { fields: [users.id], references: [staff.userId] }),
  workoutTemplates: many(workoutTemplates),
  communicationPreferences: one(communicationPreferences, { fields: [users.id], references: [communicationPreferences.userId] }),
  messageQueue: many(messageQueue),
  analyticsEvents: many(analyticsEvents),
  auditLogs: many(auditLogs),
}));

export const membersRelations = relations(members, ({ one, many }) => ({
  user: one(users, { fields: [members.userId], references: [users.id] }),
  memberMemberships: many(memberMemberships),
  classBookings: many(classBookings),
  classWaitlists: many(classWaitlists),
  personalTrainingSessions: many(personalTrainingSessions),
  workouts: many(workouts),
  healthMetrics: many(healthMetrics),
  progressPhotos: many(progressPhotos),
  fitnessGoals: many(fitnessGoals),
  paymentMethods: many(paymentMethods),
  memberAccessCards: many(memberAccessCards),
  accessLogs: many(accessLogs),
}));

export const memberMembershipsRelations = relations(memberMemberships, ({ one }) => ({
  member: one(members, { fields: [memberMemberships.memberId], references: [members.id] }),
  membershipPlan: one(membershipPlans, { fields: [memberMemberships.membershipPlanId], references: [membershipPlans.id] }),
}));

export const trainersRelations = relations(trainers, ({ one, many }) => ({
  user: one(users, { fields: [trainers.userId], references: [users.id] }),
  classSchedules: many(classSchedules),
  personalTrainingSessions: many(personalTrainingSessions),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  gym: one(gyms, { fields: [classes.gymId], references: [gyms.id] }),
  category: one(classCategories, { fields: [classes.categoryId], references: [classCategories.id] }),
  schedules: many(classSchedules),
}));

export const classSchedulesRelations = relations(classSchedules, ({ one, many }) => ({
  class: one(classes, { fields: [classSchedules.classId], references: [classes.id] }),
  trainer: one(trainers, { fields: [classSchedules.trainerId], references: [trainers.id] }),
  area: one(gymAreas, { fields: [classSchedules.areaId], references: [gymAreas.id] }),
  bookings: many(classBookings),
  waitlists: many(classWaitlists),
}));

export const classBookingsRelations = relations(classBookings, ({ one }) => ({
  member: one(members, { fields: [classBookings.memberId], references: [members.id] }),
  classSchedule: one(classSchedules, { fields: [classBookings.classScheduleId], references: [classSchedules.id] }),
}));

export const workoutsRelations = relations(workouts, ({ one }) => ({
  member: one(members, { fields: [workouts.memberId], references: [members.id] }),
  template: one(workoutTemplates, { fields: [workouts.templateId], references: [workoutTemplates.id] }),
}));

export const healthMetricsRelations = relations(healthMetrics, ({ one }) => ({
  member: one(members, { fields: [healthMetrics.memberId], references: [members.id] }),
}));

export const equipmentRelations = relations(equipment, ({ one, many }) => ({
  gym: one(gyms, { fields: [equipment.gymId], references: [gyms.id] }),
  category: one(equipmentCategories, { fields: [equipment.categoryId], references: [equipmentCategories.id] }),
  area: one(gymAreas, { fields: [equipment.areaId], references: [gymAreas.id] }),
  maintenance: many(equipmentMaintenance),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  gym: one(gyms, { fields: [payments.gymId], references: [gyms.id] }),
  member: one(members, { fields: [payments.memberId], references: [members.id] }),
  invoice: one(invoices, { fields: [payments.invoiceId], references: [invoices.id] }),
  paymentMethod: one(paymentMethods, { fields: [payments.paymentMethodId], references: [paymentMethods.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  gym: one(gyms, { fields: [invoices.gymId], references: [gyms.id] }),
  member: one(members, { fields: [invoices.memberId], references: [members.id] }),
  lineItems: many(invoiceLineItems),
  payments: many(payments),
}));

// =====================================================
// INDEXES FOR PERFORMANCE
// =====================================================

// User indexes
export const usersGymIdIndex = index('idx_users_gym_id').on(users.gymId);
export const usersEmailIndex = index('idx_users_email').on(users.email);
export const usersRoleIndex = index('idx_users_role').on(users.role);

// Member indexes
export const membersUserIdIndex = index('idx_members_user_id').on(members.userId);
export const membersStatusIndex = index('idx_members_status').on(members.status);
export const memberMembershipsMemberIdIndex = index('idx_member_memberships_member_id').on(memberMemberships.memberId);
export const memberMembershipsStatusIndex = index('idx_member_memberships_status').on(memberMemberships.status);
export const memberMembershipsDatesIndex = index('idx_member_memberships_dates').on(memberMemberships.startDate, memberMemberships.endDate);

// Class and booking indexes
export const classSchedulesStartTimeIndex = index('idx_class_schedules_start_time').on(classSchedules.startTime);
export const classSchedulesTrainerIndex = index('idx_class_schedules_trainer').on(classSchedules.trainerId);
export const classSchedulesClassIndex = index('idx_class_schedules_class').on(classSchedules.classId);
export const classBookingsMemberIndex = index('idx_class_bookings_member').on(classBookings.memberId);
export const classBookingsScheduleIndex = index('idx_class_bookings_schedule').on(classBookings.classScheduleId);
export const classBookingsStatusIndex = index('idx_class_bookings_status').on(classBookings.status);

// Workout and health indexes
export const workoutsMemberDateIndex = index('idx_workouts_member_date').on(workouts.memberId, workouts.workoutDate);
export const healthMetricsMemberDateIndex = index('idx_health_metrics_member_date').on(healthMetrics.memberId, healthMetrics.recordedDate);

// Financial indexes
export const paymentsMemberIndex = index('idx_payments_member').on(payments.memberId);
export const paymentsDateIndex = index('idx_payments_date').on(payments.paymentDate);
export const paymentsStatusIndex = index('idx_payments_status').on(payments.status);
export const invoicesMemberIndex = index('idx_invoices_member').on(invoices.memberId);
export const invoicesStatusIndex = index('idx_invoices_status').on(invoices.status);
export const invoicesDueDateIndex = index('idx_invoices_due_date').on(invoices.dueDate);

// Access control indexes
export const accessLogsMemberIndex = index('idx_access_logs_member').on(accessLogs.memberId);
export const accessLogsTimeIndex = index('idx_access_logs_time').on(accessLogs.accessTime);
export const accessLogsPointIndex = index('idx_access_logs_point').on(accessLogs.accessPointId);

// Equipment indexes
export const equipmentGymIndex = index('idx_equipment_gym').on(equipment.gymId);
export const equipmentStatusIndex = index('idx_equipment_status').on(equipment.status);
export const equipmentMaintenanceDateIndex = index('idx_equipment_maintenance_date').on(equipment.nextMaintenanceDate);

// Inventory indexes
export const inventoryItemsGymIndex = index('idx_inventory_items_gym').on(inventoryItems.gymId);
export const inventoryItemsStockIndex = index('idx_inventory_items_stock').on(inventoryItems.currentStock);
export const inventoryTransactionsItemIndex = index('idx_inventory_transactions_item').on(inventoryTransactions.itemId);
export const inventoryTransactionsDateIndex = index('idx_inventory_transactions_date').on(inventoryTransactions.transactionDate);

// =====================================================
// TYPE EXPORTS
// =====================================================

// Export types for use in the application
export type Gym = typeof gyms.$inferSelect;
export type User = typeof users.$inferSelect;
export type Member = typeof members.$inferSelect;
export type MembershipPlan = typeof membershipPlans.$inferSelect;
export type MemberMembership = typeof memberMemberships.$inferSelect;
export type Trainer = typeof trainers.$inferSelect;
export type Staff = typeof staff.$inferSelect;
export type Class = typeof classes.$inferSelect;
export type ClassSchedule = typeof classSchedules.$inferSelect;
export type ClassBooking = typeof classBookings.$inferSelect;
export type PersonalTrainingSession = typeof personalTrainingSessions.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type WorkoutTemplate = typeof workoutTemplates.$inferSelect;
export type Workout = typeof workouts.$inferSelect;
export type HealthMetric = typeof healthMetrics.$inferSelect;
export type Equipment = typeof equipment.$inferSelect;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type AccessLog = typeof accessLogs.$inferSelect;

// Insert types for forms and API
export type NewGym = typeof gyms.$inferInsert;
export type NewUser = typeof users.$inferInsert;
export type NewMember = typeof members.$inferInsert;
export type NewMembershipPlan = typeof membershipPlans.$inferInsert;
export type NewClass = typeof classes.$inferInsert;
export type NewClassSchedule = typeof classSchedules.$inferInsert;
export type NewClassBooking = typeof classBookings.$inferInsert;
export type NewWorkout = typeof workouts.$inferInsert;
export type NewHealthMetric = typeof healthMetrics.$inferInsert;
export type NewEquipment = typeof equipment.$inferInsert;
export type NewPayment = typeof payments.$inferInsert;