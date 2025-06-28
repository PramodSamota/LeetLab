import { z } from "zod";

const playlistSchema = z.object({
  name: z.string(),
  description: z.string(),
  visibilty: z.boolean().default(false),
  type: z.string().default("private"),
});

const createPlaylistValidation = (data) => {
  return playlistSchema.safeParse(data);
};

export { createPlaylistValidation };
