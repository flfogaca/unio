import {
  PrismaClient,
  UserRole,
  Specialty,
  ConsultationStatus,
  ConsultationPriority,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Limpar dados existentes
  await prisma.consultation.deleteMany();
  await prisma.queueStatistics.deleteMany();
  await prisma.systemConfig.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('123456', 10);

  // 1. Criar Admin
  const admin = await prisma.user.create({
    data: {
      cpf: '00000000000',
      email: 'admin@unio.com',
      password,
      name: 'Administrador UNIO',
      role: UserRole.admin,
      phone: '(11) 99999-9999',
      isActive: true,
      isOnline: true,
    },
  });

  // 2. Criar 2 Dentistas
  const dentists = [
    {
      cpf: '11111111111',
      email: 'dentista1@unio.com',
      name: 'Dr. João Silva',
      phone: '(11) 99999-0001',
      cro: 'CRO-SP 12345',
    },
    {
      cpf: '11111111112',
      email: 'dentista2@unio.com',
      name: 'Dra. Maria Santos',
      phone: '(11) 99999-0002',
      cro: 'CRO-SP 12346',
    },
  ];

  for (const dentistData of dentists) {
    await prisma.user.create({
      data: {
        ...dentistData,
        password,
        role: UserRole.dentista,
        specialties: [Specialty.dentista],
        isActive: true,
        isOnline: true,
      },
    });
  }

  // 3. Criar 2 Psicólogos
  const psychologists = [
    {
      cpf: '22222222221',
      email: 'psicologo1@unio.com',
      name: 'Dra. Ana Costa',
      phone: '(11) 99999-0003',
    },
    {
      cpf: '22222222222',
      email: 'psicologo2@unio.com',
      name: 'Dr. Pedro Mendes',
      phone: '(11) 99999-0004',
    },
  ];

  for (const psychologistData of psychologists) {
    await prisma.user.create({
      data: {
        ...psychologistData,
        password,
        role: UserRole.psicologo,
        specialties: [Specialty.psicologo],
        isActive: true,
        isOnline: true,
      },
    });
  }

  // 4. Criar 2 Médicos Clínicos
  const medicalDoctors = [
    {
      cpf: '33333333331',
      email: 'medico1@unio.com',
      name: 'Dr. Carlos Oliveira',
      phone: '(11) 99999-0005',
    },
    {
      cpf: '33333333332',
      email: 'medico2@unio.com',
      name: 'Dra. Julia Ferreira',
      phone: '(11) 99999-0006',
    },
  ];

  for (const doctorData of medicalDoctors) {
    await prisma.user.create({
      data: {
        ...doctorData,
        password,
        role: UserRole.medico,
        specialties: [Specialty.medico_clinico],
        isActive: true,
        isOnline: true,
      },
    });
  }

  // 5. Criar 9 Pacientes
  const patients = [
    {
      cpf: '44444444441',
      email: 'paciente1@unio.com',
      name: 'Ana Beatriz Silva',
      phone: '(11) 99999-0007',
      birthDate: new Date('1990-05-15'),
    },
    {
      cpf: '44444444442',
      email: 'paciente2@unio.com',
      name: 'Bruno Costa',
      phone: '(11) 99999-0008',
      birthDate: new Date('1985-08-22'),
    },
    {
      cpf: '44444444443',
      email: 'paciente3@unio.com',
      name: 'Carla Mendes',
      phone: '(11) 99999-0009',
      birthDate: new Date('1992-03-10'),
    },
    {
      cpf: '44444444444',
      email: 'paciente4@unio.com',
      name: 'Diego Oliveira',
      phone: '(11) 99999-0010',
      birthDate: new Date('1988-12-05'),
    },
    {
      cpf: '44444444445',
      email: 'paciente5@unio.com',
      name: 'Elena Ferreira',
      phone: '(11) 99999-0011',
      birthDate: new Date('1995-07-18'),
    },
    {
      cpf: '44444444446',
      email: 'paciente6@unio.com',
      name: 'Fernando Santos',
      phone: '(11) 99999-0012',
      birthDate: new Date('1987-11-30'),
    },
    {
      cpf: '44444444447',
      email: 'paciente7@unio.com',
      name: 'Gabriela Lima',
      phone: '(11) 99999-0013',
      birthDate: new Date('1993-04-25'),
    },
    {
      cpf: '44444444448',
      email: 'paciente8@unio.com',
      name: 'Henrique Alves',
      phone: '(11) 99999-0014',
      birthDate: new Date('1989-09-12'),
    },
    {
      cpf: '44444444449',
      email: 'paciente9@unio.com',
      name: 'Isabela Rocha',
      phone: '(11) 99999-0015',
      birthDate: new Date('1991-01-08'),
    },
  ];

  for (const patientData of patients) {
    await prisma.user.create({
      data: {
        ...patientData,
        password,
        role: UserRole.paciente,
        isActive: true,
      },
    });
  }

  // 6. Criar configurações do sistema
  const systemConfigs = [
    {
      key: 'max_queue_size',
      value: '50',
      type: 'number',
      category: 'general',
    },
    {
      key: 'default_consultation_duration',
      value: '30',
      type: 'number',
      category: 'general',
    },
    {
      key: 'video_call_room_expiration',
      value: '7200',
      type: 'number',
      category: 'video',
    },
    {
      key: 'enable_notifications',
      value: 'true',
      type: 'boolean',
      category: 'notifications',
    },
    {
      key: 'maintenance_mode',
      value: 'false',
      type: 'boolean',
      category: 'general',
    },
  ];

  for (const config of systemConfigs) {
    await prisma.systemConfig.create({
      data: config,
    });
  }

  // 7. Criar estatísticas de fila para hoje
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const queueStats = [
    {
      specialty: Specialty.dentista,
      date: today,
      totalInQueue: 0,
      totalInProgress: 0,
      totalFinished: 0,
      averageWaitTime: 0,
      averageDuration: 0,
    },
    {
      specialty: Specialty.psicologo,
      date: today,
      totalInQueue: 0,
      totalInProgress: 0,
      totalFinished: 0,
      averageWaitTime: 0,
      averageDuration: 0,
    },
    {
      specialty: Specialty.medico_clinico,
      date: today,
      totalInQueue: 0,
      totalInProgress: 0,
      totalFinished: 0,
      averageWaitTime: 0,
      averageDuration: 0,
    },
  ];

  for (const stat of queueStats) {
    await prisma.queueStatistics.create({
      data: stat,
    });
  }

  console.log('✅ Database seed completed successfully!');
  console.log('\n📋 Created users:');
  console.log(`- Admin: ${admin.email} (password: 123456)`);
  console.log(
    `- 2 Dentistas: dentista1@unio.com, dentista2@unio.com (password: 123456)`
  );
  console.log(
    `- 2 Psicólogos: psicologo1@unio.com, psicologo2@unio.com (password: 123456)`
  );
  console.log(
    `- 2 Médicos Clínicos: medico1@unio.com, medico2@unio.com (password: 123456)`
  );
  console.log(
    `- 9 Pacientes: paciente1@unio.com até paciente9@unio.com (password: 123456)`
  );
  console.log('\n🏥 Specialties available:');
  console.log('- Dentista');
  console.log('- Psicólogo');
  console.log('- Médico Clínico');
}

main()
  .catch(e => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
