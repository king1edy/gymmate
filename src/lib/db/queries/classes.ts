// lib/db/queries/classes.ts
// Pre-built queries for class operations
import { db } from '../index';
import { classSchedules, classes, trainers, users, gymAreas, classBookings, memberMemberships } from '../schema';
import { eq, and, desc, gte, lte, count } from 'drizzle-orm';
import { MemberQueries } from './members';
import crypto from 'crypto';

export class ClassQueries {
  /**
   * Get available classes for booking
   */
  static async getAvailableClasses(
    gymId: string,
    startDate: Date,
    endDate: Date
  ) {
    return await db
      .select({
        schedule: classSchedules,
        class: classes,
        trainerId: trainers.id,
        trainerFirstName: users.firstName,
        trainerLastName: users.lastName,
        area: gymAreas,
        bookedCount: count(classBookings.id)
      })
      .from(classSchedules)
      .innerJoin(classes, eq(classSchedules.classId, classes.id))
      .leftJoin(trainers, eq(classSchedules.trainerId, trainers.id))
      .leftJoin(users, eq(trainers.userId, users.id))
      .leftJoin(gymAreas, eq(classSchedules.areaId, gymAreas.id))
      .leftJoin(classBookings, and(
        eq(classBookings.classScheduleId, classSchedules.id),
        eq(classBookings.status, 'confirmed')
      ))
      .where(and(
        eq(classes.gymId, gymId),
        eq(classes.isActive, true),
        eq(classSchedules.status, 'scheduled'),
        gte(classSchedules.startTime, startDate),
        lte(classSchedules.startTime, endDate)
      ))
      .groupBy(
        classSchedules.id,
        classes.id,
        trainers.id,
        users.id,
        gymAreas.id
      )
      .orderBy(classSchedules.startTime);
  }

  /**
   * Check if member can book a class
   */
  static async canMemberBookClass(
    memberId: string,
    classScheduleId: string
  ): Promise<{ canBook: boolean; reason?: string }> {
    // Get class details
    const classDetails = await db
      .select({
        schedule: classSchedules,
        class: classes,
        bookedCount: count(classBookings.id)
      })
      .from(classSchedules)
      .innerJoin(classes, eq(classSchedules.classId, classes.id))
      .leftJoin(classBookings, and(
        eq(classBookings.classScheduleId, classSchedules.id),
        eq(classBookings.status, 'confirmed')
      ))
      .where(eq(classSchedules.id, classScheduleId))
      .groupBy(classSchedules.id, classes.id);

    if (!classDetails.length) {
      return { canBook: false, reason: 'Class not found' };
    }

    const { schedule, class: classInfo, bookedCount } = classDetails[0];

    // Check if class is in the future
    if (schedule.startTime <= new Date()) {
      return { canBook: false, reason: 'Class has already started' };
    }

    // Check capacity
    const capacity = schedule.capacityOverride || classInfo.capacity || 0;
    if (bookedCount >= capacity) {
      return { canBook: false, reason: 'Class is full' };
    }

    // Check if member already booked
    const existingBooking = await db.query.classBookings.findFirst({
      where: and(
        eq(classBookings.memberId, memberId),
        eq(classBookings.classScheduleId, classScheduleId),
        eq(classBookings.status, 'confirmed')
      )
    });

    if (existingBooking) {
      return { canBook: false, reason: 'Already booked' };
    }

    // Check member's credits/membership
    const membership = await MemberQueries.getActiveMembership(memberId);
    if (!membership) {
      return { canBook: false, reason: 'No active membership' };
    }

    if (membership.classCreditsRemaining !== null && 
        membership.classCreditsRemaining < (classInfo.creditsRequired || 0)) {
      return { canBook: false, reason: 'Insufficient credits' };
    }

    return { canBook: true };
  }

  /**
   * Book a class for a member
   */
  static async bookClass(
    memberId: string,
    classScheduleId: string,
    notes?: string
  ) {
    const canBook = await this.canMemberBookClass(memberId, classScheduleId);
    
    if (!canBook.canBook) {
      throw new Error(canBook.reason);
    }

    // Get class details for credits
    const classDetails = await db.query.classSchedules.findFirst({
      where: eq(classSchedules.id, classScheduleId),
      with: {
        class: true
      }
    });

    if (!classDetails) {
      throw new Error('Class not found');
    }

    if (!classDetails.class) {
      throw new Error('Class not found');
    }

    return await db.transaction(async (tx) => {
      // Create booking
      const [booking] = await tx.insert(classBookings).values({
        id: crypto.randomUUID(),
        memberId,
        classScheduleId,
        creditsUsed: classDetails?.class?.creditsRequired || 0,
        memberNotes: notes,
        status: 'confirmed'
      }).returning();

      // Update member's credits if applicable
      const membership = await MemberQueries.getActiveMembership(memberId);
      if (membership?.classCreditsRemaining !== null) {
        await tx
          .update(memberMemberships)
          .set({
            classCreditsRemaining: (membership?.classCreditsRemaining || 0) - (classDetails?.class?.creditsRequired || 0)
          })
          .where(eq(memberMemberships.id, membership?.id || ''));
      }

      return booking;
    });
  }
}
