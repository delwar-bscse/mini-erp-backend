import { z } from 'zod';
import { USER_ROLES } from '../../../enums/user';

// 1. Create User Schema
const createUserZodValidationSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required' }),
        email: z.string({ required_error: 'Email is required' }).email({ message: 'Invalid email format' }),
        password: z.string({ required_error: 'Password is required' }),
        role: z.nativeEnum(USER_ROLES,{required_error:'Role is required'})
    })
});

// 2. Update User Schema
const updateUserZodValidationSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        password: z.string().optional(),
        role: z.nativeEnum(USER_ROLES).optional()
    })
});

export const UserValidation = {
    createUserZodValidationSchema,
    updateUserZodValidationSchema
}