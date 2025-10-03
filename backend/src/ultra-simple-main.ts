import { NestFactory } from '@nestjs/core';
import { UltraSimpleAppModule } from './ultra-simple-app.module';

async function bootstrap() {
  const app = await NestFactory.create(UltraSimpleAppModule, {
    logger: ['error', 'warn', 'log'],
  });
  
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  try {
    await app.listen(3000);
    console.log('🚀 Backend rodando em http://localhost:3000');
    console.log('📋 Usuários de teste criados:');
    console.log('👤 Admin: admin@unio.com / admin123');
    console.log('👤 Psicóloga: psychologist@unio.com / psychologist123');
    console.log('👤 Dentista: dentist@unio.com / dentist123');
    console.log('👤 Médico: medical@unio.com / medical123');
    console.log('👤 Paciente 1: patient1@unio.com / patient123');
    console.log('👤 Paciente 2: patient2@unio.com / patient123');
    console.log('👤 Paciente 3: patient3@unio.com / patient123');
  } catch (error) {
    console.error('❌ Erro ao iniciar o backend:', error.message);
  }
}

bootstrap();