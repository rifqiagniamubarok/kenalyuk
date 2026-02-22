const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

  try {
    console.log('🔍 Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));

    await prisma.$connect();
    console.log('✅ Database connection successful!');

    // Try a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ Database query successful! Found ${userCount} users.`);
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);

    if (error.message.includes('denied access')) {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check if PostgreSQL is running: pg_isready');
      console.log('2. Verify database exists: createdb kenalyuk2');
      console.log('3. Check user permissions');
      console.log('4. Verify .env DATABASE_URL is correct');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
