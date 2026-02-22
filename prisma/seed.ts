import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🗑️  Cleaning existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.region.deleteMany();
  console.log('✅ Existing data cleaned\n');

  // Create Regions
  console.log('📍 Creating regions...');
  const jakarta = await prisma.region.create({
    data: {
      name: 'Jakarta',
      description: 'DKI Jakarta - Capital city of Indonesia',
    },
  });
  console.log(`   ✓ Created region: ${jakarta.name}`);

  const medan = await prisma.region.create({
    data: {
      name: 'Medan',
      description: 'North Sumatra - Third largest city in Indonesia',
    },
  });
  console.log(`   ✓ Created region: ${medan.name}`);

  const yogyakarta = await prisma.region.create({
    data: {
      name: 'Yogyakarta',
      description: 'Daerah Istimewa Yogyakarta - Cultural heart of Java',
    },
  });
  console.log(`   ✓ Created region: ${yogyakarta.name}\n`);

  // Create SuperAdmin
  console.log('👑 Creating superadmin...');
  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
  const superadmin = await prisma.user.create({
    data: {
      email: 'superadmin@kenalyuk.com',
      password: hashedPasswordAdmin,
      role: UserRole.SUPERADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      name: 'Super Administrator',
    },
  });
  console.log(`   ✓ Created: ${superadmin.email} (${superadmin.role})`);
  console.log(`   📧 Email: superadmin@kenalyuk.com`);
  console.log(`   🔑 Password: admin123\n`);

  // Create Supervisors
  console.log('👨‍💼 Creating supervisors...');
  const hashedPasswordSupervisor = await bcrypt.hash('supervisor123', 10);

  const supervisor1 = await prisma.user.create({
    data: {
      email: 'supervisor.jakarta@kenalyuk.com',
      password: hashedPasswordSupervisor,
      role: UserRole.SUPERVISOR,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      name: 'Supervisor Jakarta',
      supervisorRegionId: jakarta.id,
    },
  });
  console.log(`   ✓ Created: ${supervisor1.email} (Region: ${jakarta.name})`);

  const supervisor2 = await prisma.user.create({
    data: {
      email: 'supervisor.medan@kenalyuk.com',
      password: hashedPasswordSupervisor,
      role: UserRole.SUPERVISOR,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      name: 'Supervisor Medan',
      supervisorRegionId: medan.id,
    },
  });
  console.log(`   ✓ Created: ${supervisor2.email} (Region: ${medan.name})`);

  const supervisor3 = await prisma.user.create({
    data: {
      email: 'supervisor.yogyakarta@kenalyuk.com',
      password: hashedPasswordSupervisor,
      role: UserRole.SUPERVISOR,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      name: 'Supervisor Yogyakarta',
      supervisorRegionId: yogyakarta.id,
    },
  });
  console.log(`   ✓ Created: ${supervisor3.email} (Region: ${yogyakarta.name})`);
  console.log(`   📧 All supervisors use password: supervisor123\n`);

  console.log('✅ Seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log('   • 3 Regions created');
  console.log('   • 1 Superadmin created');
  console.log('   • 3 Supervisors created\n');
  console.log('🔐 Login Credentials:');
  console.log('   Superadmin:');
  console.log('     Email: superadmin@kenalyuk.com');
  console.log('     Password: admin123\n');
  console.log('   Supervisors (all use same password):');
  console.log('     Email: supervisor.jakarta@kenalyuk.com');
  console.log('     Email: supervisor.medan@kenalyuk.com');
  console.log('     Email: supervisor.yogyakarta@kenalyuk.com');
  console.log('     Password: supervisor123\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
