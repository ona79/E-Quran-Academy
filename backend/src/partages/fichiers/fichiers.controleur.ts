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

@ApiTags('fichiers')
@Controller('fichiers')
@ApiBearerAuth()
@UseGuards(JwtAuthGarde)
export class FichiersControleur {
  @Post('upload')
  @ApiOperation({ summary: 'Envoyer une photo de profil, un document ou un fichier audio' })
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
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 Mo max
      },
      fileFilter: (req, file, cb) => {
        const typesAutorises = /jpeg|jpg|png|webp|pdf|mpeg|mp3|wav|mp4|m4a/;
        const mimeValide = typesAutorises.test(file.mimetype);
        if (!mimeValide) {
          return cb(
            new BadRequestException(
              'Format de fichier non autorisé. Formats acceptés : Images (JPG, PNG, WEBP), Documents (PDF), Audios (MP3, WAV, M4A).',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadFichier(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni ou fichier invalide.');
    }

    return {
      url: `/uploads/profils/${file.filename}`,
    };
  }
}
