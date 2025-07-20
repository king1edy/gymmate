// components/mobile/MemberAppDashboard.tsx
// Mobile-optimized member dashboard

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Activity, 
  Target, 
  TrendingUp, 
  Bell,
  User,
  Menu,
  X
} from 'lucide-react';
import { MemberDashboardData } from '@/types';

export default function MemberAppDashboard() {
  const [data, setData] = useState<MemberDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/member/dashboard');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Failed to load dashboard</p>
      </div>
    );
  }

  const unreadNotifications = data.notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
          
          <button className="p-2 -mr-2 rounded-md text-gray-600 hover:bg-gray-100 relative">
            <Bell className="h-6 w-6" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <MobileSidebar member={data.member} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 pb-20 space-y-4">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-2">Welcome back, {data.member.name}!</h2>
            <p className="opacity-90">You have {data.member.creditsRemaining} class credits remaining</p>
            <div className="mt-4 flex space-x-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                {data.member.membershipPlan}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                Member since {new Date(data.member.memberSince).getFullYear()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Activity className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{data.recentWorkouts.length}</div>
              <div className="text-sm text-gray-600">Workouts This Week</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{data.healthProgress.streakDays}</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Health Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Health Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Current Weight</span>
                <span className="font-bold">{data.healthProgress.currentWeight} lbs</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Goal Weight</span>
                <span className="font-bold">{data.healthProgress.goalWeight} lbs</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ 
                    width: `${Math.min(100, Math.abs(data.healthProgress.weightChange) / Math.abs(data.healthProgress.goalWeight - data.healthProgress.currentWeight) * 100)}%` 
                  }}
                ></div>
              </div>

              <div className="text-center">
                <span className={`text-sm font-medium ${data.healthProgress.weightChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.healthProgress.weightChange > 0 ? '+' : ''}{data.healthProgress.weightChange} lbs this month
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Upcoming Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.upcomingClasses.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No upcoming classes</p>
            ) : (
              <div className="space-y-3">
                {data.upcomingClasses.slice(0, 3).map((classItem) => (
                  <div key={classItem.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{classItem.name}</h4>
                        <p className="text-sm text-gray-600">with {classItem.instructor}</p>
                        <p className="text-sm text-gray-600">{classItem.location}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {new Date(classItem.startTime).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(classItem.startTime).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button className="w-full mt-4" variant="outline">
              Book More Classes
            </Button>
          </CardContent>
        </Card>

        {/* Recent Workouts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Workouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentWorkouts.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No recent workouts</p>
            ) : (
              <div className="space-y-3">
                {data.recentWorkouts.slice(0, 3).map((workout) => (
                  <div key={workout.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{workout.type}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(workout.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <div>{workout.duration} min</div>
                        <div className="text-gray-600">{workout.caloriesBurned} cal</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button className="w-full mt-4" variant="outline">
              Log New Workout
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <button className="flex flex-col items-center p-2 text-blue-600">
            <Activity className="h-6 w-6" />
            <span className="text-xs mt-1">Dashboard</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-600">
            <Calendar className="h-6 w-6" />
            <span className="text-xs mt-1">Classes</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-600">
            <Target className="h-6 w-6" />
            <span className="text-xs mt-1">Goals</span>
          </button>
          <button className="flex flex-col items-center p-2 text-gray-600">
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function MobileSidebar({ member }: { member: any }) {
  return (
    <div className="flex flex-grow flex-col overflow-y-auto bg-white pt-5 pb-4">
      <div className="flex flex-shrink-0 items-center px-4">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
          {member.name.charAt(0)}
        </div>
        <div className="ml-3">
          <div className="text-base font-medium text-gray-900">{member.name}</div>
          <div className="text-sm text-gray-500">{member.membershipPlan}</div>
        </div>
      </div>
      
      <nav className="mt-5 flex-1 space-y-1 px-2 pb-4">
        {[
          { name: 'Dashboard', icon: Activity },
          { name: 'Classes', icon: Calendar },
          { name: 'Workouts', icon: Target },
          { name: 'Health', icon: TrendingUp },
          { name: 'Profile', icon: User },
        ].map((item) => (
          <a
            key={item.name}
            href="#"
            className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <item.icon className="mr-4 h-6 w-6 flex-shrink-0" />
            {item.name}
          </a>
        ))}
      </nav>
    </div>
  );
}