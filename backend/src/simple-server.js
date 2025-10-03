const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota de autenticação simulada
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simulação de login
  const users = {
    'admin@unio.com': { id: '1', role: 'admin', name: 'Admin' },
    'psychologist@unio.com': { id: '2', role: 'psicologo', name: 'Psicóloga' },
    'dentist@unio.com': { id: '3', role: 'dentista', name: 'Dentista' },
    'medical@unio.com': { id: '4', role: 'medico', name: 'Médico' },
    'patient1@unio.com': { id: '5', role: 'paciente', name: 'Ana Costa' },
    'patient2@unio.com': { id: '6', role: 'paciente', name: 'Pedro Mendes' },
    'patient3@unio.com': { id: '7', role: 'paciente', name: 'Julia Ferreira' },
  };
  
  const user = users[email];
  
  if (user && password === '123') {
    res.json({
      access_token: 'fake-jwt-token',
      user: {
        id: user.id,
        email: email,
        name: user.name,
        role: user.role,
      }
    });
  } else {
    res.status(401).json({ message: 'Credenciais inválidas' });
  }
});

// Rota de especialidades
app.get('/api/specialties', (req, res) => {
  res.json([
    {
      id: 'psicologo',
      name: 'Psicólogo',
      description: 'Atendimento psicológico urgente e agendado',
      waitTime: 15,
      availableProfessionals: 2,
      queueLength: 3
    },
    {
      id: 'dentista',
      name: 'Dentista',
      description: 'Consultas odontológicas e emergências',
      waitTime: 30,
      availableProfessionals: 1,
      queueLength: 1
    },
    {
      id: 'medico-clinico',
      name: 'Médico Clínico',
      description: 'Consultas médicas e emergências',
      waitTime: 45,
      availableProfessionals: 1,
      queueLength: 2
    }
  ]);
});

// Rota de consultas
app.get('/api/consultations', (req, res) => {
  res.json([
    {
      id: '1',
      patientId: '5',
      specialty: 'psicologo',
      status: 'em_fila',
      priority: 'alta',
      description: 'Crise de ansiedade',
      createdAt: new Date().toISOString(),
      position: 1,
      estimatedWaitTime: 15
    }
  ]);
});

app.listen(PORT, () => {
  console.log('🚀 Backend Express rodando em http://localhost:3000');
  console.log('📋 Usuários de teste:');
  console.log('👤 Admin: admin@unio.com / 123');
  console.log('👤 Psicóloga: psychologist@unio.com / 123');
  console.log('👤 Dentista: dentist@unio.com / 123');
  console.log('👤 Médico: medical@unio.com / 123');
  console.log('👤 Paciente 1: patient1@unio.com / 123');
  console.log('👤 Paciente 2: patient2@unio.com / 123');
  console.log('👤 Paciente 3: patient3@unio.com / 123');
  console.log('');
  console.log('✅ Frontend: http://localhost:5173');
  console.log('✅ Backend: http://localhost:3000');
});
