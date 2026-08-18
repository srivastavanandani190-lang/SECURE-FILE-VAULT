const { sequelize, User } = require('./src/models');
const { hashString } = require('./src/services/cryptoService');

async function seed() {
  try {
    console.log('Synchronizing database...');
    await sequelize.sync({ force: false });

    console.log('Seeding test users...');
    
    // Hash password 
    const password_hash = await hashString('Password@123');

    // Create Test Student
    const [student, createdStudent] = await User.findOrCreate({
      where: { email: 'student@test.com' },
      defaults: {
        password_hash,
        role: 'Student'
      }
    });

    if (createdStudent) {
      console.log(`✅ Created test Student: ${student.email}`);
    } else {
      console.log(`ℹ️ Student ${student.email} already exists.`);
    }

    // Create Test Professor
    const [professor, createdProfessor] = await User.findOrCreate({
      where: { email: 'professor@test.com' },
      defaults: {
        password_hash,
        role: 'Professor'
      }
    });

    if (createdProfessor) {
      console.log(`✅ Created test Professor: ${professor.email} (ID: ${professor.id})`);
    } else {
      console.log(`ℹ️ Professor ${professor.email} already exists.`);
    }

    console.log('\n--- Test Accounts ---');
    console.log('Student Email:', 'student@test.com');
    console.log('Professor Email:', 'professor@test.com');
    console.log('Password for both:', 'Password@123');
    console.log('---------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
