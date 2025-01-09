import { z } from "zod";

export const dipdupLvlSchema = z.tuple([z.object({ level: z.number() })]);
