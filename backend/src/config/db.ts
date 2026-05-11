import { Sequelize } from 'sequelize';
import { env } from './env';

const sequelize = new Sequelize(env.DB.NAME, env.DB.USER, env.DB.PASSWORD, {
  host: env.DB.HOST,
  port: Number(env.DB.PORT) || 3306,
  dialect: 'mysql',
  logging: false,
});

const initDatabase = async () => {
  try {
    const syncMode = env.DB.SYNC_MODE || 'alter';

    if (syncMode === 'force') {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      await sequelize.sync({ force: true });
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      console.info('Database tables dropped and recreated.');
    } else if (syncMode === 'alter') {
      await sequelize.sync({ alter: true });
      console.info('Database synchronized.');
    } else {
      console.info('Database sync skipped. Use migrations for production.');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

export { sequelize, initDatabase };
