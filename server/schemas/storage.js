import { z } from 'zod';

export const storageConfigSchema = z.object({
  name: z.string().min(1),
  provider: z.enum(['aws', 'azure', 'gcp']),
  config: z.object({}).passthrough(),
});

export const shareLinkSchema = z.object({
  password: z.string().optional(),
  expiresAt: z.string().datetime(),
});