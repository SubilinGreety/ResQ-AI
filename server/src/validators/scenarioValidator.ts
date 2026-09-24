import { z } from 'zod';

export const ZoneSchemaValidator = z.object({
  name: z.string().min(1, 'Zone name is required'),
  locality: z.string().min(1, 'Area/locality is required'),
  population: z.number().int().nonnegative('Population cannot be negative'),
  severity: z.enum(['Low', 'Moderate', 'High', 'Critical']),
  latitude: z
    .number()
    .min(-90, 'Latitude must be >= -90')
    .max(90, 'Latitude must be <= 90'),
  longitude: z
    .number()
    .min(-180, 'Longitude must be >= -180')
    .max(180, 'Longitude must be <= 180'),
  rainfall: z.number().nonnegative('Rainfall cannot be negative').default(0),
  waterLevel: z.number().nonnegative('Water level cannot be negative').default(0),
  roadStatus: z.string().default('Clear'),
  injured: z.number().int().nonnegative('Injured count cannot be negative').default(0),
  vulnerablePopulation: z
    .number()
    .int()
    .nonnegative('Vulnerable population cannot be negative')
    .default(0),
  status: z.enum(['Safe', 'Monitoring', 'Warning', 'Critical', 'Evacuation Required']),
});

export const ResourceSchemaValidator = z.object({
  rescueVehicles: z.number().int().nonnegative('Rescue vehicles cannot be negative').default(0),
  ambulances: z.number().int().nonnegative('Ambulances cannot be negative').default(0),
  doctors: z.number().int().nonnegative('Doctors cannot be negative').default(0),
  medicalTeams: z.number().int().nonnegative('Medical teams cannot be negative').default(0),
  shelters: z.number().int().nonnegative('Shelters cannot be negative').default(0),
  foodKits: z.number().int().nonnegative('Food kits cannot be negative').default(0),
  waterSupplies: z.number().int().nonnegative('Water supplies cannot be negative').default(0),
  rescuePersonnel: z.number().int().nonnegative('Rescue personnel cannot be negative').default(0),
});

export const CreateScenarioValidator = z.object({
  name: z.string().min(2, 'Scenario name must be at least 2 characters'),
  disasterType: z.enum(['Flood', 'Cyclone', 'Tsunami', 'Earthquake']),
  city: z.string().default('Chennai'),
  description: z.string().optional().default(''),
  severity: z.enum(['Low', 'Moderate', 'High', 'Critical']),
  dateTime: z.string().or(z.date()).optional(),
  zones: z
    .array(ZoneSchemaValidator)
    .min(1, 'At least one affected zone is required before saving a scenario'),
  resources: ResourceSchemaValidator.optional().default({
    rescueVehicles: 0,
    ambulances: 0,
    doctors: 0,
    medicalTeams: 0,
    shelters: 0,
    foodKits: 0,
    waterSupplies: 0,
    rescuePersonnel: 0,
  }),
});

export const UpdateScenarioValidator = z.object({
  name: z.string().min(2, 'Scenario name must be at least 2 characters').optional(),
  disasterType: z.enum(['Flood', 'Cyclone', 'Tsunami', 'Earthquake']).optional(),
  city: z.string().optional(),
  description: z.string().optional(),
  severity: z.enum(['Low', 'Moderate', 'High', 'Critical']).optional(),
  dateTime: z.string().or(z.date()).optional(),
});
