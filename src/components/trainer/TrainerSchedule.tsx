// components/trainer/TrainerSchedule.tsx
// Trainer scheduling component

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, MapPin, Plus } from 'lucide-react';
import type { TrainerScheduleItem, TrainerScheduleProps } from '@/types'; // or the correct path

export default function TrainerSchedule({ trainerId, editable = false }: TrainerScheduleProps) {
  const [schedule, setSchedule] = useState<TrainerScheduleItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');

  useEffect(() => {
    fetchSchedule();
  }, [trainerId, selectedDate, viewMode]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const startDate = getViewStartDate();
      const endDate = getViewEndDate();
      
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ...(trainerId && { trainerId }),
      });

      const response = await fetch(`/api/trainers/schedule?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSchedule(data.schedule);
      }
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const getViewStartDate = () => {
    const start = new Date(selectedDate);
    if (viewMode === 'day') {
      start.setHours(0, 0, 0, 0);
    } else {
      start.setDate(start.getDate() - start.getDay()); // Start of week
      start.setHours(0, 0, 0, 0);
    }
    return start;
  };

  const getViewEndDate = () => {
    const end = new Date(selectedDate);
    if (viewMode === 'day') {
      end.setHours(23, 59, 59, 999);
    } else {
      end.setDate(end.getDate() - end.getDay() + 6); // End of week
      end.setHours(23, 59, 59, 999);
    }
    return end;
  };

  const getItemTypeColor = (type: string) => {
    switch (type) {
      case 'class': return 'bg-blue-100 text-blue-800';
      case 'personal_training': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-gray-100 text-gray-800';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const timeSlots = Array.from({ length: 14 }, (_, i) => i + 6); // 6 AM to 8 PM

  const getScheduleForTimeSlot = (hour: number, date: Date) => {
    return schedule.filter(item => {
      const itemDate = new Date(item.startTime);
      const itemHour = itemDate.getHours();
      return itemDate.toDateString() === date.toDateString() && itemHour === hour;
    });
  };

  const getDaySchedule = (date: Date) => {
    return schedule.filter(item => {
      const itemDate = new Date(item.startTime);
      return itemDate.toDateString() === date.toDateString();
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
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
          <h1 className="text-2xl font-bold text-gray-900">
            {trainerId ? 'Trainer Schedule' : 'My Schedule'}
          </h1>
          <p className="text-gray-600">Manage classes and training sessions</p>
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
          {editable && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          )}
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
                : `${getViewStartDate().toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })} - ${getViewEndDate().toLocaleDateString('en-US', { 
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

      {/* Schedule Display */}
      {viewMode === 'day' ? (
        /* Day View */
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {getDaySchedule(selectedDate).length === 0 ? (
                <p className="text-center text-gray-600 py-8">No events scheduled for this day</p>
              ) : (
                getDaySchedule(selectedDate).map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{item.title}</h3>
                          <Badge className={getItemTypeColor(item.type)}>
                            {item.type.replace('_', ' ')}
                          </Badge>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {new Date(item.startTime).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit' 
                            })} - {new Date(item.endTime).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit' 
                            })}
                          </div>
                          
                          {item.location && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {item.location}
                            </div>
                          )}
                          
                          {item.participants !== undefined && (
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {item.participants}/{item.maxParticipants || '∞'}
                            </div>
                          )}
                        </div>
                        
                        {item.notes && (
                          <p className="text-sm text-gray-600 mt-2">{item.notes}</p>
                        )}
                      </div>
                      
                      {editable && (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="outline">Cancel</Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Week View */
        <Card>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 w-20">Time</th>
                    {Array.from({ length: 7 }, (_, i) => {
                      const date = new Date(getViewStartDate());
                      date.setDate(date.getDate() + i);
                      return (
                        <th key={i} className="border p-2 min-w-32">
                          <div className="text-sm">
                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                          <div className="text-xs text-gray-600">
                            {date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map(hour => (
                    <tr key={hour}>
                      <td className="border p-2 text-sm text-gray-600">
                        {hour}:00
                      </td>
                      {Array.from({ length: 7 }, (_, i) => {
                        const date = new Date(getViewStartDate());
                        date.setDate(date.getDate() + i);
                        const items = getScheduleForTimeSlot(hour, date);
                        
                        return (
                          <td key={i} className="border p-1 h-16 align-top">
                            {items.map(item => (
                              <div
                                key={item.id}
                                className="text-xs p-1 mb-1 rounded bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                                title={`${item.title}\n${new Date(item.startTime).toLocaleTimeString()} - ${new Date(item.endTime).toLocaleTimeString()}`}
                              >
                                <div className="font-medium truncate">{item.title}</div>
                                {item.participants !== undefined && (
                                  <div className="text-xs">{item.participants} people</div>
                                )}
                              </div>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}