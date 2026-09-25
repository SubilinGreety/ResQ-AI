export type AlertChannel = 'SMS' | 'WHATSAPP' | 'SIREN' | 'TACTICAL';
export type AlertStatus = 'DRAFT' | 'DISPATCHED' | 'CANCELLED' | 'REVOKED';
export type AlertType = 'EVACUATION' | 'WARNING' | 'ADVISORY' | 'ALL_CLEAR';

export interface IAlert {
  id: string;
  scenarioId: string;
  zoneId: string;
  zoneName: string;
  locality: string;
  alertType: AlertType;
  severity: string;
  priority: number;
  headline: string;
  messageEn: string;
  messageTa: string;
  instructions: string;
  channels: AlertChannel[];
  status: AlertStatus;
  targetPopulation: number;
  deliveryRate: number;
  dispatchedAt: string | null;
  createdAt: string;
}

export interface IAlertsData {
  scenarioId: string;
  overview: {
    totalAlerts: number;
    dispatchedCount: number;
    draftCount: number;
    criticalP1Count: number;
    totalPopulationTargeted: number;
    estimatedReached: number;
  };
  alerts: IAlert[];
}
