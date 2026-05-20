import { Sequelize } from 'sequelize';
import { env } from './env';
import Agenda from '../models/agenda.model';
import Appertain from '../models/appertain.model';
import Belong from '../models/belong.model';
import Event from '../models/event.model';
import Family from '../models/family.model';
import User from '../models/user.model';

const sequelize = new Sequelize(env.DB.NAME, env.DB.USER, env.DB.PASSWORD, {
  host: env.DB.HOST,
  port: Number(env.DB.PORT) || 3306,
  dialect: 'mysql',
  logging: false,
});

Agenda.initModel(sequelize);
Appertain.initModel(sequelize);
Belong.initModel(sequelize);
Event.initModel(sequelize);
Family.initModel(sequelize);
User.initModel(sequelize);

Family.hasMany(Agenda, { foreignKey: 'familyId' });
Agenda.belongsTo(Family, { foreignKey: 'familyId' });

Agenda.hasMany(Event, { foreignKey: 'agendaId' });
Event.belongsTo(Agenda, { foreignKey: 'agendaId' });

Family.belongsToMany(User, {
  through: Belong,
  foreignKey: 'family_id',
  otherKey: 'user_id',
});

User.belongsToMany(Family, {
  through: Belong,
  foreignKey: 'user_id',
  otherKey: 'family_id',
});

Family.belongsToMany(User, {
  through: Appertain,
  foreignKey: 'family_id',
  otherKey: 'family_adminId',
  as: 'admins',
});

User.belongsToMany(Family, {
  through: Appertain,
  foreignKey: 'family_adminId',
  otherKey: 'family_id',
  as: 'administeredFamilies',
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
