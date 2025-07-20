'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { registerUser } from '@/lib/auth/actions';

export default function Register() {
  const [formData, setFormData] = useState<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'trainer' | 'member';
    gymName: string;
  }>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'member',
    gymName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await registerUser(formData);
      router.push('/auth/signin?message=Registration successful');
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register for GymMate</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Form fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">First Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Last Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium">Password</label>
              <input
                type="password"
                required
                minLength={8}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium">Role</label>
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
              >
                <option value="member">Member</option>
                <option value="trainer">Trainer</option>
                <option value="admin">Gym Admin</option>
              </select>
            </div>
            
            {formData.role === 'admin' && (
              <div>
                <label className="block text-sm font-medium">Gym Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={formData.gymName}
                  onChange={(e) => setFormData(prev => ({ ...prev, gymName: e.target.value }))}
                />
              </div>
            )}
            
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Creating Account...' : 'Register'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}