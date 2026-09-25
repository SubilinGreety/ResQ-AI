import { Request, Response } from 'express';
import { prisma } from '../config/db';
import {
  CreateScenarioValidator,
  UpdateScenarioValidator,
  ZoneSchemaValidator,
  ResourceSchemaValidator,
} from '../validators/scenarioValidator';
import { CHENNAI_DEMO_SCENARIO } from '../utils/demoData';

// Helper to compute summary rollups
export function computeScenarioSummary(scenario: any) {
  const zones = scenario.zones || [];
  const resources = scenario.resources || {
    rescueVehicles: 0,
    ambulances: 0,
    doctors: 0,
    medicalTeams: 0,
    shelters: 0,
    foodKits: 0,
    waterSupplies: 0,
    rescuePersonnel: 0,
  };

  const totalPopulation = zones.reduce((sum: number, z: any) => sum + (z.population || 0), 0);
  const totalInjured = zones.reduce((sum: number, z: any) => sum + (z.injured || 0), 0);
  const totalVulnerable = zones.reduce((sum: number, z: any) => sum + (z.vulnerablePopulation || 0), 0);
  const criticalZones = zones.filter((z: any) => z.status === 'Critical').length;
  const evacuationZones = zones.filter((z: any) => z.status === 'Evacuation Required').length;

  return {
    ...scenario,
    summary: {
      zoneCount: zones.length,
      totalPopulation,
      totalInjured,
      totalVulnerable,
      criticalZones,
      evacuationZones,
      totalVehicles: (resources.rescueVehicles || 0) + (resources.ambulances || 0),
      totalPersonnel: (resources.rescuePersonnel || 0) + (resources.doctors || 0),
      totalShelters: resources.shelters || 0,
      totalSupplies: (resources.foodKits || 0) + (resources.waterSupplies || 0),
    },
  };
}

// GET /api/scenarios - List all scenarios
export async function getScenarios(req: Request, res: Response) {
  try {
    const scenarios = await prisma.scenario.findMany({
      include: {
        zones: true,
        resources: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const enriched = scenarios.map(computeScenarioSummary);
    return res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error: any) {
    console.error('Error fetching scenarios:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve scenarios', error: error.message });
  }
}

// GET /api/scenarios/:id - Get single scenario details
export async function getScenarioById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const scenario = await prisma.scenario.findUnique({
      where: { id },
      include: {
        zones: true,
        resources: true,
      },
    });

    if (!scenario) {
      return res.status(404).json({ success: false, message: 'Scenario not found' });
    }

    return res.json({ success: true, data: computeScenarioSummary(scenario) });
  } catch (error: any) {
    console.error('Error fetching scenario by ID:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve scenario', error: error.message });
  }
}

// POST /api/scenarios - Create new scenario
export async function createScenario(req: Request, res: Response) {
  try {
    const parseResult = CreateScenarioValidator.safeParse(req.body);
    if (!parseResult.success) {
      const issues = parseResult.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
      return res.status(400).json({ success: false, message: 'Validation failed', errors: issues });
    }

    const { name, disasterType, city, description, severity, dateTime, zones, resources } = parseResult.data;

    const newScenario = await prisma.scenario.create({
      data: {
        name,
        disasterType,
        city: city || 'Chennai',
        description: description || '',
        severity,
        dateTime: dateTime ? new Date(dateTime) : new Date(),
        zones: {
          create: zones.map((z) => ({
            name: z.name,
            locality: z.locality,
            population: z.population,
            severity: z.severity,
            latitude: z.latitude,
            longitude: z.longitude,
            rainfall: z.rainfall ?? 0,
            waterLevel: z.waterLevel ?? 0,
            roadStatus: z.roadStatus || 'Clear',
            injured: z.injured ?? 0,
            vulnerablePopulation: z.vulnerablePopulation ?? 0,
            status: z.status,
          })),
        },
        resources: resources
          ? {
              create: {
                rescueVehicles: resources.rescueVehicles ?? 0,
                ambulances: resources.ambulances ?? 0,
                doctors: resources.doctors ?? 0,
                medicalTeams: resources.medicalTeams ?? 0,
                shelters: resources.shelters ?? 0,
                foodKits: resources.foodKits ?? 0,
                waterSupplies: resources.waterSupplies ?? 0,
                rescuePersonnel: resources.rescuePersonnel ?? 0,
              },
            }
          : undefined,
      },
      include: {
        zones: true,
        resources: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Disaster scenario initialized successfully',
      data: computeScenarioSummary(newScenario),
    });
  } catch (error: any) {
    console.error('Error creating scenario:', error);
    return res.status(500).json({ success: false, message: 'Failed to create scenario', error: error.message });
  }
}

// PUT /api/scenarios/:id - Update scenario parameters
export async function updateScenario(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const parseResult = UpdateScenarioValidator.safeParse(req.body);
    if (!parseResult.success) {
      const issues = parseResult.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
      return res.status(400).json({ success: false, message: 'Validation failed', errors: issues });
    }

    const exists = await prisma.scenario.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Scenario not found' });
    }

    const updated = await prisma.scenario.update({
      where: { id },
      data: {
        ...parseResult.data,
        dateTime: parseResult.data.dateTime ? new Date(parseResult.data.dateTime) : undefined,
      },
      include: {
        zones: true,
        resources: true,
      },
    });

    return res.json({ success: true, message: 'Scenario updated successfully', data: computeScenarioSummary(updated) });
  } catch (error: any) {
    console.error('Error updating scenario:', error);
    return res.status(500).json({ success: false, message: 'Failed to update scenario', error: error.message });
  }
}

// DELETE /api/scenarios/:id - Delete scenario
export async function deleteScenario(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const exists = await prisma.scenario.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Scenario not found' });
    }

    await prisma.scenario.delete({ where: { id } });
    return res.json({ success: true, message: 'Scenario purged successfully' });
  } catch (error: any) {
    console.error('Error deleting scenario:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete scenario', error: error.message });
  }
}

// POST /api/scenarios/:id/zones - Add zone to scenario
export async function addZone(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const parseResult = ZoneSchemaValidator.safeParse(req.body);
    if (!parseResult.success) {
      const issues = parseResult.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
      return res.status(400).json({ success: false, message: 'Validation failed', errors: issues });
    }

    const scenario = await prisma.scenario.findUnique({ where: { id } });
    if (!scenario) {
      return res.status(404).json({ success: false, message: 'Parent scenario not found' });
    }

    const zone = await prisma.zone.create({
      data: {
        ...parseResult.data,
        scenarioId: id,
      },
    });

    return res.status(201).json({ success: true, message: 'Zone registered successfully', data: zone });
  } catch (error: any) {
    console.error('Error adding zone:', error);
    return res.status(500).json({ success: false, message: 'Failed to register zone', error: error.message });
  }
}

// PUT /api/scenarios/:id/zones/:zoneId - Update specific zone
export async function updateZone(req: Request, res: Response) {
  try {
    const { id, zoneId } = req.params;
    const parseResult = ZoneSchemaValidator.partial().safeParse(req.body);
    if (!parseResult.success) {
      const issues = parseResult.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
      return res.status(400).json({ success: false, message: 'Validation failed', errors: issues });
    }

    const zone = await prisma.zone.findFirst({
      where: { id: zoneId, scenarioId: id },
    });

    if (!zone) {
      return res.status(404).json({ success: false, message: 'Zone not found in specified scenario' });
    }

    const updated = await prisma.zone.update({
      where: { id: zoneId },
      data: parseResult.data,
    });

    return res.json({ success: true, message: 'Zone parameters updated', data: updated });
  } catch (error: any) {
    console.error('Error updating zone:', error);
    return res.status(500).json({ success: false, message: 'Failed to update zone', error: error.message });
  }
}

// DELETE /api/scenarios/:id/zones/:zoneId - Delete specific zone
export async function deleteZone(req: Request, res: Response) {
  try {
    const { id, zoneId } = req.params;
    const zone = await prisma.zone.findFirst({
      where: { id: zoneId, scenarioId: id },
    });

    if (!zone) {
      return res.status(404).json({ success: false, message: 'Zone not found in specified scenario' });
    }

    // Check minimum 1 zone constraint if user requires it
    const zoneCount = await prisma.zone.count({ where: { scenarioId: id } });
    if (zoneCount <= 1) {
      return res.status(400).json({
        success: false,
        message: 'A scenario must contain at least one affected zone. Cannot delete the only remaining zone.',
      });
    }

    await prisma.zone.delete({ where: { id: zoneId } });
    return res.json({ success: true, message: 'Zone removed successfully' });
  } catch (error: any) {
    console.error('Error deleting zone:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete zone', error: error.message });
  }
}

// POST/PUT /api/scenarios/:id/resources - Set or Update resources
export async function updateResources(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const parseResult = ResourceSchemaValidator.safeParse(req.body);
    if (!parseResult.success) {
      const issues = parseResult.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
      return res.status(400).json({ success: false, message: 'Validation failed', errors: issues });
    }

    const scenario = await prisma.scenario.findUnique({ where: { id } });
    if (!scenario) {
      return res.status(404).json({ success: false, message: 'Scenario not found' });
    }

    const resources = await prisma.resource.upsert({
      where: { scenarioId: id },
      update: parseResult.data,
      create: {
        ...parseResult.data,
        scenarioId: id,
      },
    });

    return res.json({ success: true, message: 'Resource inventory updated successfully', data: resources });
  } catch (error: any) {
    console.error('Error updating resources:', error);
    return res.status(500).json({ success: false, message: 'Failed to update resources', error: error.message });
  }
}

// POST /api/scenarios/seed-demo - Seed or reset demo scenario
export async function seedDemoScenario(req: Request, res: Response) {
  try {
    const existing = await prisma.scenario.findFirst({
      where: { name: CHENNAI_DEMO_SCENARIO.name },
      include: { zones: true, resources: true },
    });

    if (existing && !req.query.force) {
      return res.json({
        success: true,
        message: 'Demo scenario already exists in database',
        data: computeScenarioSummary(existing),
      });
    }

    if (existing && req.query.force) {
      await prisma.scenario.delete({ where: { id: existing.id } });
    }

    const demo = await prisma.scenario.create({
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

    return res.status(201).json({
      success: true,
      message: 'Simulated Chennai EOC Demo Scenario generated successfully',
      data: computeScenarioSummary(demo),
    });
  } catch (error: any) {
    console.error('Error seeding demo scenario:', error);
    return res.status(500).json({ success: false, message: 'Failed to seed demo scenario', error: error.message });
  }
}
