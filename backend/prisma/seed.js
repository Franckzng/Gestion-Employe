// backend/prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Créer l'administrateur
  const adminPassword = await bcrypt.hash('Admin@123456', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aeris.com' },
    update: {},
    create: {
      email: 'admin@aeris.com',
      password: adminPassword,
      role: 'ADMIN',
      employee: {
        create: {
          firstName: 'Admin',
          lastName: 'System',
          position: 'Administrateur Système',
          department: 'IT',
          hireDate: new Date('2024-01-01'),
          isActive: true,
        }
      }
    },
    include: {
      employee: true
    }
  });

  console.log('✅ Admin créé:', admin.email);

  // Créer un RH
  const hrPassword = await bcrypt.hash('Hr@123456', 10);
  
  const hr = await prisma.user.upsert({
    where: { email: 'hr@aeris.com' },
    update: {},
    create: {
      email: 'hr@aeris.com',
      password: hrPassword,
      role: 'HR',
      employee: {
        create: {
          firstName: 'Sophie',
          lastName: 'Sanou',
          position: 'Responsable RH',
          department: 'Ressources Humaines',
          phone: '+226 70 12 34 56',
          hireDate: new Date('2024-01-15'),
          isActive: true,
        }
      }
    },
    include: {
      employee: true
    }
  });

  console.log('✅ RH créé:', hr.email);

  // Créer des employés de test
  const employees = [
    {
      email: 'jean.Kaboret@aeris.com',
      firstName: 'Jean',
      lastName: 'Kabore',
      position: 'Développeur Full-Stack',
      department: 'IT',
      phone: '+226 70 11 22 33',
    },
    {
      email: 'marie.kouame@aeris.com',
      firstName: 'Marie',
      lastName: 'Kouamé',
      position: 'Designer UI/UX',
      department: 'Design',
      phone: '+226 70 44 55 66',
    },
    {
      email: 'Franckzongo@aeris.com',
      firstName: 'Franck',
      lastName: 'Zongo',
      position: 'Chef de Projet',
      department: 'Management',
      phone: '+226 66 09 57 81',
    },
  ];

  for (const emp of employees) {
    const password = await bcrypt.hash('Employee@123', 10);
    
    const employee = await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        email: emp.email,
        password: password,
        role: 'EMPLOYEE',
        employee: {
          create: {
            firstName: emp.firstName,
            lastName: emp.lastName,
            position: emp.position,
            department: emp.department,
            phone: emp.phone,
            hireDate: new Date('2024-02-01'),
            isActive: true,
          }
        }
      }
    });

    console.log('✅ Employé créé:', employee.email);
  }

  // Créer des présences pour aujourd'hui
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allEmployees = await prisma.employee.findMany({
    where: { isActive: true }
  });

  for (const emp of allEmployees) {
    const checkInTime = new Date(today);
    checkInTime.setHours(8, Math.floor(Math.random() * 30)); // Entre 8h00 et 8h30

    await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: emp.id,
          date: today
        }
      },
      update: {},
      create: {
        employeeId: emp.id,
        date: today,
        checkIn: checkInTime,
        status: 'PRESENT'
      }
    });
  }

  console.log('✅ Présences du jour créées');

  console.log('\n🎉 Seeding terminé avec succès !');
  console.log('\n📋 Comptes créés :');
  console.log('   Admin: admin@aeris.com / Admin@123456');
  console.log('   RH: hr@aeris.com / Hr@123456');
  console.log('   Employés: *.@aeris.com / Employee@123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });