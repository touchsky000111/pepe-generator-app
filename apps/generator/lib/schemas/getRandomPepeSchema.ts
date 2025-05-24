import { z } from 'zod';

export const getRandomPepeSchema = {
  request: z.object({}),

  response: z.object({
    pepe: z.object({
      id: z.number({
        required_error: 'ID is missing.',
      }),
      imageUrl: z.string().optional(),
      isApproved: z.boolean(),
      labels: z.array(z.string()),
      traits: z.array(
        z.object({
          id: z.number(),
          file: z.string(),
          folder: z.string(),
          imageUrl: z.string().optional(),
          index: z.number(),
          name: z.string(),
          optionId: z.number(),
          value: z.string(),
        }),
      ),
    }),
  }),
};

export type GetRandomPepeRequest = z.infer<typeof getRandomPepeSchema.request>;

export type GetRandomPepeResponse = z.infer<typeof getRandomPepeSchema.response>;
