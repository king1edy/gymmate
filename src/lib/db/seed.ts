// lib/db/seed.ts
// Database seeding utility

import { db } from './index';
import { 
  gyms, 
  users, 
  members, 
  membershipPlans, 
  classCategories, 
  classes,
  gymAreas,
  trainers,
  equipmentCategories,
  equipment
} from './schema';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create sample gym
    const [gym] = await db.insert(gyms).values({
      id: crypto.randomUUID(),
      name: 'Skaton Fitness Hub',
      slug: 'skaton--fitness-hub',
      address: 'A001-003, Grace Mall 44 Yawoele-Ajuwon Road Via Alagbole Ojodu Berger Ogun State',
      city: 'Iju-Ajuwon',
      state: 'Ogun-state',
      country: 'Nigeria',
      postalCode: '221022',
      phone: '+2348140331311',
      email: 'info@skatonfitness.com',
      website: 'https://skatonfitness.com',
      timezone: 'Lagos,Ng/GMT+1',
      currency: 'NGN',
      businessHours: {
        /*
        Monday  06:30 am - 08:00 pm
        Tuesday 06:30 am - 08:00 pm
        Wednesday 06:30 am - 08:00 pm
        Thursday  06:30 am - 08:00 pm
        Friday 06:30 am - 08:00 pm
        Saturday 06:30 am - 08:00 pm
        */
        monday: { open: '06:30', close: '20:00' },
        tuesday: { open: '06:30', close: '20:00' },
        wednesday: { open: '06:30', close: '20:00' },
        thursday: { open: '06:30', close: '20:00' },
        friday: { open: '06:30', close: '20:00' },
        saturday: { open: '06:00', close: '22:00' }

      },
      subscriptionPlan: 'professional',
      maxMembers: 500,
      featuresEnabled: ['ai_coaching', 'access_control', 'pos'],
      onboardingCompleted: true
    }).returning();

    console.log('✅ Created gym:', gym.name);

    // Create admin user
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const [adminUser] = await db.insert(users).values({
      id: crypto.randomUUID(),
      gymId: gym.id,
      email: 'k.Abiodun@skatonfitness.com',
      passwordHash: adminPasswordHash,
      firstName: 'Kolade',
      lastName: 'Abiodun',
      role: 'admin',
      emailVerified: true
    }).returning();

    console.log('✅ Created admin user:', adminUser.email);

    // Create sample trainer user
    const trainerPasswordHash = await bcrypt.hash('trainer123', 10);
    const [trainerUser] = await db.insert(users).values({
      id: crypto.randomUUID(),
      gymId: gym.id,
      email: 's.Olaoluwa@skatonfitness.com',
      passwordHash: trainerPasswordHash,
      firstName: 'Samuel',
      lastName: 'Olaoluwa',
      role: 'trainer',
      emailVerified: true
    }).returning();

    // Create trainer profile
    await db.insert(trainers).values({
      id: crypto.randomUUID(),
      userId: trainerUser.id,
      specializations: ['Strength Training', 'HIIT', 'Weight Loss'],
      bio: 'Certified personal trainer with 5+ years of experience helping clients achieve their fitness goals.',
      hourlyRate: '75.00',
      commissionRate: '15.00',
      certifications: [
        {
          name: 'NASM-CPT',
          issuer: 'National Academy of Sports Medicine',
          number: 'CPT-12345',
          issue_date: '2020-01-15',
          expiry_date: '2025-01-15'
        }
      ],
      defaultAvailability: {
        monday: [{ start: '06:00', end: '14:00' }],
        tuesday: [{ start: '06:00', end: '14:00' }],
        wednesday: [{ start: '06:00', end: '14:00' }],
        thursday: [{ start: '06:00', end: '14:00' }],
        friday: [{ start: '06:00', end: '14:00' }],
        saturday: [{ start: '08:00', end: '16:00' }]
      },
      hireDate: '2023-01-01',
      employmentType: 'full_time'
    });

    console.log('✅ Created trainer:', trainerUser.email);

    // Create sample member user
    const memberPasswordHash = await bcrypt.hash('member123', 10);
    const [memberUser] = await db.insert(users).values({
      id: crypto.randomUUID(),
      gymId: gym.id,
      email: 'members@skatonfitness.com MEMBERS@SKATONFITNESS.COM.',
      passwordHash: memberPasswordHash,
      firstName: 'John',
      lastName: 'Doe',
      role: 'member',
      emailVerified: true,
      phone: '+1-555-0987',
      dateOfBirth: '1990-05-15',
      gender: 'male'
    }).returning();

    // Create member profile
    await db.insert(members).values({
      id: crypto.randomUUID(),
      userId: memberUser.id,
      membershipNumber: 'MEM-001',
      emergencyContactName: 'Jane Doe',
      emergencyContactPhone: '+1-555-0988',
      emergencyContactRelationship: 'Spouse',
      fitnessGoals: ['Weight Loss', 'Muscle Gain', 'Improved Cardio'],
      experienceLevel: 'intermediate',
      preferredWorkoutTimes: ['morning', 'evening'],
      waiverSigned: true,
      waiverSignedDate: '2024-01-01',
      photoConsent: true
    });

    console.log('✅ Created member:', memberUser.email);

    // Create membership plans
    const membershipPlansData = [
      {
        id: crypto.randomUUID(),
        gymId: gym.id,
        name: 'Basic',
        description: 'Access to gym equipment and basic facilities',
        price: '29.99',
        billingCycle: 'monthly',
        durationMonths: null,
        classCredits: 4,
        guestPasses: 1,
        trainerSessions: 0,
        amenities: ['gym_floor', 'locker_rooms'],
        peakHoursAccess: false,
        offPeakOnly: true,
        isFeatured: false
      },
      {
        id: crypto.randomUUID(),
        gymId: gym.id,
        name: 'Premium',
        description: 'Full access including classes and peak hours',
        price: '59.99',
        billingCycle: 'monthly',
        durationMonths: null,
        classCredits: null, // unlimited
        guestPasses: 3,
        trainerSessions: 1,
        amenities: ['gym_floor', 'locker_rooms', 'pool', 'sauna', 'group_classes'],
        peakHoursAccess: true,
        offPeakOnly: false,
        isFeatured: true
      },
      {
        id: crypto.randomUUID(),
        gymId: gym.id,
        name: 'Elite',
        description: 'Premium access with personal training sessions',
        price: '99.99',
        billingCycle: 'monthly',
        durationMonths: null,
        classCredits: null, // unlimited
        guestPasses: 5,
        trainerSessions: 4,
        amenities: ['gym_floor', 'locker_rooms', 'pool', 'sauna', 'group_classes', 'personal_training', 'massage'],
        peakHoursAccess: true,
        offPeakOnly: false,
        isFeatured: true
      }
    ];

    await db.insert(membershipPlans).values(membershipPlansData);
    console.log('✅ Created membership plans');

    // Create gym areas
    const gymAreasData = [
      {
        id: crypto.randomUUID(),
        gymId: gym.id,
        name: 'Main Gym Floor',
        areaType: 'main_floor',
        capacity: 100,
        amenities: ['weights', 'cardio_machines', 'functional_training'],
        requiresBooking: false
      },
      {
        id: crypto.randomUUID(),
        gymId: gym.id,
        name: 'Studio A',
        areaType: 'studio',
        capacity: 25,
        amenities: ['mirrors', 'sound_system', 'yoga_mats'],
        requiresBooking: true,
        advanceBookingHours: 24
      },
      {
        id: crypto.randomUUID(),
        gymId: gym.id,
        name: 'Pool Area',
        areaType: 'pool',
        capacity: 30,
        amenities: ['pool', 'changing_rooms', 'towel_service'],
        requiresBooking: false
      }
    ];

    await db.insert(gymAreas).values(gymAreasData);
    console.log('✅ Created gym areas');

    // Create class categories
    const classCategoriesData = [
      {
        id: crypto.randomUUID(),
        gymId: gym.id,
        name: 'Strength Training',
        description: 'Build muscle and increase strength',
        color: '#FF6B6B',
        icon: 'dumbbell'
      },
      {
        id: crypto.randomUUID(),
        gymId: gym.id,
        name: 'Cardio',
        description: 'Improve cardiovascular health',
        color: '#4ECDC4',
        icon: 'heart'
      },
      {
        id: crypto.randomUUID(),
        gymId: gym.id,
        name: 'Yoga & Flexibility',
        description: 'Improve flexibility and mindfulness',
        color: '#45B7D1',
        icon: 'lotus'
      },
      {
        id: crypto.randomUUID(),
        gymId: gym.id,
        name: 'HIIT',
        description: 'High-intensity interval training',
        color: '#F39C12',
        icon: 'zap'
      }
    ];

    await db.insert(classCategories).values(classCategoriesData);
    console.log('✅ Created class categories');

    // Create sample classes
    const classesData = [
      {
        id: crypto.randomUUID(),
        gymId: gym.id,
        categoryId: classCategoriesData[0].id, // Strength Training
        name: 'Morning Strength',
        description: 'Start your day with a full-body strength training session',
        durationMinutes: 60,
        capacity: 15,
        price: '25.00',
        creditsRequired: 1,
        skillLevel: 'intermediate',
        ageRestriction: '16+',
        equipmentNeeded: ['dumbbells', 'barbells', 'resistance_bands']
      },
      {
        id: crypto.randomUUID(),
        gymId: gym.id,
        categoryId: classCategoriesData[1].id, // Cardio
        name: 'HIIT Blast',
        description: 'High-intensity cardio workout to boost your metabolism',
        durationMinutes: 45,
        capacity: 20,
        price: '20.00',
        creditsRequired: 1,
        skillLevel: 'all_levels',
        ageRestriction: 'all_ages',
        equipmentNeeded: ['body_weight', 'timer']
      },
      {
        id: crypto.randomUUID(),
        gymId: gym.id,
        categoryId: classCategoriesData[2].id, // Yoga
        name: 'Vinyasa Flow',
        description: 'Dynamic yoga flow to improve flexibility and strength',
        durationMinutes: 75,
        capacity: 25,
        price: '30.00',
        creditsRequired: 1,
        skillLevel: 'beginner',
        ageRestriction: 'all_ages',
        equipmentNeeded: ['yoga_mat', 'blocks', 'straps']
      }
    ];

    await db.insert(classes).values(classesData);
    console.log('✅ Created classes');

    // Create equipment categories
    const equipmentCategoriesData = [
      {
        id: crypto.randomUUID(),
        gymId: gym.id,
        name: 'Cardio Equipment',
        description: 'Treadmills, bikes, ellipticals, etc.',
        maintenanceIntervalDays: 30
      },
      {
        id: crypto.randomUUID(),
        gymId: gym.id,
        name: 'Strength Equipment',
        description: 'Weight machines, free weights, etc.',
        maintenanceIntervalDays: 60
      },
      {
        id: crypto.randomUUID(),
        gymId: gym.id,
        name: 'Functional Training',
        description: 'Kettlebells, resistance bands, medicine balls',
        maintenanceIntervalDays: 90
      }
    ];

    await db.insert(equipmentCategories).values(equipmentCategoriesData);

    // Create sample equipment
    const equipmentData = [
      {
        id: crypto.randomUUID(),
        gymId: gym.id,
        categoryId: equipmentCategoriesData[0].id,
        areaId: gymAreasData[0].id,
        name: 'Treadmill #1',
        brand: 'Life Fitness',
        model: 'T5 Go Console',
        serialNumber: 'LF-T5-001',
        purchaseDate: '2023-01-15',
        purchasePrice: '3500.00',
        vendor: 'Fitness Equipment Supply Co.',
        warrantyExpires: '2026-01-15',
        dimensions: { length: 200, width: 90, height: 160 },
        weightKg: '125.00',
        powerRequirements: '220V',
        status: 'operational',
        conditionRating: 5,
        nextMaintenanceDate: '2024-08-15'
      },
      {
        id: crypto.randomUUID(),
        gymId: gym.id,
        categoryId: equipmentCategoriesData[1].id,
        areaId: gymAreasData[0].id,
        name: 'Smith Machine',
        brand: 'Hammer Strength',
        model: 'Linear Smith Machine',
        serialNumber: 'HS-SM-001',
        purchaseDate: '2023-02-01',
        purchasePrice: '2800.00',
        vendor: 'Hammer Strength Direct',
        warrantyExpires: '2025-02-01',
        dimensions: { length: 150, width: 120, height: 220 },
        weightKg: '200.00',
        status: 'operational',
        conditionRating: 5,
        nextMaintenanceDate: '2024-09-01'
      }
    ];

    await db.insert(equipment).values(equipmentData);
    console.log('✅ Created equipment');

    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📝 Login credentials:');
    console.log('Admin: admin@skatonfitness.com / admin123');
    console.log('Trainer: trainer@skatonfitness.com / trainer123');
    console.log('Member: member@skatonfitness.com / member123');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
