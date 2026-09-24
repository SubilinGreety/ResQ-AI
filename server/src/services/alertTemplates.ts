export type AlertType = 'EVACUATION' | 'FLASH_FLOOD' | 'WATERLOGGING' | 'ADVISORY';
export type AlertChannel = 'SMS' | 'WHATSAPP' | 'SIREN' | 'TACTICAL';

export interface IBilingualAlertContent {
  alertType: AlertType;
  headline: string;
  messageEn: string;
  messageTa: string;
  instructions: string;
  channels: AlertChannel[];
}

export function generateBilingualAlertContent(
  zoneName: string,
  locality: string,
  priority: number,
  severity: string,
  waterLevel: number,
  rainfall: number,
  roadStatus: string
): IBilingualAlertContent {
  if (priority === 1 || severity === 'CRITICAL' || waterLevel >= 2.0) {
    return {
      alertType: 'EVACUATION',
      headline: `🚨 URGENT EVACUATION ORDER: ${locality.toUpperCase()}`,
      messageEn: `EMERGENCY ALERT: Severe flood inundation detected in ${locality} (${waterLevel.toFixed(
        1
      )}m water level, roads ${roadStatus.toLowerCase()}). Immediate evacuation ordered by Tamil Nadu Disaster Management Authority. Move to designated elevated relief centers immediately. Emergency helpline: 1070 / 112.`,
      messageTa: `அவசர எச்சரிக்கை: ${locality} பகுதியில் தீவிர வெள்ளப்பெருக்கு ஏற்பட்டுள்ளது (நீர் மட்டம்: ${waterLevel.toFixed(
        1
      )} மீ, சாலைகள்: ${roadStatus}). பொதுமக்கள் உடனடியாக பாதுகாப்பான மேடான நிவாரண மையங்களுக்கு செல்லுமாறு தமிழ்நாடு பேரிடர் மேலாண்மை ஆணையம் அறிவுறுத்துகிறது. அவசர உதவி எண்: 1070 / 112.`,
      instructions:
        '1. Switch off main electricity and gas connections.\n2. Carry essential medications, documents, and emergency bags.\n3. Do not attempt to drive through inundated roads.\n4. Await rescue teams if trapped on ground floors.',
      channels: ['SMS', 'WHATSAPP', 'SIREN', 'TACTICAL'],
    };
  }

  if (priority === 2 || severity === 'HIGH' || waterLevel >= 1.0) {
    return {
      alertType: 'FLASH_FLOOD',
      headline: `⚠️ FLASH FLOOD WARNING: ${locality.toUpperCase()} SECTOR`,
      messageEn: `FLASH FLOOD WARNING: Rapidly rising water levels (${waterLevel.toFixed(
        1
      )}m) and heavy downpour (${rainfall.toFixed(
        1
      )}mm) reported in ${locality}. Low-lying residents should relocate to upper floors. Avoid underpasses and canal banks. TNDMA relief teams on standby.`,
      messageTa: `திடீர் வெள்ள எச்சரிக்கை: ${locality} பகுதியில் நீர்மட்டம் (${waterLevel.toFixed(
        1
      )} மீ) மற்றும் கனமழை (${rainfall.toFixed(
        1
      )} மி.மீ) பதிவாகியுள்ளது. தாழ்வான பகுதியில் உள்ளவர்கள் மாடிக்கு செல்லவும். தரைப்பாலங்கள் மற்றும் கால்வாய் கரைகளை தவிர்க்கவும்.`,
      instructions:
        '1. Secure drinking water and emergency phone batteries.\n2. Keep children and elderly persons on higher floor levels.\n3. Report waterlogging and stranded neighbors to local ward officers.',
      channels: ['SMS', 'WHATSAPP', 'TACTICAL'],
    };
  }

  if (priority === 3 || severity === 'MODERATE') {
    return {
      alertType: 'WATERLOGGING',
      headline: `🌧️ WATERLOGGING ADVISORY: ${locality.toUpperCase()}`,
      messageEn: `TRAVEL & SAFETY ADVISORY: Moderate water accumulation and traffic delays reported across ${locality} (${roadStatus}). Motorists are advised to avoid waterlogged stretches. Stormwater drain clearing underway.`,
      messageTa: `மழைநீர் தேக்க எச்சரிக்கை: ${locality} பகுதியில் மிதமான மழைநீர் தேக்கமும் போக்குவரத்து பாதிப்பும் (${roadStatus}) ஏற்பட்டுள்ளது. வாகன ஓட்டிகள் கவனமுடன் செல்லவும்.`,
      instructions:
        '1. Avoid non-essential vehicular travel through low-lying junctions.\n2. Keep vehicle parking clear of stormwater drains.\n3. Monitor GCC flood helpline updates.',
      channels: ['SMS', 'WHATSAPP'],
    };
  }

  // Priority 4 - Low / Monitoring
  return {
    alertType: 'ADVISORY',
    headline: `ℹ️ MONSOON WEATHER WATCH: ${locality.toUpperCase()}`,
    messageEn: `WEATHER WATCH: Controlled rainfall conditions observed in ${locality}. Local administration monitoring river basins and sluice gates. Remain alert for periodic updates.`,
    messageTa: `வானிலை தகவல்: ${locality} பகுதியில் மழை அளவு கட்டுப்பாட்டில் உள்ளது. அதிகாரிகள் நிலைமையை தொடர்ந்து கண்காணித்து வருகின்றனர்.`,
    instructions:
      '1. Stay tuned to official weather bulletins.\n2. Keep emergency contacts handy.\n3. Report localized sewage or drain backflow.',
    channels: ['SMS'],
  };
}
