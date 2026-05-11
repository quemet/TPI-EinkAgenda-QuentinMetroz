import { Model, DataTypes, InferAttributes, InferCreationAttributes } from 'sequelize';
import type { Sequelize } from 'sequelize';

export default class Belong extends Model<
  InferAttributes<Belong>,
  InferCreationAttributes<Belong>
> {
  declare family_id: string;
  declare user_id: string;

  static initModel(sequelize: Sequelize) {
    Belong.init(
      {
        family_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 't_belong',
        timestamps: false,
      },
    );
  }
}
