import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGarde } from '../auth/jwt-auth.garde';
import { Request } from 'express';

@ApiTags('fichiers')
@Controller('fichiers')
@ApiBearerAuth()
@UseGuards(JwtAuthGarde)
export class FichiersControleur {
  @Post('upload')
  @ApiOperation({ summary: 'Envoyer une photo de profil' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(new BadRequestException('Seules les images (JPG, PNG, WEBP) sont autorisées.'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadFichier(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni ou fichier invalide.');
    }
    
    // Retourne l'URL relative à utiliser côté frontend.
    // L'application frontend ajoutera son URL de base si nécessaire.
    // L'URL retournée correspond au routeur ServeStaticModule
    return {
      url: `/uploads/profils/${file.filename}`,
    };
  }
}
