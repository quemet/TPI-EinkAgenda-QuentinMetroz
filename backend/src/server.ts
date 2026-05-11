import { initDatabase } from './config/db';

initDatabase()
  .then(() => {
    console.info('Database initialized successfully.');
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
