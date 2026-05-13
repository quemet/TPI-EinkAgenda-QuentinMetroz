import { initDatabase } from './config/db';
import * as eventRouter from './routes/event.route';
import express from 'express';
import { env } from './config/env';
import cors from 'cors';
import { globalLimiter } from './middlewares/rateLimit.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import { notFoundMiddleware } from './middlewares/notFound.middleware';

const app = express();
const PORT = env.SERVER.PORT || 3000;

app.use(
  cors({
    origin: env.SERVER.CORS,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(globalLimiter);

app.use('/api/events', eventRouter.default);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

if (env.NODE_ENV !== 'test') {
  initDatabase()
    .then(() => {
      console.info('Database initialized successfully.');
      app.listen(PORT, () => {
        console.info(`Server is running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error('Failed to initialize database:', error);
      process.exit(1);
    });
}

export default app;
