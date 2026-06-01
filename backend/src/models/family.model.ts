import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import type { Sequelize } from 'sequelize';

export default class Family extends Model<
  InferAttributes<Family>,
  InferCreationAttributes<Family>
> {
  declare id: CreationOptional<string>;
  declare name: string;

  static initModel(sequelize: Sequelize) {
    Family.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 't_family',
        timestamps: true,
      },
    );
  }
}
