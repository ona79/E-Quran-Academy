// Service de gestion des profils professeurs.
// Étend le module utilisateurs : le profil prof est une extension de l'identité.
// Accède à la table `teacher_profiles` uniquement.
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Qiraat, TeacherProfile, Role } from '@prisma/client';
import { PrismaService } from '../partages/prisma/prisma.service';
import { MettreAJourProfilProfesseurDto } from './dto/profil-professeur.dto';

@Injectable()
export class ProfesseursService {
  constructor(private readonly prisma: PrismaService) {}

  /** Récupère le profil professeur d'un utilisateur (le crée s'il n'existe pas). */
  async obtenirOuCreer(userId: string): Promise<TeacherProfile> {
    const existant = await this.prisma.teacherProfile.findUnique({ where: { userId } });
    if (existant) return existant;
    return this.prisma.teacherProfile.create({ data: { userId } });
  }

  /** Met à jour le profil professeur. */
  async mettreAJour(
    userId: string,
    dto: MettreAJourProfilProfesseurDto,
  ): Promise<TeacherProfile> {
    // S'assure que le profil existe (upsert gère la création + màj).
    return this.prisma.teacherProfile.upsert({
      where: { userId },
      create: {
        userId,
        bio: dto.bio,
        photoUrl: dto.photoUrl,
        ijazaUrl: dto.ijazaUrl,
        audioUrl: dto.audioUrl,
        tarifHoraire: dto.tarifHoraire ?? 0,
        qiraatParDefaut: dto.qiraatParDefaut ?? Qiraat.HAFS,
        reservationInstantanee: dto.reservationInstantanee ?? false,
      },
      update: {
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.photoUrl !== undefined && { photoUrl: dto.photoUrl }),
        ...(dto.ijazaUrl !== undefined && { ijazaUrl: dto.ijazaUrl }),
        ...(dto.audioUrl !== undefined && { audioUrl: dto.audioUrl }),
        ...(dto.tarifHoraire !== undefined && { tarifHoraire: dto.tarifHoraire }),
        ...(dto.qiraatParDefaut !== undefined && { qiraatParDefaut: dto.qiraatParDefaut }),
        ...(dto.reservationInstantanee !== undefined && {
          reservationInstantanee: dto.reservationInstantanee,
        }),
      },
    });
  }

  /** Profil public d'un professeur (lecture seule, pour les élèves). */
  async profilPublic(userId: string): Promise<any> {
    const profil = await this.prisma.teacherProfile.findUnique({
      where: { userId },
      include: { user: true },
    });
    if (!profil) {
      throw new NotFoundException('Profil professeur introuvable');
    }
    return {
      id: profil.id,
      userId: profil.userId,
      bio: profil.bio,
      photoUrl: profil.photoUrl,
      ijazaUrl: profil.ijazaUrl,
      audioUrl: profil.audioUrl,
      tarifHoraire: profil.tarifHoraire,
      qiraatParDefaut: profil.qiraatParDefaut,
      reservationInstantanee: profil.reservationInstantanee,
      valide: profil.valide,
      nomComplet: profil.user.nomComplet,
      langue: profil.user.langue,
      genre: profil.user.genre,
    };
  }

  /** Liste publique des professeurs validés avec filtres. */
  async listerPublic(filtres: {
    qiraat?: string;
    tarifMax?: number;
    langue?: string;
    genre?: string;
  }): Promise<any[]> {
    const qiraatEnum = filtres.qiraat as Qiraat | undefined;
    const where: Prisma.TeacherProfileWhereInput = {
      valide: true,
      ...(qiraatEnum && { qiraatParDefaut: qiraatEnum }),
      ...(filtres.tarifMax !== undefined && { tarifHoraire: { lte: filtres.tarifMax } }),
      user: {
        role: Role.PROFESSEUR,
        ...(filtres.langue && { langue: filtres.langue }),
        ...(filtres.genre && { genre: filtres.genre }),
      },
    };

    const profils = await this.prisma.teacherProfile.findMany({
      where,
      include: {
        user: {
          select: {
            nomComplet: true,
            langue: true,
            genre: true,
          },
        },
      },
      orderBy: {
        creeLe: 'desc',
      },
    });

    return profils.map((p) => ({
      id: p.id,
      userId: p.userId,
      bio: p.bio,
      photoUrl: p.photoUrl,
      ijazaUrl: p.ijazaUrl,
      audioUrl: p.audioUrl,
      tarifHoraire: p.tarifHoraire,
      qiraatParDefaut: p.qiraatParDefaut,
      reservationInstantanee: p.reservationInstantanee,
      valide: p.valide,
      nomComplet: p.user.nomComplet,
      langue: p.user.langue,
      genre: p.user.genre,
    }));
  }

  /** Active/désactive la validation d'un profil (administrateur). */
  async basculerValidation(userId: string, valide: boolean): Promise<TeacherProfile> {
    return this.prisma.teacherProfile.upsert({
      where: { userId },
      create: { userId, valide },
      update: { valide },
    });
  }

  /** Indique si un professeur autorise la réservation instantanée. */
  async aReservationInstantanee(userId: string): Promise<boolean> {
    const profil = await this.prisma.teacherProfile.findUnique({ where: { userId } });
    return profil?.reservationInstantanee ?? false;
  }
}
