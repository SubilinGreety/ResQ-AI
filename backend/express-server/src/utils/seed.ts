import { prisma, connectDB } from '../config/db';
import { CHENNAI_DEMO_SCENARIO } from './demoData';

async function main() {
  console.log('🌱 Starting database seeding with simulated Chennai disaster scenario...');
  await connectDB();

  // Check if scenario exists
  const existing = await prisma.scenario.findFirst({
    where: { name: CHENNAI_DEMO_SCENARIO.name },
  });

  if (existing) {
    console.log(`⚠️ Demo scenario already exists: "${existing.name}". Skipping seed.`);
    await prisma.$disconnect();
    return;
  }

  const scenario = await prisma.scenario.create({
    data: {
      name: CHENNAI_DEMO_SCENARIO.name,
      disasterType: CHENNAI_DEMO_SCENARIO.disasterType,
      city: CHENNAI_DEMO_SCENARIO.city,
      description: CHENNAI_DEMO_SCENARIO.description,
      severity: CHENNAI_DEMO_SCENARIO.severity,
      zones: {
        create: CHENNAI_DEMO_SCENARIO.zones,
      },
      resources: {
        create: CHENNAI_DEMO_SCENARIO.resources,
      },
    },
    include: {
      zones: true,
      resources: true,
    },
  });

  console.log(`✅ Seeded Chennai Demo Scenario: "${scenario.name}" (ID: ${scenario.id}) with ${scenario.zones.length} zones.`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('❌ Seeding failed:', e);
  await prisma.$disconnect();
  process.exit(1);
});
