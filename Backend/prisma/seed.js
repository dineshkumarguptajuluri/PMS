const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  console.log('--- Cleaning Database ---');
  await prisma.notification.deleteMany();
  await prisma.checkpoint.deleteMany();
  await prisma.projectInterest.deleteMany();
  await prisma.project.deleteMany();
  await prisma.clientProfile.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create 1 Admin
  const admin = await prisma.user.create({
    data: { email: 'admin@system.com', password, role: 'ADMIN' }
  });

  // 2. Create 3 Managers
  const managers = [];
  for (let i = 1; i <= 3; i++) {
    const m = await prisma.user.create({
      data: { email: `manager${i}@system.com`, password, role: 'MANAGER' }
    });
    managers.push(m);
  }

  // 3. Create 4 Clients
  const clients = [];
  for (let i = 1; i <= 4; i++) {
    const c = await prisma.user.create({
      data: { 
        email: `client${i}@system.com`, password, role: 'CLIENT',
        clientProfile: {
          create: {
            legalName: `Client Corp ${i}`,
            gstNumber: `GST123${i}XYZ`,
            industryType: 'Tech',
            employeeCount: 50 * i,
            onboardingStatus: 'APPROVED'
          }
        }
      },
      include: { clientProfile: true }
    });
    clients.push(c);
  }

  // 4. Create 10 Projects with Checkpoints
  for (let i = 1; i <= 10; i++) {
    const manager = managers[i % 3];
    const project = await prisma.project.create({
      data: {
        title: `Optimization Project ${i}`,
        utilityFocus: "Resource Efficiency",
        optimizationDetails: "Improves output by 10%",
        longDescription: `Full details for project ${i}. This project focuses on streamlining resources.`,
        overallTargetDate: new Date('2026-12-31'),
        managerId: manager.id,
        checkpoints: {
          create: [
            { title: 'Setup', targetDate: new Date('2026-04-01'), status: 'DONE', order: 1 },
            { title: 'Execution', targetDate: new Date('2026-06-01'), status: 'PENDING', order: 2 }
          ]
        }
      }
    });

    // Assign Interest: client1 and client2 are interested in everything
    // We'll approve interest for projects 1-5 to test the "Clean View"
    const clientUser = clients[i % 2];
    await prisma.projectInterest.create({
      data: {
        projectId: project.id,
        clientId: clientUser.clientProfile.id, 
        status: i <= 5 ? 'APPROVED' : 'PENDING'
      }
    });

    // Link client to project if interest is approved
    if (i <= 5) {
      await prisma.project.update({
        where: { id: project.id },
        data: { clientId: clientUser.clientProfile.id }
      });
    }
  }

  console.log('✅ Seed Complete: Admin, 3 Managers, 4 Clients, and 10 Projects injected.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
