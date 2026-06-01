import { Sequelize } from 'sequelize';
import Agenda from '../models/agenda.model';
import Appertain from '../models/appertain.model';
import Belong from '../models/belong.model';
import Event from '../models/event.model';
import Family from '../models/family.model';
import User from '../models/user.model';
import { afterAll, beforeAll, beforeEach } from '@jest/globals';

let sequelize: Sequelize;

beforeAll(async () => {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
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

  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

beforeEach(async () => {
  await Agenda.destroy({ where: {} });
  await Appertain.destroy({ where: {} });
  await Belong.destroy({ where: {} });
  await Event.destroy({ where: {} });
  await Family.destroy({ where: {} });
  await User.destroy({ where: {} });
});

export { sequelize };
