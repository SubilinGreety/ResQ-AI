export type AlertType =
  | 'Flood'
  | 'Earthquake'
  | 'Fire'
  | 'Cyclone'
  | 'Landslide'
  | 'Medical Emergency';

export type AlertLanguage = 'English' | 'Tamil' | 'Hindi';
export type AlertStatus =
  | 'PENDING'
  | 'SENDING'
  | 'DELIVERED'
  | 'FAILED'
  | 'SCHEDULED'
  | 'CANCELLED';

export interface IMassAlertRecord {
  id: string;
  location: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  alertType: AlertType;
  languages: AlertLanguage[];
  messages: Partial<Record<AlertLanguage, string>>;
  status: AlertStatus;
  totalRecipients: number;
  delivered: number;
  pending: number;
  failed: number;
  deliveryRate: number;
  customRecipients?: string[];       // manually added numbers
  customRecipientsCount?: number;    // how many custom numbers were sent to
  scheduledAt?: string;
  sentAt?: string;
  completedAt?: string;
  createdAt: string;
  dataSource: 'SIMULATED';
}

export interface IRecipientEstimate {
  estimatedRecipients: number;
  estimatedPopulation: number;
  radiusKm: number;
  note: string;
}

export interface IDeliveryAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalPending: number;
  totalFailed: number;
  averageDeliveryRate: number;
  byAlertType: Record<string, number>;
  byLanguage: Record<string, number>;
  recentAlerts: IMassAlertRecord[];
}

export interface IMassAlertRequest {
  location: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  alertType: AlertType;
  languages: AlertLanguage[];
  scheduledAt?: string;
  customMessage?: string;
  customRecipients?: string[]; // explicit phone numbers to send to
}
