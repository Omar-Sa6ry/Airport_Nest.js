import { registerEnumType } from '@nestjs/graphql'

export enum Role {
  PILOT = 'pilot',
  ADMIN = 'admin',
  CREW = 'crew',
  MANAGER = 'manager',
  PASSENGER = 'passenger',
}

registerEnumType(Role, {
  name: 'Role',
  description: 'User roles in the system',
})
