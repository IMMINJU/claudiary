import { z } from "zod";
import { POST_STATUS, POST_SOURCE } from "@/lib/constants";

export const createPostSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1),
  excerpt: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).max(10).default([]),
  conversationId: z.string().max(255).optional(),
  slug: z.string().max(500).optional(),
});

export const updatePostSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  status: z.enum([POST_STATUS.DRAFT, POST_STATUS.PUBLISHED]).optional(),
  slug: z.string().max(500).optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
