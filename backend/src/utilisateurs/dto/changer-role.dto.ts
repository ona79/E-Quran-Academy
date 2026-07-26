// Nouveau rôle à appliquer à un utilisateur (par un administrateur).
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class ChangerRoleDto {
  @ApiProperty({ enum: Role, enumName: 'Role', example: Role.PROFESSEUR })
  @IsEnum(Role)
  nouveauRole!: Role;
}
