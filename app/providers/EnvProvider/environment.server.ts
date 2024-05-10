import * as z from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  GOOGLE_MAPS_API_KEY: z.string().min(1),
});

const environment = () => environmentSchema.parse(process.env);

export { environment };
