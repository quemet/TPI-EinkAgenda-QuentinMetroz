import { initDatabase } from './config/db';
import * as eventRouter from './routes/event.route';
import * as authRouter from './routes/auth.route';
import * as agendaRouter from './routes/agenda.route';
import * as familleRouter from './routes/family.route';
import * as userRouter from './routes/user.route';
import express from 'express';
import { env } from './config/env';
import cors from 'cors';
// import { globalLimiter } from './middlewares/rateLimit.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import { notFoundMiddleware } from './middlewares/notFound.middleware';
import swaggerUi from 'swagger-ui-express';
import { parse as parseYaml } from 'yaml';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = env.SERVER.PORT || 3000;

const swaggerDocument = parseYaml(fs.readFileSync(path.join(__dirname, 'swagger.yaml'), 'utf8'));

app.use(
  cors({
    origin: env.SERVER.CORS,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(globalLimiter);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/events', eventRouter.default);
app.use('/api/auth', authRouter.default);
app.use('/api/agendas', agendaRouter.default);
app.use('/api/families', familleRouter.default);
app.use('/api/users', userRouter.default);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

if (env.NODE_ENV !== 'test') {
  initDatabase()
    .then(() => {
      console.info('Database initialized successfully.');
      app.listen(PORT, () => {
        console.info(`Server is running on port ${PORT}`);
        console.info(`Swagger docs available at http://localhost:${PORT}/api/docs`);
      });
    })
    .catch((error) => {
      console.error('Failed to initialize database:', error);
      process.exit(1);
    });
}

export default app;
