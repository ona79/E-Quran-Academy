import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FichiersControleur } from './fichiers.controleur';
import * as fs from 'fs';

// Assurer que le dossier existe
const uploadsDir = join(process.cwd(), 'uploads', 'profils');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: uploadsDir,
        filename: (req, file, cb) => {
          const nom = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, nom);
        },
      }),
      limits: {
        fileSize: 3 * 1024 * 1024, // 3 Mo
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  controllers: [FichiersControleur],
})
export class FichiersModule {}
