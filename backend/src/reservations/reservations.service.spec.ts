import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { PrismaService } from '../partages/prisma/prisma.service';
import { PaiementService } from '../paiement/paiement.service';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { StatutReservation, JourSemaine } from '@prisma/client';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: PrismaService,
          useValue: {
            user: { findUnique: jest.fn() },
            disponibilite: { findFirst: jest.fn() },
            reservation: { findFirst: jest.fn(), create: jest.fn() },
          },
        },
        {
          provide: PaiementService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('devrait rejeter une date dans le passé', async () => {
    await expect(
      service.creerReservation('eleve1', {
        professeurId: 'prof1',
        dateLocale: '2000-01-01',
        heureDebut: '10:00',
        heureFin: '11:00',
        fuseauHoraireEleve: 'UTC',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('devrait rejeter si l\'heure de fin est avant le début', async () => {
    await expect(
      service.creerReservation('eleve1', {
        professeurId: 'prof1',
        dateLocale: '2100-01-01',
        heureDebut: '11:00',
        heureFin: '10:00',
        fuseauHoraireEleve: 'UTC',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
