import { Model, DataTypes, InferAttributes, InferCreationAttributes } from 'sequelize';
import type { Sequelize } from 'sequelize';

export default class Appertain extends Model<
  InferAttributes<Appertain>,
  InferCreationAttributes<Appertain>
> {
  declare family_id: string;
  declare family_adminId: string;

  static initModel(sequelize: Sequelize) {
    Appertain.init(
      {
        family_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        family_adminId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 't_appertain',
        timestamps: true,
      },
    );
  }
}
