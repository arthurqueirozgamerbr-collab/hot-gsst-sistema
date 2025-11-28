// prisma/seed.ts
import { prisma } from '../lib/database'
import { HashService } from '../lib/hashService'

async function main() {
  console.log('🌱 Iniciando seed do banco...')

  // Criar usuário admin padrão
  const adminPassword = await HashService.hashPassword('admin123')
  
  await prisma.usuario.upsert({
    where: { email: 'admin@sistema.com' },
    update: {},
    create: {
      email: 'admin@sistema.com',
      nome: 'Administrador',
      senha_hash: adminPassword,
      nivel: 'admin'
    }
  })

  console.log('✅ Seed concluído!')
  console.log('👤 Usuário admin criado:')
  console.log('   Email: admin@sistema.com')
  console.log('   Senha: admin123')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })