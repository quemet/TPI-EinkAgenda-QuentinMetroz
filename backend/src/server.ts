import { initDatabase } from './config/db';
import { env } from './config/env';

if (env.NODE_ENV !== 'test') {
  initDatabase()
    .then(() => {
      console.info('Database initialized successfully.');
    })
    .catch((err) => {
      console.error('Failed to initialize database:', err);
      process.exit(1);
    });
}
