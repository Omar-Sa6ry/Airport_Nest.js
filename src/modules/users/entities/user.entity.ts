import { Passenger } from './passenger.model'
import { Employee } from '../../employee/entity/employee.model'
import { Role } from 'src/common/constant/enum.constant'
import { ObjectType, Field } from '@nestjs/graphql'
import { Exclude } from 'class-transformer'
import { BaseEntity } from 'src/common/bases/BaseEntity'
import {
  Column,
  Table,
  Index,
  BeforeCreate,
  BeforeUpdate,
  DataType,
  HasOne,
} from 'sequelize-typescript'

@ObjectType()
@Table({ tableName: 'user', timestamps: true })
export class User extends BaseEntity<User> {
  @Field(() => String)
  @Column({ type: DataType.STRING, allowNull: false })
  firstName: string

  @Field(() => String)
  @Column({ type: DataType.STRING, allowNull: false })
  lastName: string

  @Field(() => String, { nullable: true })
  @Column({ type: DataType.STRING, allowNull: true })
  fullName: string

  @Field(() => String, { nullable: true })
  @Column({ type: DataType.STRING, allowNull: true })
  @Index
  avatar?: string

  @Field(() => String)
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  @Index
  phone: string

  @Field(() => String)
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  @Index
  email: string

  @Exclude()
  @Column({ type: DataType.STRING, allowNull: false })
  password: string

  @Field(() => Role)
  @Column({
    type: DataType.ENUM(...Object.values(Role)),
    defaultValue: Role.PASSENGER,
  })
  role: Role

  @Exclude()
  @Column({ type: DataType.STRING, allowNull: true })
  resetToken?: string

  @Exclude()
  @Column({ type: DataType.DATE, allowNull: true })
  resetTokenExpiry?: Date

  @Exclude()
  @Column({ type: DataType.STRING, allowNull: true })
  fcmToken?: string

  @HasOne(() => Passenger, { foreignKey: 'userId', onDelete: 'SET NULL' })
  passenger: Passenger

  @HasOne(() => Employee, { foreignKey: 'userId', onDelete: 'SET NULL' })
  employee: Employee

  @BeforeCreate
  @BeforeUpdate
  static fullNameValue (instance: User) {
    if (instance.firstName && instance.lastName) {
      instance.fullName = `${instance.firstName} ${instance.lastName}`
    }
  }
}
