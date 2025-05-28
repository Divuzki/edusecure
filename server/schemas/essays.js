import { z } from 'zod';

export const essaySchema = z.object({
  title: z.string().min(1),
  content: z.string().min(100),
  courseId: z.string(),
});

export const gradeSchema = z.object({
  score: z.object({
    overall: z.number().min(0).max(1),
    coherence: z.number().min(0).max(1),
    grammar: z.number().min(0).max(1),
    structure: z.number().min(0).max(1),
    feedback: z.string(),
  }),
});