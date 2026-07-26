// Module d'authentification transverse (non métier).
// Expose JwtService, JwtAuthGarde, RolesGarde et JwtStrategie à toute l'app.
// Garde : un module métier ne doit PAS dépendre d'un autre module métier,
// mais il peut dépendre de cette couche-ci (infrastructure commune).
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from './jwt.service';
import { JwtStrategie } from './jwt-strategie.service';
import { JwtAuthGarde } from './jwt-auth.garde';
import { RolesGarde } from './roles.garde';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' },
    }),
  ],
  providers: [JwtService, JwtStrategie, JwtAuthGarde, RolesGarde],
  exports: [JwtService, JwtAuthGarde, RolesGarde, JwtModule],
})
export class AuthModule {}
