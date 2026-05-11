import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import type { Sequelize } from 'sequelize';

export default class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare username: string;
  declare email: string;
  declare password: string;
  declare role: 'user' | 'family-admin' | 'app-admin';
  declare personType: 'young' | 'elder';

  static initModel(sequelize: Sequelize) {
    User.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        username: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        role: {
          type: DataTypes.ENUM('user', 'family-admin', 'app-admin'),
          allowNull: false,
        },
        personType: {
          type: DataTypes.ENUM('young', 'elder'),
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 't_user',
        timestamps: true,
      },
    );
  }
}
