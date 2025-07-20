// components/classes/ClassSchedule.tsx
// Class schedule component

'use client';

import { useState, useMemo } from 'react';
import { useClasses } from '@/lib/hooks/useClasses';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';

export default function ClassSchedule() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');

  // Calculate date range based on view mode
  const { startDate, endDate } = useMemo(() => {
    const start = new Date(selectedDate);
    let end = new Date(selectedDate);

    if (viewMode === 'day') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else {
      // Week view
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    }

    return { startDate: start, endDate: end };
  }, [selectedDate, viewMode]);

  const { classes, loading, error, bookClass } = useClasses(startDate, endDate);

  // Group classes by date for display
  const classesByDate = useMemo(() => {
    const grouped: { [key: string]: typeof classes } = {};
    
    classes.forEach((classItem) => {
      const date = new Date(classItem.startTime).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(classItem);
    });

    // Sort classes within each date by start time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    });

    return grouped;
  }, [classes]);

  const handleBookClass = async (classScheduleId: string) => {
    try {
      await bookClass(classScheduleId);
      // Show success message
    } catch (error) {
      // Show error message
      console.error('Failed to book class:', error);
    }
  };

  const getAvailabilityColor = (bookedCount: number, capacity: number) => {
    const percentage = (bookedCount / capacity) * 100;
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 80) return 'text-orange-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Schedule</h1>
          <p className="text-gray-600">Book your fitness classes</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('day')}
          >
            Day
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Week
          </Button>
        </div>
      </div>

      {/* Date Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(newDate.getDate() - (viewMode === 'day' ? 1 : 7));
                setSelectedDate(newDate);
              }}
            >
              Previous
            </Button>
            <div className="text-lg font-semibold">
              {viewMode === 'day' 
                ? selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })
                : `${startDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })} - ${endDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}`
              }
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(newDate.getDate() + (viewMode === 'day' ? 1 : 7));
                setSelectedDate(newDate);
              }}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Classes Display */}
      <div className="space-y-6">
        {Object.keys(classesByDate).length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">No classes scheduled for this period.</p>
            </CardContent>
          </Card>
        ) : (
          Object.keys(classesByDate)
            .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
            .map((date) => (
              <div key={date}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classesByDate[date].map((classItem) => (
                    <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">
                            {classItem.class.name}
                          </CardTitle>
                          <Badge variant="secondary">
                            ${classItem.class.price}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-sm mb-4">
                          {classItem.class.description}
                        </p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            {new Date(classItem.startTime).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            })} - {new Date(classItem.endTime).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </div>
                          
                          <div className="flex items-center text-gray-600">
                            <Users className="h-4 w-4 mr-2" />
                            <span className={getAvailabilityColor(classItem.bookedCount, classItem.class.capacity)}>
                              {classItem.bookedCount}/{classItem.class.capacity} booked
                            </span>
                          </div>

                          {classItem.trainer && (
                            <div className="flex items-center text-gray-600">
                              <Users className="h-4 w-4 mr-2" />
                              {classItem.trainer.user.firstName} {classItem.trainer.user.lastName}
                            </div>
                          )}

                          {classItem.area && (
                            <div className="flex items-center text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              {classItem.area.name}
                            </div>
                          )}
                        </div>

                        <div className="mt-4">
                          <Button
                            className="w-full"
                            disabled={classItem.bookedCount >= classItem.class.capacity}
                            onClick={() => handleBookClass(classItem.id)}
                          >
                            {classItem.bookedCount >= classItem.class.capacity 
                              ? 'Class Full' 
                              : `Book Class (${classItem.class.creditsRequired} credit${classItem.class.creditsRequired !== 1 ? 's' : ''})`
                            }
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>


      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}