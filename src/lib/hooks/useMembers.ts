// lib/hooks/useMembers.ts
// Custom hook for member management

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Member, MembersResponse } from '@/types';

export function useMembers(page = 1, limit = 20, search?: string, status?: string) {
  const { data: session } = useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    if (!session) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(status && { status }),
      });

      const response = await fetch(`/api/members?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }

      const data: MembersResponse = await response.json();
      setMembers(data.members);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [session, page, limit, search, status]);

  const createMember = async (memberData: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create member');
      }

      const data = await response.json();
      await fetchMembers(); // Refresh list
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    members,
    pagination,
    loading,
    error,
    fetchMembers,
    createMember,
  };
}