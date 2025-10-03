import { PrismaClient, UserRole, Specialty, ConsultationStatus, ConsultationPriority } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@unio.com' },
    update: {},
    create: {
      cpf: '12345678901',
      email: 'admin@unio.com',
      password: adminPassword,
      name: 'Administrador UNIO',
      role: UserRole.admin,
      phone: '(11) 99999-9999',
      isActive: true,
      isOnline: true,
    },
  });

  // Create sample dentist
  const dentistPassword = await bcrypt.hash('dentist123', 10);
  const dentist = await prisma.user.upsert({
    where: { email: 'dentist@unio.com' },
    update: {},
    create: {
      cpf: '12345678902',
      email: 'dentist@unio.com',
      password: dentistPassword,
      name: 'Dr. João Silva',
      role: UserRole.dentista,
      phone: '(11) 99999-9998',
      cro: 'CRO-SP 12345',
      specialties: [Specialty.dentista],
      isActive: true,
      isOnline: true,
    },
  });

  // Create sample psychologist
  const psychologistPassword = await bcrypt.hash('psychologist123', 10);
  const psychologist = await prisma.user.upsert({
    where: { email: 'psychologist@unio.com' },
    update: {},
    create: {
      cpf: '12345678903',
      email: 'psychologist@unio.com',
      password: psychologistPassword,
      name: 'Dra. Maria Santos',
      role: UserRole.psicologo,
      phone: '(11) 99999-9997',
      specialties: [Specialty.psicologo],
      isActive: true,
      isOnline: true,
    },
  });

  // Create sample medical doctor
  const medicalPassword = await bcrypt.hash('medical123', 10);
  const medicalDoctor = await prisma.user.upsert({
    where: { email: 'medical@unio.com' },
    update: {},
    create: {
      cpf: '12345678904',
      email: 'medical@unio.com',
      password: medicalPassword,
      name: 'Dr. Carlos Oliveira',
      role: UserRole.medico,
      phone: '(11) 99999-9996',
      specialties: [Specialty.medico_clinico],
      isActive: true,
      isOnline: true,
    },
  });

  // Create sample patients
  const patient1Password = await bcrypt.hash('patient123', 10);
  const patient1 = await prisma.user.upsert({
    where: { email: 'patient1@unio.com' },
    update: {},
    create: {
      cpf: '12345678905',
      email: 'patient1@unio.com',
      password: patient1Password,
      name: 'Ana Costa',
      role: UserRole.paciente,
      phone: '(11) 99999-9995',
      birthDate: new Date('1990-05-15'),
      isActive: true,
    },
  });

  const patient2Password = await bcrypt.hash('patient123', 10);
  const patient2 = await prisma.user.upsert({
    where: { email: 'patient2@unio.com' },
    update: {},
    create: {
      cpf: '12345678906',
      email: 'patient2@unio.com',
      password: patient2Password,
      name: 'Pedro Mendes',
      role: UserRole.paciente,
      phone: '(11) 99999-9994',
      birthDate: new Date('1985-08-22'),
      isActive: true,
    },
  });

  const patient3Password = await bcrypt.hash('patient123', 10);
  const patient3 = await prisma.user.upsert({
    where: { email: 'patient3@unio.com' },
    update: {},
    create: {
      cpf: '12345678907',
      email: 'patient3@unio.com',
      password: patient3Password,
      name: 'Julia Ferreira',
      role: UserRole.paciente,
      phone: '(11) 99999-9993',
      birthDate: new Date('1992-03-10'),
      isActive: true,
    },
  });

  // Create sample consultations
  const consultation1 = await prisma.consultation.create({
    data: {
      patientId: patient1.id,
      specialty: Specialty.dentista,
      description: 'Dor no dente molar direito, sensibilidade ao frio',
      status: ConsultationStatus.em_fila,
      priority: ConsultationPriority.alta,
      position: 1,
      estimatedWaitTime: 5,
      attachments: [],
    },
  });

  const consultation2 = await prisma.consultation.create({
    data: {
      patientId: patient2.id,
      specialty: Specialty.psicologo,
      description: 'Crise de ansiedade, precisa de atendimento urgente',
      status: ConsultationStatus.em_fila,
      priority: ConsultationPriority.urgente,
      position: 1,
      estimatedWaitTime: 0,
      attachments: [],
    },
  });

  // Create system configurations
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
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
  }

  // Create queue statistics for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const queueStats = [
    {
      specialty: Specialty.dentista,
      date: today,
      totalInQueue: 1,
      totalInProgress: 0,
      totalFinished: 0,
      averageWaitTime: 5,
      averageDuration: 0,
    },
    {
      specialty: Specialty.psicologo,
      date: today,
      totalInQueue: 1,
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
  console.log(`- Admin: ${admin.email} (password: admin123)`);
  console.log(`- Dentist: ${dentist.email} (password: dentist123)`);
  console.log(`- Psychologist: ${psychologist.email} (password: psychologist123)`);
  console.log(`- Medical Doctor: ${medicalDoctor.email} (password: medical123)`);
  console.log(`- Patient 1: ${patient1.email} (password: patient123)`);
  console.log(`- Patient 2: ${patient2.email} (password: patient123)`);
  console.log(`- Patient 3: ${patient3.email} (password: patient123)`);
  console.log('\n📋 Created consultations:');
  console.log(`- Consultation 1: ${consultation1.id} (Dentist - High Priority)`);
  console.log(`- Consultation 2: ${consultation2.id} (Psychologist - Urgent)`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

