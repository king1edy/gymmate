// lib/db/queries/analytics.ts
// Analytics and reporting queries

import { db } from '../index';
import { members, users, payments, classSchedules, classes, classBookings } from '../schema';
import { eq, and, desc, gte, lte, count, sum, sql } from 'drizzle-orm';

export class AnalyticsQueries {
    /**
     * Get gym overview statistics
     */
    static async getGymOverview(gymId: string) {
      const [activeMembersCount] = await db
        .select({ count: count() })
        .from(members)
        .innerJoin(users, eq(members.userId, users.id))
        .where(and(
          eq(users.gymId, gymId),
          eq(members.status, 'active')
        ));
  
      const [totalRevenue] = await db
        .select({ 
          total: sum(payments.amount).mapWith(Number) 
        })
        .from(payments)
        .where(and(
          eq(payments.gymId, gymId),
          eq(payments.status, 'completed'),
          gte(payments.paymentDate, new Date(new Date().getFullYear(), new Date().getMonth(), 1))
        ));
  
      const [classesToday] = await db
        .select({ count: count() })
        .from(classSchedules)
        .innerJoin(classes, eq(classSchedules.classId, classes.id))
        .where(and(
          eq(classes.gymId, gymId),
          eq(classSchedules.status, 'scheduled'),
          gte(classSchedules.startTime, new Date(new Date().setHours(0, 0, 0, 0))),
          lte(classSchedules.startTime, new Date(new Date().setHours(23, 59, 59, 999)))
        ));
  
      return {
        activeMembers: activeMembersCount.count,
        monthlyRevenue: totalRevenue.total || 0,
        classesToday: classesToday.count,
        // Add more metrics as needed
      };
    }
  
    /**
     * Get member growth over time
     */
    static async getMemberGrowth(gymId: string, months = 12) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
  
      return await db
        .select({
          month: sql<string>`to_char(${members.joinDate}, 'YYYY-MM')`,
          count: count()
        })
        .from(members)
        .innerJoin(users, eq(members.userId, users.id))
        .where(and(
          eq(users.gymId, gymId),
          gte(members.joinDate, startDate.toISOString())
        ))
        .groupBy(sql`to_char(${members.joinDate}, 'YYYY-MM')`)
        .orderBy(sql`to_char(${members.joinDate}, 'YYYY-MM')`);
    }
  
    /**
     * Get popular classes
     */
    static async getPopularClasses(gymId: string, limit = 10) {
      return await db
        .select({
          class: classes,
          bookingCount: count(classBookings.id)
        })
        .from(classes)
        .leftJoin(classSchedules, eq(classes.id, classSchedules.classId))
        .leftJoin(classBookings, and(
          eq(classSchedules.id, classBookings.classScheduleId),
          eq(classBookings.status, 'completed')
        ))
        .where(eq(classes.gymId, gymId))
        .groupBy(classes.id)
        .orderBy(desc(count(classBookings.id)))
        .limit(limit);
    }
  }
  