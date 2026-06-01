import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import type { Sequelize } from 'sequelize';

export default class Event extends Model<InferAttributes<Event>, InferCreationAttributes<Event>> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare description: string;
  declare type: string;
  declare startDatetime: Date;
  declare endDatetime: Date;
  declare agendaId: string;

  static initModel(sequelize: Sequelize) {
    Event.init(
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
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        type: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        startDatetime: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        endDatetime: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        agendaId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 't_event',
        timestamps: true,
      },
    );
  }
}
