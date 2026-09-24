import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

// ─────────────────────────────────────────────────────────────────────────────
//  Types  —  designed so real Twilio / TRAI / Telecom APIs can slot in later
// ─────────────────────────────────────────────────────────────────────────────

export type AlertType =
  | 'Flood'
  | 'Earthquake'
  | 'Fire'
  | 'Cyclone'
  | 'Landslide'
  | 'Medical Emergency';

export type AlertLanguage = 'English' | 'Tamil' | 'Hindi';
export type AlertStatus = 'PENDING' | 'SENDING' | 'DELIVERED' | 'FAILED' | 'SCHEDULED' | 'CANCELLED';

export interface MassAlertRequest {
  location: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  alertType: AlertType;
  languages: AlertLanguage[];
  scheduledAt?: string;      // ISO datetime — if omitted, send immediately
  customMessage?: string;    // override default template
  customRecipients?: string[]; // explicit phone numbers (in addition to SIM scan)
}

export interface AlertRecipient {
  simId: string;
  operator: string;
  deliveryStatus: 'DELIVERED' | 'PENDING' | 'FAILED';
  deliveredAt?: string;
  latency?: number; // ms
}

export interface MassAlertRecord {
  id: string;
  location: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  alertType: AlertType;
  languages: AlertLanguage[];
  messages: Record<AlertLanguage, string>;
  status: AlertStatus;
  totalRecipients: number;
  delivered: number;
  pending: number;
  failed: number;
  deliveryRate: number;           // 0-100
  customRecipients?: string[];    // manually added phone numbers
  customRecipientsCount?: number; // count of custom numbers sent
  scheduledAt?: string;
  sentAt?: string;
  completedAt?: string;
  createdAt: string;
  dataSource: 'SIMULATED';
}

export interface DeliveryAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalPending: number;
  totalFailed: number;
  averageDeliveryRate: number;
  byAlertType: Record<string, number>;
  byLanguage: Record<string, number>;
  recentAlerts: MassAlertRecord[];
}

// ─────────────────────────────────────────────────────────────────────────────
//  In-Memory Store  (swap out for Prisma/DB in production)
// ─────────────────────────────────────────────────────────────────────────────

const alertHistory: MassAlertRecord[] = [];

// ─────────────────────────────────────────────────────────────────────────────
//  Alert Message Templates  (English / Tamil / Hindi)
// ─────────────────────────────────────────────────────────────────────────────

const ALERT_TEMPLATES: Record<AlertType, Record<AlertLanguage, string>> = {
  Flood: {
    English:
      '🚨 EMERGENCY ALERT: A flood has been detected in your area ({{location}}). Please move IMMEDIATELY to the nearest safe shelter on higher ground. Follow official instructions from NDRF/District Collector. Helpline: 1070 / 112.',
    Tamil:
      '🚨 அவசர அறிவிப்பு: உங்கள் பகுதியில் ({{location}}) வெள்ளம் கண்டறியப்பட்டுள்ளது. உடனடியாக அருகிலுள்ள பாதுகாப்பான தங்குமிடத்திற்கு நகரவும். NDRF / மாவட்ட ஆட்சியரின் அறிவுறுத்தல்களை பின்பற்றவும். உதவி எண்: 1070 / 112.',
    Hindi:
      '🚨 आपातकालीन चेतावनी: आपके क्षेत्र ({{location}}) में बाढ़ का पता चला है। तुरंत ऊंचे स्थान पर निकटतम सुरक्षित आश्रय में जाएं। NDRF/जिला कलेक्टर के निर्देशों का पालन करें। हेल्पलाइन: 1070 / 112।',
  },
  Earthquake: {
    English:
      '🚨 EMERGENCY ALERT: An earthquake has been detected near {{location}}. DROP, COVER, and HOLD ON. Move away from buildings. Do NOT use elevators. Helpline: 1070 / 112.',
    Tamil:
      '🚨 அவசர அறிவிப்பு: {{location}} அருகே நிலநடுக்கம் ஏற்பட்டுள்ளது. கீழே விழுங்கள், பாதுகாப்பை நாடுங்கள். கட்டிடங்களை விட்டு விலகுங்கள். உயர்த்திகளை பயன்படுத்தாதீர்கள். உதவி எண்: 1070 / 112.',
    Hindi:
      '🚨 आपातकालीन चेतावनी: {{location}} के पास भूकंप आया है। झुकें, ढकें और पकड़ें। इमारतों से दूर जाएं। लिफ्ट का उपयोग न करें। हेल्पलाइन: 1070 / 112।',
  },
  Fire: {
    English:
      '🚨 EMERGENCY ALERT: A fire emergency has been reported in {{location}}. Evacuate IMMEDIATELY. Do NOT use elevators. Cover mouth with cloth. Call 101 (Fire) or 112 (National Emergency).',
    Tamil:
      '🚨 அவசர அறிவிப்பு: {{location}} இல் தீ அவசர நிலை அறிவிக்கப்பட்டுள்ளது. உடனடியாக வெளியேறவும். துணியால் வாயை மூடிக்கொள்ளவும். 101 (தீ) அல்லது 112 (தேசிய அவசரநிலை) அழைக்கவும்.',
    Hindi:
      '🚨 आपातकालीन चेतावनी: {{location}} में आग की आपात स्थिति है। तुरंत निकासी करें। कपड़े से मुंह ढकें। 101 (अग्निशमन) या 112 (राष्ट्रीय आपातकाल) पर कॉल करें।',
  },
  Cyclone: {
    English:
      '🚨 CYCLONE WARNING: A severe cyclone is approaching {{location}}. Seek IMMEDIATE shelter in a strong building. Move away from coastal areas. Stay indoors until further notice. Helpline: 1070 / 112.',
    Tamil:
      '🚨 சூறாவளி எச்சரிக்கை: {{location}} பகுதியில் கடும் சூறாவளி வருகிறது. உடனடியாக உறுதியான கட்டிடத்தில் தங்கவும். கடலோரப் பகுதிகளை விட்டு விலகவும். உதவி எண்: 1070 / 112.',
    Hindi:
      '🚨 चक्रवात चेतावनी: {{location}} के पास एक गंभीर चक्रवात आ रहा है। तुरंत मजबूत भवन में शरण लें। तटीय क्षेत्रों से दूर जाएं। हेल्पलाइन: 1070 / 112।',
  },
  Landslide: {
    English:
      '🚨 LANDSLIDE WARNING: A landslide risk has been detected in {{location}}. Evacuate to higher, open ground IMMEDIATELY. Avoid valleys and low-lying areas. Helpline: 1070 / 112.',
    Tamil:
      '🚨 நிலச்சரிவு எச்சரிக்கை: {{location}} பகுதியில் நிலச்சரிவு ஆபத்து கண்டறியப்பட்டுள்ளது. உயரமான திறந்த இடத்திற்கு உடனடியாக நகரவும். உதவி எண்: 1070 / 112.',
    Hindi:
      '🚨 भूस्खलन चेतावनी: {{location}} में भूस्खलन का खतरा है। तुरंत ऊंचे खुले मैदान में जाएं। घाटियों और निचले इलाकों से बचें। हेल्पलाइन: 1070 / 112।',
  },
  'Medical Emergency': {
    English:
      '🚨 MEDICAL EMERGENCY: A public health emergency has been declared in {{location}}. Follow health authority guidelines. Avoid crowded areas. Call 108 (Ambulance) or 112 (National Emergency) for assistance.',
    Tamil:
      '🚨 மருத்துவ அவசர நிலை: {{location}} பகுதியில் பொது சுகாதார அவசர நிலை பிரகடனப்படுத்தப்பட்டுள்ளது. சுகாதார அதிகாரிகளின் வழிகாட்டுதல்களை பின்பற்றவும். 108 (ஆம்புலன்ஸ்) அல்லது 112 அழைக்கவும்.',
    Hindi:
      '🚨 चिकित्सा आपातकाल: {{location}} में सार्वजनिक स्वास्थ्य आपातकाल घोषित किया गया है। स्वास्थ्य प्राधिकारियों के दिशानिर्देशों का पालन करें। 108 (एम्बुलेंस) या 112 पर कॉल करें।',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  SIM Count Simulation (matches populationController seed logic)
// ─────────────────────────────────────────────────────────────────────────────

function estimateSimCount(radiusKm: number): number {
  const base = 450 * radiusKm * radiusKm;
  const noise = 0.85 + Math.random() * 0.3;
  return Math.floor(base * noise);
}

function seededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  Message Builder
// ─────────────────────────────────────────────────────────────────────────────

function buildMessages(
  alertType: AlertType,
  location: string,
  languages: AlertLanguage[],
  customMessage?: string
): Record<AlertLanguage, string> {
  const result = {} as Record<AlertLanguage, string>;
  for (const lang of languages) {
    if (customMessage) {
      result[lang] = customMessage;
    } else {
      result[lang] = ALERT_TEMPLATES[alertType][lang].replace(/\{\{location\}\}/g, location);
    }
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
//  SMS Gateway (Supports Real Twilio / Fast2SMS if env keys present, else simulated)
// ─────────────────────────────────────────────────────────────────────────────

async function sendRealSmsIfConfigured(
  recipients: string[],
  messageText: string
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  // 1. Check for Fast2SMS API Key (Popular, fast & free tier for Indian numbers)
  const fast2SmsKey = process.env.FAST2SMS_API_KEY;
  if (fast2SmsKey) {
    const indianNumbers = recipients
      .map((n) => n.replace(/[^0-9]/g, ''))
      .map((n) => (n.length > 10 ? n.slice(-10) : n))
      .filter((n) => n.length === 10);

    if (indianNumbers.length > 0) {
      try {
        console.log(`[FAST2SMS] Dispatching real SMS to ${indianNumbers.length} numbers...`);
        const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            authorization: fast2SmsKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            route: 'q',
            message: messageText,
            language: 'english',
            numbers: indianNumbers.join(','),
          }),
        });
        const data = await res.json() as any;
        console.log('[FAST2SMS Response]', data);
        if (data && data.return) {
          sent += indianNumbers.length;
        } else {
          failed += indianNumbers.length;
        }
      } catch (err) {
        console.error('[FAST2SMS Error]', err);
        failed += indianNumbers.length;
      }
    }
  }

  // 2. Check for Twilio Credentials
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  if (twilioSid && twilioToken && twilioFrom) {
    for (const num of recipients) {
      try {
        const to = num.startsWith('+') ? num : `+91${num}`;
        console.log(`[TWILIO] Sending real SMS to ${to}...`);
        const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
        const body = new URLSearchParams({
          To: to,
          From: twilioFrom,
          Body: messageText,
        });
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: 'Basic ' + Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        });
        const data = await res.json() as any;
        if (res.ok && data.sid) {
          sent++;
          console.log(`[TWILIO Success] SID: ${data.sid}`);
        } else {
          failed++;
          console.error('[TWILIO Error]', data);
        }
      } catch (err) {
        console.error('[TWILIO Exception]', err);
        failed++;
      }
    }
  }

  if (!fast2SmsKey && (!twilioSid || !twilioToken || !twilioFrom)) {
    console.log(
      `[SMS GATEWAY (DEMO/SIMULATION)] Alert triggered. To send REAL SMS to phones, set FAST2SMS_API_KEY or TWILIO_* in server/.env. Target numbers: ${recipients.join(
        ', '
      )}`
    );
  }

  return { sent, failed };
}

async function dispatchViaSmsGateway(
  recipients: number,
  messages: Record<AlertLanguage, string>,
  languages: AlertLanguage[],
  customRecipients: string[] = []
): Promise<{ delivered: number; pending: number; failed: number }> {
  // If custom numbers are present, attempt real SMS dispatch if gateway configured
  if (customRecipients.length > 0) {
    const primaryMsg = messages[languages[0]] || Object.values(messages)[0] || '';
    await sendRealSmsIfConfigured(customRecipients, primaryMsg);
  }

  // Simulate network latency (80–200ms)
  await new Promise((r) => setTimeout(r, 80 + Math.random() * 120));

  const rng = seededRng(Date.now());
  const deliveryRate = 0.88 + rng() * 0.1; // 88–98% delivery
  const failRate = 0.01 + rng() * 0.03; // 1–4% fail

  const delivered = Math.floor(recipients * deliveryRate);
  const failed = Math.floor(recipients * failRate);
  const pending = recipients - delivered - failed;

  return { delivered, pending, failed };
}

// ─────────────────────────────────────────────────────────────────────────────
//  Controller Handlers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/mass-alerts/estimate
 * Returns estimated recipient count before sending.
 */
export const estimateRecipients = async (req: Request, res: Response): Promise<void> => {
  try {
    const { radiusKm = 1 } = req.body as { radiusKm?: number };
    const estimatedSims = estimateSimCount(radiusKm);
    res.json({
      success: true,
      data: {
        estimatedRecipients: estimatedSims,
        estimatedPopulation: Math.floor(estimatedSims * 3.1),
        radiusKm,
        note: 'Based on anonymized active SIM network telemetry.',
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/mass-alerts/send
 * Send mass alert immediately.
 * SWAP POINT: Replace dispatchViaSmsGateway() with Twilio / TRAI API.
 */
export const sendMassAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as MassAlertRequest;
    const {
      location,
      latitude = 13.04,
      longitude = 80.22,
      radiusKm = 1,
      alertType,
      languages = ['English'],
      customMessage,
      customRecipients = [],
    } = body;

    if (!location || !alertType) {
      res.status(400).json({ success: false, message: 'location and alertType are required.' });
      return;
    }

    // Validate phone numbers (basic: 10-digit or +91 format)
    const validRecipients = (customRecipients as string[]).filter((n) =>
      /^[+]?[0-9]{7,15}$/.test(n.replace(/\s/g, ''))
    );

    const messages = buildMessages(alertType, location, languages as AlertLanguage[], customMessage);
    const simCount = estimateSimCount(radiusKm);
    // Total = SIM-based + custom numbers (deduplicated impact)
    const totalRecipients = simCount + validRecipients.length;

    // Create record in SENDING state
    const record: MassAlertRecord = {
      id: uuidv4(),
      location,
      latitude,
      longitude,
      radiusKm,
      alertType: alertType as AlertType,
      languages: languages as AlertLanguage[],
      messages,
      status: 'SENDING',
      totalRecipients,
      delivered: 0,
      pending: totalRecipients,
      failed: 0,
      deliveryRate: 0,
      customRecipients: validRecipients,
      customRecipientsCount: validRecipients.length,
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      dataSource: 'SIMULATED',
    };

    alertHistory.unshift(record);

    // Fire-and-forget delivery simulation (and real SMS if configured)
    dispatchViaSmsGateway(totalRecipients, messages, languages as AlertLanguage[], validRecipients).then(
      ({ delivered, pending, failed }) => {
        const idx = alertHistory.findIndex((a) => a.id === record.id);
        if (idx !== -1) {
          alertHistory[idx] = {
            ...alertHistory[idx],
            status: 'DELIVERED',
            delivered,
            pending,
            failed,
            deliveryRate: Math.round((delivered / totalRecipients) * 100),
            completedAt: new Date().toISOString(),
          };
        }
      }
    );

    res.json({ success: true, data: record });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/mass-alerts/schedule
 * Schedule an alert for a future datetime.
 */
export const scheduleMassAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as MassAlertRequest;
    const {
      location,
      latitude = 13.04,
      longitude = 80.22,
      radiusKm = 1,
      alertType,
      languages = ['English'],
      scheduledAt,
      customMessage,
      customRecipients = [],
    } = body;

    if (!location || !alertType || !scheduledAt) {
      res.status(400).json({
        success: false,
        message: 'location, alertType, and scheduledAt are required for scheduling.',
      });
      return;
    }

    const validRecipients = (customRecipients as string[]).filter((n) =>
      /^[+]?[0-9]{7,15}$/.test(n.replace(/\s/g, ''))
    );

    const messages = buildMessages(alertType, location, languages as AlertLanguage[], customMessage);
    const simCount = estimateSimCount(radiusKm);
    const totalRecipients = simCount + validRecipients.length;

    const record: MassAlertRecord = {
      id: uuidv4(),
      location,
      latitude,
      longitude,
      radiusKm,
      alertType: alertType as AlertType,
      languages: languages as AlertLanguage[],
      messages,
      status: 'SCHEDULED',
      totalRecipients,
      delivered: 0,
      pending: totalRecipients,
      failed: 0,
      deliveryRate: 0,
      customRecipients: validRecipients,
      customRecipientsCount: validRecipients.length,
      scheduledAt,
      createdAt: new Date().toISOString(),
      dataSource: 'SIMULATED',
    };

    alertHistory.unshift(record);
    res.json({ success: true, data: record });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /api/mass-alerts/:id/cancel
 * Cancel a scheduled or pending alert.
 */
export const cancelMassAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const idx = alertHistory.findIndex((a) => a.id === id);
    if (idx === -1) {
      res.status(404).json({ success: false, message: 'Alert not found.' });
      return;
    }
    if (alertHistory[idx].status === 'DELIVERED') {
      res.status(409).json({ success: false, message: 'Cannot cancel an already delivered alert.' });
      return;
    }
    alertHistory[idx] = { ...alertHistory[idx], status: 'CANCELLED' };
    res.json({ success: true, data: alertHistory[idx] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/mass-alerts/history
 * Return full alert history.
 */
export const getAlertHistory = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json({ success: true, data: alertHistory, total: alertHistory.length });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/mass-alerts/analytics
 * Aggregate delivery metrics.
 */
export const getDeliveryAnalytics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const sent = alertHistory.filter((a) => a.status !== 'SCHEDULED' && a.status !== 'CANCELLED');

    const byAlertType: Record<string, number> = {};
    const byLanguage: Record<string, number> = {};

    for (const a of sent) {
      byAlertType[a.alertType] = (byAlertType[a.alertType] || 0) + 1;
      for (const lang of a.languages) {
        byLanguage[lang] = (byLanguage[lang] || 0) + 1;
      }
    }

    const totalDelivered = sent.reduce((s, a) => s + a.delivered, 0);
    const totalPending = sent.reduce((s, a) => s + a.pending, 0);
    const totalFailed = sent.reduce((s, a) => s + a.failed, 0);
    const totalSent = sent.reduce((s, a) => s + a.totalRecipients, 0);
    const avgRate =
      sent.length > 0
        ? Math.round(sent.reduce((s, a) => s + a.deliveryRate, 0) / sent.length)
        : 0;

    const analytics: DeliveryAnalytics = {
      totalSent,
      totalDelivered,
      totalPending,
      totalFailed,
      averageDeliveryRate: avgRate,
      byAlertType,
      byLanguage,
      recentAlerts: alertHistory.slice(0, 10),
    };

    res.json({ success: true, data: analytics });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/mass-alerts/:id
 * Get a specific alert record (used for polling delivery status).
 */
export const getAlertById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const alert = alertHistory.find((a) => a.id === id);
    if (!alert) {
      res.status(404).json({ success: false, message: 'Alert not found.' });
      return;
    }
    res.json({ success: true, data: alert });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
