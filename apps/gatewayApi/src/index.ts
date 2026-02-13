import express, { NextFunction, Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { env_config_variable } from '@dam/config/env_variables';
import { logger } from '@dam/config/logs';

const app = express();

app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
});

const createServiceProxy = (routePath: string, target: string) => {
  app.use(
    routePath,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      timeout: 5000,
      proxyTimeout: 5000,

      on: {
        proxyReq: (proxyReq, req: Request) => {
          logger.info(`Forwarding ${req.method} ${req.url} → ${target}`);
        },
        error: (err, req, res) => {
          logger.error({
            message: 'Proxy Error',
            error: err.message,
          });

          if ('status' in res) {
            const expressRes = res as Response;

            if (!expressRes.headersSent) {
              expressRes.status(502).json({
                success: false,
                message: 'Service temporarily unavailable',
              });
            }
          } else {
            const socket = res;
            socket.end();
          }
        },
      },
    }),
  );
};

createServiceProxy('/auth', env_config_variable.SERVICE_URI.AUTH as string);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({
    message: 'Unhandled Gateway Error',
    error: err.message,
  });

  res.status(500).json({
    success: false,
    message: 'Internal Gateway Error',
  });
});

app.listen(env_config_variable.PORT.MAIN_PORT, '0.0.0.0', () => {
  logger.info(`Gateway running on port ${env_config_variable.PORT.MAIN_PORT}`);
});
