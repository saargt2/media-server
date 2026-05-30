import { z } from 'zod';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import {
  ZodTypeProvider,
  jsonSchemaTransform,
  validatorCompiler,
  serializerCompiler,
} from '@fastify/type-provider-zod';
import { API_PREFIX } from '@media-server/shared';
import { loadConfig } from './config';
import tvRoutes from './routes/tv';
import moviesRoutes from './routes/movies';

loadConfig();

const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

await app.register(cors);
await app.register(swagger, {
  openapi: {
    info: {
      title: 'Media Server API',
      version: '0.1.0',
      description: 'Self-hosted media server for downloading TV shows and movies via torrent, served through Plex.',
    },
  },
  transform: jsonSchemaTransform,
});
await app.register(swaggerUi, {
  routePrefix: '/docs',
});

await app.register(tvRoutes, { prefix: `${API_PREFIX}/tv` });
await app.register(moviesRoutes, { prefix: `${API_PREFIX}/movies` });

app.get(`${API_PREFIX}/health`, {
  schema: {
    response: {
      200: z.object({
        success: z.literal(true),
        data: z.object({
          status: z.string(),
          uptime: z.number(),
        }),
      }),
    },
  },
}, async () => {
  return { success: true as const, data: { status: 'ok', uptime: process.uptime() } };
});

const PORT = Number(process.env.PORT) || 3000;

try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`API server running on http://localhost:${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
