from typing import List
from models.climate_models import SafeShelter, RescueTeam, DisasterProneZone

# Chennai Safe Shelters
CHENNAI_SAFE_SHELTERS: List[SafeShelter] = [
    SafeShelter(
        id="shelter-1",
        name="Greater Chennai Community Hall & Cyclone Relief Center",
        locality="Saidapet",
        latitude=13.0210,
        longitude=80.2235,
        capacity=1200,
        current_occupancy=140,
        status="READY",
        contact_person="M. Soundararajan (Zonal Officer)",
        contact_phone="+91 94441 23451",
        facilities=["Diesel Generator 120kVA", "Purified RO Water 10,000L", "First Aid Center", "Food Storage 5,000 Rations"]
    ),
    SafeShelter(
        id="shelter-2",
        name="Velachery Multipurpose Disaster Center",
        locality="Velachery Bypass",
        latitude=12.9835,
        longitude=80.2201,
        capacity=2500,
        current_occupancy=420,
        status="READY",
        contact_person="R. Jayakumar (GCC Ward Inspector)",
        contact_phone="+91 94441 23452",
        facilities=["Elevated Plinth 4m", "Helipad Access", "200 Bed Medical Ward", "Mobile Charging Station"]
    ),
    SafeShelter(
        id="shelter-3",
        name="St. Thomas Higher Secondary Relief Complex",
        locality="Mylapore",
        latitude=13.0345,
        longitude=80.2690,
        capacity=950,
        current_occupancy=65,
        status="READY",
        contact_person="Sister Mary Angela",
        contact_phone="+91 94441 23453",
        facilities=["Community Kitchen", "Baby Care Unit", "Solar Battery Backup", "Emergency Satellite Phone"]
    ),
    SafeShelter(
        id="shelter-4",
        name="Tambaram Sanatorium Emergency Shelter",
        locality="Tambaram East",
        latitude=12.9280,
        longitude=80.1150,
        capacity=1800,
        current_occupancy=0,
        status="STANDBY",
        contact_person="K. Vignesh (Tahsildar)",
        contact_phone="+91 94441 23454",
        facilities=["Adjacent Railway Access", "Heavy Vehicle Staging Area", "Water Tanker Sump", "CCTV Monitoring"]
    ),
    SafeShelter(
        id="shelter-5",
        name="Perambur North Chennai Municipal Relief Pavilion",
        locality="Perambur",
        latitude=13.1180,
        longitude=80.2370,
        capacity=1400,
        current_occupancy=110,
        status="READY",
        contact_person="Dr. S. Meenakshi (Health Inspector)",
        contact_phone="+91 94441 23455",
        facilities=["Isolation Ward", "Ambulance Bay", "Community Mess", "Ham Radio Operator Post"]
    )
]

# Chennai Rescue Team Locations
CHENNAI_RESCUE_TEAMS: List[RescueTeam] = [
    RescueTeam(
        id="team-ndrf-01",
        unit_name="NDRF 4th Battalion - Alfa QRF",
        agency="NDRF",
        team_type="Flood Rescue",
        station_location="Adyar River Maraimalai Bridge Staging Post",
        latitude=13.0125,
        longitude=80.2280,
        personnel_count=45,
        boats_available=8,
        ambulances_available=3,
        status="DEPLOYED",
        contact_channel="VHF Channel 16 / TAC-1 (Freq: 156.8 MHz)"
    ),
    RescueTeam(
        id="team-sdrf-02",
        unit_name="Tamil Nadu SDRF Coastal Tactical Unit",
        agency="SDRF",
        team_type="Search & Extrication",
        station_location="Marina Beach Lighthouse Command Post",
        latitude=13.0400,
        longitude=80.2810,
        personnel_count=32,
        boats_available=5,
        ambulances_available=2,
        status="ACTIVE",
        contact_channel="Tamil Nadu Police Wireless (TAC-3)"
    ),
    RescueTeam(
        id="team-tnfrs-03",
        unit_name="TNFRS Fire & Heavy Rescue - Sector 4",
        agency="TNFRS Fire & Rescue",
        team_type="Medical Evacuation",
        station_location="Saidapet Central Fire Station",
        latitude=13.0185,
        longitude=80.2195,
        personnel_count=28,
        boats_available=4,
        ambulances_available=4,
        status="STANDBY",
        contact_channel="Emergency Dispatch 101 / Hotwire"
    ),
    RescueTeam(
        id="team-coastguard-04",
        unit_name="Indian Coast Guard Air & Marine Enclave",
        agency="Coast Guard",
        team_type="Flood Rescue",
        station_location="Chennai Port Basin Base",
        latitude=13.0900,
        longitude=80.2980,
        personnel_count=50,
        boats_available=6,
        ambulances_available=2,
        status="STANDBY",
        contact_channel="Marine VHF Ch-16 / Coastal Radar Net"
    )
]

# Chennai Disaster Prone Zones
CHENNAI_DISASTER_PRONE_ZONES: List[DisasterProneZone] = [
    DisasterProneZone(
        id="zone-dpz-1",
        name="Velachery Lake & Residential Basin",
        zone_type="Flood Basin",
        risk_level="Critical",
        description="Low elevation saucer-shaped depression with high stormwater ingress and slow tidal canal discharge.",
        latitude=12.9815,
        longitude=80.2183,
        radius_meters=1800,
        vulnerable_population=68000
    ),
    DisasterProneZone(
        id="zone-dpz-2",
        name="Adyar River Estuary & Saidapet Causeway",
        zone_type="Flood Basin",
        risk_level="Critical",
        description="Surplus discharge bottleneck from Chembarambakkam reservoir; prone to rapid flash-flooding of causeway.",
        latitude=13.0206,
        longitude=80.2206,
        radius_meters=1400,
        vulnerable_population=45000
    ),
    DisasterProneZone(
        id="zone-dpz-3",
        name="Marina & Foreshore Coastal Storm Surge Belt",
        zone_type="Coastal Surge",
        risk_level="High",
        description="Vulnerable to high astronomical tides, cyclonic waves, and direct seawater inundation of fisherman settlements.",
        latitude=13.0450,
        longitude=80.2820,
        radius_meters=2200,
        vulnerable_population=38000
    ),
    DisasterProneZone(
        id="zone-dpz-4",
        name="Mudichur & Tambaram Low-Lying Swamps",
        zone_type="Low-Lying Waterlogging",
        risk_level="High",
        description="Natural marshland urbanized without peripheral gravity channels; waterlogging exceeds 1.5m in high rainfall.",
        latitude=12.9150,
        longitude=80.0850,
        radius_meters=2500,
        vulnerable_population=52000
    ),
    DisasterProneZone(
        id="zone-dpz-5",
        name="St. Thomas Mount Ridge Quarry Slope",
        zone_type="Landslide Risk",
        risk_level="Moderate",
        description="Exposed weathered charnockite rock face and loose topsoil saturated after prolonged heavy precipitation.",
        latitude=13.0030,
        longitude=80.1940,
        radius_meters=800,
        vulnerable_population=12000
    )
]
