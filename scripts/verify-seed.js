const { PrismaClient } = require('@prisma/client');

async function verify() {
  const prisma = new PrismaClient();

  try {
    console.log('\n📊 Database Verification\n');
    console.log('='.repeat(50));

    // Count regions
    const regions = await prisma.region.findMany({
      orderBy: { name: 'asc' },
    });
    console.log(`\n📍 Regions (${regions.length}):`);
    regions.forEach((r) => console.log(`   • ${r.name} - ${r.description}`));

    // Count users by role
    const superAdmins = await prisma.user.findMany({
      where: { role: 'SUPERADMIN' },
      select: { email: true, name: true, status: true },
    });
    console.log(`\n👑 Superadmins (${superAdmins.length}):`);
    superAdmins.forEach((u) => console.log(`   • ${u.email} - ${u.name} [${u.status}]`));

    const supervisors = await prisma.user.findMany({
      where: { role: 'SUPERVISOR' },
      include: { supervisorRegion: true },
      orderBy: { email: 'asc' },
    });
    console.log(`\n👨‍💼 Supervisors (${supervisors.length}):`);
    supervisors.forEach((u) => {
      const region = u.supervisorRegion?.name || 'No region';
      console.log(`   • ${u.email} - ${u.name} [${region}] [${u.status}]`);
    });

    const users = await prisma.user.count({
      where: { role: 'USER' },
    });
    console.log(`\n👤 Regular Users: ${users}`);

    console.log('\n' + '='.repeat(50));
    console.log('✅ Verification complete!\n');
  } catch (error) {
    console.error('❌ Verification error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
