import { ObjectType, Field, ID } from '@nestjs/graphql'
import { BaseEntity } from 'src/common/bases/BaseEntity'
import { Currency } from 'src/common/constant/enum.constant'
import { Airport } from 'src/modules/airport/entity/airport.model'
import { User } from 'src/modules/users/entities/user.entity'
import {
  Table,
  Column,
  ForeignKey,
  DataType,
  BelongsTo,
} from 'sequelize-typescript'

@ObjectType()
@Table({ tableName: 'location', timestamps: true })
export class Location extends BaseEntity<Location> {
  @Field(() => String, { nullable: true })
  @ForeignKey(() => User)
  @Column({ type: DataType.STRING(26), allowNull: true })
  userId?: string | null

  @Field(() => String, { nullable: true })
  @ForeignKey(() => Airport)
  @Column({ type: DataType.STRING(26), allowNull: true })
  airportId?: string | null

  //   @Field(() => String, { nullable: true })
  //   @ForeignKey(() => Airline)
  //   @Column({ type: DataType.STRING(26), allowNull: true })
  //   airlineId: string

  @Field()
  @Column({ type: DataType.STRING, allowNull: false })
  city: string

  @Field()
  @Column({ type: DataType.STRING, allowNull: false })
  country: string

  @Field(() => Currency)
  @Column({ type: DataType.ENUM(...Object.values(Currency)) })
  currency: Currency

  @BelongsTo(() => User, { onDelete: 'SET NULL' })
  user: User

  @BelongsTo(() => Airport, { onDelete: 'SET NULL' })
  airport: Airport

  //   @BelongsTo(() => Airline)
  //   airline: Airline
}
