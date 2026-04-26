const { execSync } = require('child_process');
const path = require('path');

const isWindows = process.platform === 'win32';

async function runCommand(command, description) {
  try {
    console.log(`\n📦 ${description}...`);
    execSync(command, { 
      stdio: 'inherit',
      shell: isWindows ? 'powershell' : true
    });
    console.log(`✅ ${description} completado\n`);
  } catch (error) {
    console.error(`❌ Error en ${description}:`, error.message);
    process.exit(1);
  }
}

async function setupDatabase() {
  console.log('🚀 Iniciando setup del backend con base de datos...\n');
  
  try {
    // 1. Generar cliente de Prisma
    await runCommand('npx prisma generate', 'Generando cliente de Prisma');
    
    // 2. Sincronizar schema con la base de datos (crea tablas si no existen)
    await runCommand('npx prisma db push --skip-generate', 'Sincronizando base de datos con schema');
    
    // 3. Ejecutar seed
    await runCommand('npx tsx prisma/seed.ts', 'Ejecutando seed de base de datos');
    
    console.log('✨ Setup completado. Iniciando servidor...\n');
    
    // 4. Iniciar servidor en modo watch
    execSync('tsx watch src/index.ts', { stdio: 'inherit' });
  } catch (error) {
    console.error('Error fatal:', error);
    process.exit(1);
  }
}

setupDatabase();
