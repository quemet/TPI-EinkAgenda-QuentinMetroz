/*
   agenda_id INT,
   agenda_name VARCHAR(50) NOT NULL,
   family_id INT NOT NULL,
   PRIMARY KEY(agenda_id),
   FOREIGN KEY(family_id) REFERENCES t_family(family_id)
*/
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import type { Sequelize } from 'sequelize';

export default class Agenda extends Model<
  InferAttributes<Agenda>,
  InferCreationAttributes<Agenda>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare familyId: string;

  static initModel(sequelize: Sequelize) {
    Agenda.init(
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
        familyId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 't_agenda',
        timestamps: true,
      },
    );
  }
}
