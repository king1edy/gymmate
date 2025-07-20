// lib/hooks/useClasses.ts
// Custom hook for class management
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface ClassSchedule {
    id: string;
    startTime: string;
    endTime: string;
    status: string;
    class: {
      id: string;
      name: string;
      description: string;
      durationMinutes: number;
      capacity: number;
      price: string;
      creditsRequired: number;
    };
    trainer?: {
      id: string;
      user: {
        firstName: string;
        lastName: string;
      };
    };
    area?: {
      name: string;
    };
    bookedCount: number;
  }
  
  export function useClasses(startDate?: Date, endDate?: Date) {
    const { data: session } = useSession();
    const [classes, setClasses] = useState<ClassSchedule[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    const fetchClasses = async () => {
      if (!session) return;
  
      setLoading(true);
      setError(null);
  
      try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate.toISOString());
        if (endDate) params.append('endDate', endDate.toISOString());
  
        const response = await fetch(`/api/classes/schedule?${params}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch classes');
        }
  
        const data = await response.json();
        setClasses(data.classes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchClasses();
    }, [session, startDate, endDate]);
  
    const bookClass = async (classScheduleId: string, notes?: string) => {
      setLoading(true);
      try {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ classScheduleId, notes }),
        });
  
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to book class');
        }
  
        const data = await response.json();
        await fetchClasses(); // Refresh list
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        throw err;
      } finally {
        setLoading(false);
      }
    };
  
    return {
      classes,
      loading,
      error,
      fetchClasses,
      bookClass,
    };
  }