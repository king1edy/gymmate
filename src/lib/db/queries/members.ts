// lib/db/queries/members.ts
// Pre-built queries for member operations

import { db } from '../index';
import { 
  members, 
  users, 
  memberMemberships, 
  membershipPlans,
  classBookings,
  classSchedules,
  classes,
  healthMetrics,
  workouts,
  paymentMethods
} from '../schema';
import { eq, and, desc, gte, lte, count } from 'drizzle-orm';

export class MemberQueries {
  /**
   * Get member with full profile
   */
  static async getMemberProfile(memberId: string) {
    return await db.query.members.findFirst({
      where: eq(members.id, memberId),
      with: {
        user: {
          with: {
            gym: true
          }
        },
        memberMemberships: {
          with: {
            membershipPlan: true
          },
          where: eq(memberMemberships.status, 'active')
        },
        paymentMethods: {
          where: eq(paymentMethods.isActive, true)
        }
      }
    });
  }

  /**
   * Get member's active membership
   */
  static async getActiveMembership(memberId: string) {
    return await db.query.memberMemberships.findFirst({
      where: and(
        eq(memberMemberships.memberId, memberId),
        eq(memberMemberships.status, 'active')
      ),
      with: {
        membershipPlan: true
      }
    });
  }

  /**
   * Get member's upcoming class bookings
   */
  static async getUpcomingBookings(memberId: string, limit = 10) {
    return await db
      .select({
        booking: classBookings,
        schedule: classSchedules,
        class: classes,
      })
      .from(classBookings)
      .innerJoin(classSchedules, eq(classBookings.classScheduleId, classSchedules.id))
      .innerJoin(classes, eq(classSchedules.classId, classes.id))
      .where(and(
        eq(classBookings.memberId, memberId),
        eq(classBookings.status, 'confirmed'),
        gte(classSchedules.startTime, new Date())
      ))
      .orderBy(classSchedules.startTime)
      .limit(limit);
  }

  /**
   * Get member's workout history
   */
  static async getWorkoutHistory(memberId: string, limit = 20) {
    return await db.query.workouts.findMany({
      where: eq(workouts.memberId, memberId),
      orderBy: desc(workouts.workoutDate),
      limit
    });
  }

  /**
   * Get member's health metrics over time
   */
  static async getHealthMetricsHistory(
    memberId: string, 
    startDate?: Date, 
    endDate?: Date
  ) {
    const conditions = [eq(healthMetrics.memberId, memberId)];
    
    if (startDate) {
      conditions.push(gte(healthMetrics.recordedDate, startDate.toISOString()));
    }
    
    if (endDate) {
      conditions.push(lte(healthMetrics.recordedDate, endDate.toISOString()));
    }

    return await db.query.healthMetrics.findMany({
      where: and(...conditions),
      orderBy: desc(healthMetrics.recordedDate)
    });
  }

  /**
   * Get member statistics
   */
  static async getMemberStats(memberId: string) {
    const [workoutCount] = await db
      .select({ count: count() })
      .from(workouts)
      .where(eq(workouts.memberId, memberId));

    const [bookingCount] = await db
      .select({ count: count() })
      .from(classBookings)
      .where(and(
        eq(classBookings.memberId, memberId),
        eq(classBookings.status, 'completed')
      ));

    const latestMetrics = await db.query.healthMetrics.findFirst({
      where: eq(healthMetrics.memberId, memberId),
      orderBy: desc(healthMetrics.recordedDate)
    });

    return {
      totalWorkouts: workoutCount.count,
      totalClassesAttended: bookingCount.count,
      latestWeight: latestMetrics?.weight,
      latestBMI: latestMetrics?.bmi,
      memberSince: await this.getMemberJoinDate(memberId)
    };
  }

  static async getMemberJoinDate(memberId: string) {
    const member = await db.query.members.findFirst({
      where: eq(members.id, memberId),
      columns: { joinDate: true }
    });
    
    return member?.joinDate;
  }
}
