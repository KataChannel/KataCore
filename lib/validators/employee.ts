import { z } from 'zod';

export const createEmployeeSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  company: z.string().optional(),
  startDate: z.string().optional(), // ISO date
  employeeCode: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  userId: z.string().uuid().optional()
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

export default createEmployeeSchema;
