import { ObjectType, Field } from '@nestjs/graphql'
import { User } from './user.entity'
import { Role } from 'src/common/constant/enum.constant'
import { BaseEntity } from 'src/common/bases/BaseEntity'
import {
  Column,
  Table,
  Index,
  BelongsTo,
  ForeignKey,
  DataType,
} from 'sequelize-typescript'

@ObjectType()
@Table({ tableName: 'employee', timestamps: true })
export class Employee extends BaseEntity<Employee> {
  @Field(() => Role)
  @Column({ type: DataType.ENUM(...Object.values(Role)) })
  role: Role

  @Field(() => String)
  @ForeignKey(() => User)
  @Column({ type: DataType.STRING(26), allowNull: false, onDelete: 'CASCADE' })
  @Index
  userId: string
  
  @BelongsTo(() => User)
  user: User

  // @Field()
  // @ForeignKey(() => Airport)
  // @Column
  // airportId: number

  // @BelongsTo(() => Airport)
  // airport: Airport
}
