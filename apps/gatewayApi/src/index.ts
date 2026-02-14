import Fastify, {
  FastifyReply,
  FastifyRequest,
  HookHandlerDoneFunction,
} from 'fastify';
import httpProxy from '@fastify/http-proxy';
import { env_config_variable } from '@dam/config/env_variables';
import { logger } from '@dam/config/logs';

const app = Fastify({ logger: false });

app.addHook('onRequest', async (request, reply) => {
  const start = Date.now();

  reply.raw.on('finish', () => {
    const duration = Date.now() - start;

    logger.info({
      method: request.method,
      url: request.url,
      status: reply.statusCode,
      duration: `${duration}ms`,
    });
  });
});

const createServiceProxy = async (routePath: string, target: string) => {
  await app.register(httpProxy, {
    upstream: target,
    prefix: routePath,
    rewritePrefix: '',

    http2: false,

    preHandler: (
      request: FastifyRequest,
      reply: FastifyReply,
      done: HookHandlerDoneFunction,
    ) => {
      logger.info(`Forwarding ${request.method} ${request.url} → ${target}`);
      done();
    },

    // i can omit also the done and use async

    replyOptions: {
      onError(reply, error) {
        logger.error({
          message: 'Proxy Error',
          error: error.error.message,
        });

        if (!reply.sent) {
          reply.status(502).send({
            success: false,
            message: 'Service temporarily unavailable',
          });
        }
      },
    },
  });
};

createServiceProxy('/auth', env_config_variable.SERVICE_URI.AUTH as string);

app.setErrorHandler(
  (error: Error, request: FastifyRequest, reply: FastifyReply) => {
    logger.error({
      message: 'Unhandled Gateway Error',
      error: error.message,
    });

    if (!reply.sent) {
      reply.status(500).send({
        success: false,
        message: 'Internal Gateway Error',
      });
    }
  },
);

const start = async () => {
  try {
    await app.listen({
      port: env_config_variable.PORT.MAIN_PORT,
      host: '0.0.0.0',
    });

    logger.info(
      `Gateway running on port ${env_config_variable.PORT.MAIN_PORT}`,
    );
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();
