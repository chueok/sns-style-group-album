import { z } from 'zod';
import { EContentCategory } from '../type/content-category';

const SBase = z.object({
  id: z.string(),
  groupId: z.string(),
  category: z.enum([EContentCategory.IMAGE, EContentCategory.VIDEO]),
  ownerId: z.string(),
  originalUrl: z.string(),
  thumbnailUrl: z.string().nullable(),

  size: z.number(),
  ext: z.string(),
  mimeType: z.string(),

  numLikes: z.number(),
  numComments: z.number(),
  createdDateTime: z.date(),
  updatedDateTime: z.date().nullable(),
});

/**
 * image
 */
export const SImage = SBase.extend({
  category: z.literal(EContentCategory.IMAGE),
  largeUrl: z.string().nullable(),
});

export type TImage = z.infer<typeof SImage>;

/**
 * video
 */
export const SVideo = SBase.extend({
  category: z.literal(EContentCategory.VIDEO),
});

export type TVideo = z.infer<typeof SVideo>;

/**
 * media
 */
export const SMedia = z.discriminatedUnion('category', [SImage, SVideo]);

export type TMedia = z.infer<typeof SMedia>;
