'use server';

import { hash } from 'bcryptjs';
import { db } from '@/lib/db';
import { users, gyms } from '@/lib/db/schema';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['admin', 'trainer', 'member']),
  gymName: z.string().optional(),
});

export async function registerUser(data: z.infer<typeof registerSchema>) {
  const validated = registerSchema.parse(data);
  
  // Hash password
  const passwordHash = await hash(validated.password, 12);
  
  // Create gym if admin
  let gymId = null;
  if (validated.role === 'admin' && validated.gymName) {
    const [gym] = await db.insert(gyms).values({
      name: validated.gymName,
      slug: validated.gymName.toLowerCase().replace(/ /g, '-'),
    }).returning();
    gymId = gym.id;
  }
  
  // Create user
  const [user] = await db.insert(users).values({
    email: validated.email,
    passwordHash,
    firstName: validated.firstName,
    lastName: validated.lastName,
    role: validated.role,
    gymId,
  }).returning();
  
  return user;
}