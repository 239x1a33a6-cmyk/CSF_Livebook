import { z } from 'zod';

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url().optional(),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    CLIENT_URL: z.string().url().default('http://localhost:5173'),
    SERVER_PORT: z.coerce.number().default(4000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
