// types/index.ts
// Type definitions for the application
import type { Socket } from 'socket.io';

// GymMate socket
export interface GymmateSocket extends Socket {
  userId?: string;
  gymId?: string;
  role?: string;
}

export interface UseWebSocketOptions {
  onClassUpdated?: (data: any) => void;
  onEquipmentStatusChanged?: (data: any) => void;
  onTrainerAvailabilityUpdated?: (data: any) => void;
}

// Modal props
export interface ModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export interface Member {
    id: string;
    membershipNumber: string;
    status: string;
    joinDate: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      phone?: string;
      profilePhotoUrl?: string;
    };
    activeMembership?: {
      membershipPlan: {
        name: string;
        price: string;
      };
      status: string;
      nextBillingDate: string;
    };
}
  
export interface MembersResponse {
    members: Member[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
  
export interface OverviewStats {
    activeMembers: number;
    monthlyRevenue: number;
    classesToday: number;
}

export interface TrainerScheduleItem {
  id: string;
  type: 'class' | 'personal_training' | 'blocked';
  title: string;
  startTime: string;
  endTime: string;
  location?: string;
  participants?: number;
  maxParticipants?: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface TrainerScheduleProps {
  trainerId?: string;
  editable?: boolean;
}

// Equipment
export interface Equipment {
  id: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  status: 'operational' | 'maintenance' | 'out_of_order' | 'retired';
  conditionRating: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  area: {
    name: string;
  };
  category: {
    name: string;
  };
}

// RevenueChart
export interface RevenueData {
  month: string;
  revenue: number;
  subscriptions: number;
  oneTime: number;
  memberCount: number;
}
// RevenueCharts props
export interface RevenueChartProps {
  gymId: string;
  period?: 'month' | 'year';
}

// mobile Member app dashboard
export interface MemberDashboardData {
  member: {
    name: string;
    membershipPlan: string;
    creditsRemaining: number;
    memberSince: string;
  };
  upcomingClasses: Array<{
    id: string;
    name: string;
    startTime: string;
    instructor: string;
    location: string;
  }>;
  recentWorkouts: Array<{
    id: string;
    date: string;
    type: string;
    duration: number;
    caloriesBurned: number;
  }>;
  healthProgress: {
    currentWeight: number;
    goalWeight: number;
    weightChange: number;
    streakDays: number;
  };
  notifications: Array<{
    id: string;
    type: 'reminder' | 'achievement' | 'system';
    message: string;
    timestamp: string;
    read: boolean;
  }>;
}
