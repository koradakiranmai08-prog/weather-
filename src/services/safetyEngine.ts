import { WeatherData, HazardEvaluation, HazardType, AlertLevel, PrecautionItem } from '../types/weather';

export function evaluateHazards(weather: WeatherData, simulationMode?: HazardType): HazardEvaluation {
  const current = weather.current;
  const daily = weather.daily;
  const countryCode = weather.location.country_code.toUpperCase();

  // Metrics
  let windGust = current.wind_gusts_10m || current.wind_speed_10m * 1.3;
  let windSpeed = current.wind_speed_10m;
  let pressure = current.pressure_msl || 1013;
  let code = current.weather_code;
  let rainSum = daily.precipitation_sum?.[0] || (current.rain * 4);
  let temp = current.temperature;
  let aqi = weather.airQuality?.us_aqi || 45;

  // Apply Simulation Override if user toggled test mode
  if (simulationMode === 'cyclone') {
    windGust = 118;
    windSpeed = 85;
    pressure = 968;
    code = 99;
    rainSum = 95;
  } else if (simulationMode === 'flood') {
    rainSum = 135;
    current.precipitation = 28;
    code = 82;
  } else if (simulationMode === 'extreme_heat') {
    temp = 42.5;
  } else if (simulationMode === 'severe_storm') {
    code = 96;
    windGust = 82;
    rainSum = 45;
  }

  // 1. Calculate Cyclone Risk (0 - 100)
  let cycloneRisk = 0;
  if (windGust > 100) cycloneRisk += 55;
  else if (windGust > 75) cycloneRisk += 38;
  else if (windGust > 55) cycloneRisk += 20;

  if (windSpeed > 60) cycloneRisk += 25;
  else if (windSpeed > 40) cycloneRisk += 15;

  if (pressure < 980) cycloneRisk += 25;
  else if (pressure < 995) cycloneRisk += 15;
  else if (pressure < 1005) cycloneRisk += 5;

  if ([95, 96, 99].includes(code)) cycloneRisk += 15;
  cycloneRisk = Math.min(100, cycloneRisk);

  // 2. Calculate Flood Risk (0 - 100)
  let floodRisk = 0;
  if (rainSum > 80) floodRisk += 60;
  else if (rainSum > 45) floodRisk += 40;
  else if (rainSum > 20) floodRisk += 20;

  if (current.precipitation > 15) floodRisk += 35;
  else if (current.precipitation > 5) floodRisk += 20;

  if (code === 82 || code === 65) floodRisk += 25;
  else if ([63, 81].includes(code)) floodRisk += 12;

  floodRisk = Math.min(100, floodRisk);

  // Identify Hazards
  const hazardTypes: HazardType[] = [];
  if (cycloneRisk >= 60 || windGust >= 80) hazardTypes.push('cyclone');
  if (floodRisk >= 60 || rainSum >= 50) hazardTypes.push('flood');
  if ([95, 96, 99].includes(code)) hazardTypes.push('severe_storm');
  if (temp >= 38) hazardTypes.push('extreme_heat');
  if (temp <= -10) hazardTypes.push('extreme_cold');
  if (windGust >= 60 && !hazardTypes.includes('cyclone')) hazardTypes.push('high_wind');
  if (aqi > 150) hazardTypes.push('hazardous_aqi');

  // Determine Primary Hazard & Red Zone
  const isRedZone = cycloneRisk >= 65 || floodRisk >= 65 || windGust >= 90 || rainSum >= 65 || simulationMode === 'cyclone' || simulationMode === 'flood';
  
  let alertLevel: AlertLevel = 'safe';
  if (isRedZone) {
    alertLevel = 'red_zone';
  } else if (cycloneRisk >= 40 || floodRisk >= 40 || hazardTypes.length > 0) {
    alertLevel = 'warning';
  } else if (code >= 51 && code <= 65) {
    alertLevel = 'caution';
  }

  let primaryHazard: HazardType = 'none';
  if (cycloneRisk >= floodRisk && cycloneRisk >= 45) {
    primaryHazard = 'cyclone';
  } else if (floodRisk >= 45) {
    primaryHazard = 'flood';
  } else if (hazardTypes.length > 0) {
    primaryHazard = hazardTypes[0];
  }

  // Titles and summaries
  let hazardTitle = 'Normal Meteorological Conditions';
  let hazardSummary = `Weather conditions in ${weather.location.name} are currently stable with no immediate severe weather warnings. Regular outdoor activities may proceed.`;
  let evacuationAdvisory: 'none' | 'monitor' | 'prepare_evacuation' | 'mandatory_evacuation' = 'none';

  if (isRedZone) {
    if (primaryHazard === 'cyclone') {
      hazardTitle = `CRITICAL RED ZONE: Severe Cyclone / High-Wind Vortex Alert`;
      hazardSummary = `URGENT: ${weather.location.name} is marked as a RED ZONE due to dangerous cyclonic wind gusts (${Math.round(windGust)} km/h) and severe atmospheric depression. High danger of structural damage, uprooted trees, power line failure, and coastal surge.`;
      evacuationAdvisory = windGust >= 105 ? 'mandatory_evacuation' : 'prepare_evacuation';
    } else if (primaryHazard === 'flood') {
      hazardTitle = `CRITICAL RED ZONE: Severe Flash Flood & Inundation Warning`;
      hazardSummary = `URGENT: ${weather.location.name} is marked as a RED ZONE due to extreme precipitation (${Math.round(rainSum)} mm/24h) and rapid inundation danger. Low-lying zones, underpasses, and riverbanks are at imminent risk of severe flooding.`;
      evacuationAdvisory = rainSum >= 80 ? 'mandatory_evacuation' : 'prepare_evacuation';
    } else {
      hazardTitle = `CRITICAL RED ZONE: Extreme Severe Weather Emergency`;
      hazardSummary = `URGENT: Critical atmospheric hazards detected in ${weather.location.name}. Dangerous downpours and destructive squalls require immediate shelter and high-level precautions.`;
      evacuationAdvisory = 'prepare_evacuation';
    }
  } else if (alertLevel === 'warning') {
    if (primaryHazard === 'cyclone' || primaryHazard === 'high_wind') {
      hazardTitle = `Amber Alert: Gale Force Winds & Squall Advisory`;
      hazardSummary = `Gusty winds up to ${Math.round(windGust)} km/h reported in ${weather.location.name}. Secure loose outdoor fixtures and avoid high-rise balconies or scaffoldings.`;
      evacuationAdvisory = 'monitor';
    } else if (primaryHazard === 'flood') {
      hazardTitle = `Amber Alert: Heavy Rain & Urban Waterlogging Advisory`;
      hazardSummary = `Continuous rainfall may lead to localized street pooling and drainage bottlenecks across ${weather.location.name}. Exercise caution on roads.`;
      evacuationAdvisory = 'monitor';
    } else if (primaryHazard === 'extreme_heat') {
      hazardTitle = `Heatwave Warning: Dangerous Thermal Index (${Math.round(temp)}°C)`;
      hazardSummary = `Severe temperature elevation. High risk of dehydration, heat cramps, and heat exhaustion under prolonged direct sun.`;
      evacuationAdvisory = 'none';
    } else if (primaryHazard === 'severe_storm') {
      hazardTitle = `Thunderstorm & Lightning Warning`;
      hazardSummary = `Active electrical storm activity in the sector. Seek indoor shelter and unplug non-surge-protected appliances.`;
      evacuationAdvisory = 'monitor';
    }
  }

  // Precautions Generation with Problem Resolutions
  const precautions: PrecautionItem[] = [];

  // Red Zone Specific Precautions
  if (isRedZone) {
    if (primaryHazard === 'cyclone' || cycloneRisk >= 50) {
      precautions.push(
        {
          id: 'cyc-1',
          urgency: 'critical',
          category: 'Immediate Safety',
          title: 'Shelter in Interior Reinforced Rooms',
          description: 'Stay away from glass windows, skylights, and exterior walls. Move to an interior hallway or bathroom on the lowest floor if winds escalate.',
          actionRequired: true,
          problemSummary: 'Violent aerodynamic wind shear and airborne high-velocity shrapnel can shatter exterior glass and collapse perimeter walls.',
          resolutionSteps: [
            { step: 1, instruction: 'Identify the lowest level interior corridor, closet, or bathroom with zero window exposure.', actionType: 'physical' },
            { step: 2, instruction: 'Bring heavy blankets or mattress to cover head and torso against collapsing debris.', actionType: 'equipment' },
            { step: 3, instruction: 'Keep battery-powered NOAA/FM radio tuned to emergency broadcast stations for all-clear confirmation.', actionType: 'communication' },
          ],
        },
        {
          id: 'cyc-2',
          urgency: 'critical',
          category: 'Home & Property',
          title: 'Secure External Structures & Loose Articles',
          description: 'Anchor or move indoors all patio furniture, tin sheeting, signage, garbage bins, and solar fixtures. Deadbolt all doors and shutter windows.',
          actionRequired: true,
          problemSummary: 'Loose outdoor objects transform into deadly projectiles in gusts exceeding 80 km/h, breaching structural envelopes.',
          resolutionSteps: [
            { step: 1, instruction: 'Move all garden furniture, garbage bins, and loose equipment into a locked garage or interior room.', actionType: 'physical' },
            { step: 2, instruction: 'Fasten hurricane shutters, pre-cut plywood boards, or apply reinforced structural bracing to garage doors.', actionType: 'infrastructure' },
            { step: 3, instruction: 'Deadbolt and cross-bar all external entry doors to counteract internal pressure changes.', actionType: 'physical' },
          ],
        },
        {
          id: 'cyc-3',
          urgency: 'high',
          category: 'Immediate Safety',
          title: 'Do Not Exit During the Eye of the Storm',
          description: 'A sudden calm may indicate the storm eye passing directly overhead. Winds will violently resume from the opposite direction within minutes.',
          actionRequired: true,
          problemSummary: 'The false calm of the cyclone eye lures individuals outside right before the eyewall strikes with counter-directional peak winds.',
          resolutionSteps: [
            { step: 1, instruction: 'Remain anchored in the interior shelter even if winds cease and sunlight breaks through.', actionType: 'physical' },
            { step: 2, instruction: 'Monitor barometric pressure telemetry; pressure must rise steadily before declaring danger passed.', actionType: 'equipment' },
            { step: 3, instruction: 'Wait for the official Civil Protection or Met Bureau "All-Clear" bulletin before stepping outdoors.', actionType: 'communication' },
          ],
        },
        {
          id: 'cyc-4',
          urgency: 'high',
          category: 'Disaster Kit',
          title: 'Prepare 72-Hour Survival Go-Bag',
          description: 'Pack potable bottled water (3 liters/person/day), dry energy rations, medical supplies, high-power LED flashlights, power banks, and battery radio.',
          actionRequired: true,
          problemSummary: 'Utility grids, supply chains, and municipal water supply are typically disabled for 3 to 7 days post-cyclone.',
          resolutionSteps: [
            { step: 1, instruction: 'Fill clean sealable containers with drinking water (minimum 3L per person per day).', actionType: 'equipment' },
            { step: 2, instruction: 'Pack non-perishable caloric food, waterproof matches, multi-tool, and essential prescription medications.', actionType: 'medical' },
            { step: 3, instruction: 'Seal birth certificates, property deeds, and identification in dual zip-lock watertight pouches.', actionType: 'equipment' },
          ],
        }
      );
    }

    if (primaryHazard === 'flood' || floodRisk >= 50) {
      precautions.push(
        {
          id: 'fld-1',
          urgency: 'critical',
          category: 'Travel & Transit',
          title: 'Never Walk or Drive Through Moving Floodwater',
          description: 'Turn Around, Don\'t Drown. Just 15 cm (6 in) of rushing water can knock down an adult; 30 cm (12 in) can float and sweep away light passenger vehicles.',
          actionRequired: true,
          problemSummary: 'Submerged roadbeds are frequently washed out beneath floodwaters, creating hidden death traps and uncontrollable vehicle hydroplaning.',
          resolutionSteps: [
            { step: 1, instruction: 'Immediately halt the vehicle before entering standing or moving water of unknown depth.', actionType: 'physical' },
            { step: 2, instruction: 'Execute a safe 3-point turnaround and navigate via pre-designated elevated arterial ridges.', actionType: 'physical' },
            { step: 3, instruction: 'If stalled in rising water, abandon vehicle immediately and climb to higher ground or a concrete building.', actionType: 'physical' },
          ],
        },
        {
          id: 'fld-2',
          urgency: 'critical',
          category: 'Home & Property',
          title: 'Shut Off Main Electrical Breaker & Gas Supply',
          description: 'If water begins to enter your building or basement, cut off electricity at the main breaker before standing water reaches outlets. Avoid all submerged wiring.',
          actionRequired: true,
          problemSummary: 'Electrification of standing floodwater causes immediate lethal shock to occupants, while ruptured gas lines trigger explosions.',
          resolutionSteps: [
            { step: 1, instruction: 'Stand on a dry wooden or rubber surface before touching the main breaker panel.', actionType: 'physical' },
            { step: 2, instruction: 'Trip the primary master circuit breaker switch to de-energize the entire residence.', actionType: 'infrastructure' },
            { step: 3, instruction: 'Use a wrench to rotate the external gas meter quarter-turn valve perpendicular to the pipe.', actionType: 'infrastructure' },
          ],
        },
        {
          id: 'fld-3',
          urgency: 'critical',
          category: 'Immediate Safety',
          title: 'Evacuate to Designated Elevated Ground',
          description: 'Residents in low-lying riparian or coastal floodplains must immediately relocate to municipal flood shelters or upper concrete structures.',
          actionRequired: true,
          problemSummary: 'Rapid watershed pooling can trap occupants in basements or ground floor dwellings within 30 minutes of cloudburst.',
          resolutionSteps: [
            { step: 1, instruction: 'Grab your pre-packed 72-hour survival Go-Bag and wear closed waterproof boots.', actionType: 'equipment' },
            { step: 2, instruction: 'Follow designated civic evacuation routes away from river culverts and low underpasses.', actionType: 'physical' },
            { step: 3, instruction: 'Check in at the nearest municipal high-ground shelter or register status with emergency dispatch.', actionType: 'communication' },
          ],
        },
        {
          id: 'fld-4',
          urgency: 'high',
          category: 'Health & Water',
          title: 'Decontaminate & Boil All Drinking Water',
          description: 'Municipal mains and ground wells are routinely compromised by sewage runoff during floods. Boil water vigorously for 3 minutes before consumption.',
          actionRequired: true,
          problemSummary: 'Flood overflows cross-contaminate municipal freshwater lines with sewer effluent, causing rapid outbreaks of cholera and dysentery.',
          resolutionSteps: [
            { step: 1, instruction: 'Bring water to a rolling vigorous boil for at least 3 minutes, then cool naturally.', actionType: 'medical' },
            { step: 2, instruction: 'If fuel is unavailable, add 8 drops of unscented 6% household bleach per gallon of clear water and wait 30 minutes.', actionType: 'medical' },
            { step: 3, instruction: 'Store purified water strictly in sanitized food-grade containers with airtight seals.', actionType: 'equipment' },
          ],
        }
      );
    }
  }

  // General or Specific Weather Precautions
  if (temp >= 36) {
    precautions.push(
      {
        id: 'heat-1',
        urgency: temp >= 40 ? 'critical' : 'high',
        category: 'Health & Water',
        title: 'Rigorous Hydration & Heatstroke Mitigation',
        description: 'Drink electrolyte-rich fluids continuously even if not thirsty. Avoid caffeine and alcohol. Keep curtains drawn against sun radiant heat.',
        actionRequired: true,
        problemSummary: 'Extreme ambient temperature impairs the body\'s autonomic evaporative cooling, elevating core temp to fatal levels.',
        resolutionSteps: [
          { step: 1, instruction: 'Drink 250ml of cool water or electrolyte-balanced fluids every 20-30 minutes.', actionType: 'medical' },
          { step: 2, instruction: 'Close blackouts and solar blinds on east/west-facing windows to block infrared thermal transfer.', actionType: 'physical' },
          { step: 3, instruction: 'If experiencing confusion or hot dry skin, apply ice compresses to neck, groin, and armpits.', actionType: 'medical' },
        ],
      },
      {
        id: 'heat-2',
        urgency: 'high',
        category: 'Immediate Safety',
        title: 'Avoid Direct Midday Sun (11:00 - 16:00)',
        description: 'Limit heavy physical outdoor exertion. Check on infants, elderly neighbors, and outdoor domestic animals regularly.',
        actionRequired: false,
        problemSummary: 'Peak solar UV and radiant thermal index generate rapid second-degree burns and acute heat cramps.',
        resolutionSteps: [
          { step: 1, instruction: 'Reschedule all strenuous outdoor tasks to early morning (05:00 - 08:00) or post-sunset.', actionType: 'physical' },
          { step: 2, instruction: 'Wear wide-brimmed protective hats, UV400 sunglasses, and loose-weave light cotton attire.', actionType: 'equipment' },
          { step: 3, instruction: 'Never leave children, vulnerable individuals, or pets in locked parked vehicles for any length of time.', actionType: 'physical' },
        ],
      }
    );
  }

  if (temp <= 0) {
    precautions.push(
      {
        id: 'cold-1',
        urgency: 'high',
        category: 'Immediate Safety',
        title: 'Thermal Layering & Hypothermia Prevention',
        description: 'Wear multi-layer moisture-wicking and windproof clothing. Cover extremities (fingers, ears, face) to prevent frostbite.',
        actionRequired: true,
        problemSummary: 'Sub-zero temperatures rapidly sap core thermal reserve, causing loss of motor coordination and frostbite within 15 minutes of exposure.',
        resolutionSteps: [
          { step: 1, instruction: 'Dress in three distinct layers: moisture-wicking base, insulating fleece mid-layer, and windproof outer shell.', actionType: 'equipment' },
          { step: 2, instruction: 'Wear thermal balaclava, waterproof insulated gloves, and wool thermal socks.', actionType: 'equipment' },
          { step: 3, instruction: 'Watch for numbness, waxy skin coloration, or uncontrollable shivering and warm gradually.', actionType: 'medical' },
        ],
      },
      {
        id: 'cold-2',
        urgency: 'medium',
        category: 'Travel & Transit',
        title: 'Black Ice on Roadways & Bridges',
        description: 'Bridges and overpasses freeze first. Reduce vehicle velocity by at least 40% and maintain 5x usual braking distance.',
        actionRequired: true,
        problemSummary: 'Invisible transparent sheets of ice on bridge decks completely eliminate tire friction, triggering multi-vehicle pileups.',
        resolutionSteps: [
          { step: 1, instruction: 'Reduce highway speeds by minimum 40% and disable cruise control completely.', actionType: 'physical' },
          { step: 2, instruction: 'Maintain at least 8 to 10 vehicle car lengths of buffer space behind the lead vehicle.', actionType: 'physical' },
          { step: 3, instruction: 'In a skid, do not slam brakes; gently steer into the direction of the skid until traction returns.', actionType: 'physical' },
        ],
      }
    );
  }

  if (aqi > 120) {
    precautions.push({
      id: 'aqi-1',
      urgency: aqi > 200 ? 'critical' : 'high',
      category: 'Health & Water',
      title: 'Respiratory Protection (N95 / HEPA Filtration)',
      description: `Elevated particulate matter detected (AQI: ${aqi}). Wear a snug N95 respirator mask outdoors and seal doors and windows.`,
      actionRequired: true,
      problemSummary: 'Microscopic PM2.5 particles penetrate deep into alveolar lung tissue and bloodstream, triggering acute cardiopulmonary distress.',
      resolutionSteps: [
        { step: 1, instruction: 'Fit an authentic NIOSH-approved N95 or FFP2 mask with a tight nasal wire seal before exiting buildings.', actionType: 'medical' },
        { step: 2, instruction: 'Operate indoor HEPA air filtration units on continuous medium/high mode.', actionType: 'equipment' },
        { step: 3, instruction: 'Keep all exterior windows and vents sealed; use recirculated air mode in vehicles.', actionType: 'physical' },
      ],
    });
  }

  if (precautions.length === 0) {
    // Normal fair weather precautions
    precautions.push(
      {
        id: 'norm-1',
        urgency: 'general',
        category: 'Immediate Safety',
        title: 'Pleasant & Favorable Weather Conditions',
        description: 'Current meteorological indicators are within comfortable and safe thresholds. Routine travel and work can continue normally.',
        actionRequired: false,
        problemSummary: 'No acute meteorological threats present; focus on routine situational awareness.',
        resolutionSteps: [
          { step: 1, instruction: 'Check the daily weather outlook periodically for unexpected convective shifts.', actionType: 'communication' },
          { step: 2, instruction: 'Enjoy outdoor recreational activities while maintaining proper hydration.', actionType: 'physical' },
        ],
      },
      {
        id: 'norm-2',
        urgency: 'general',
        category: 'Health & Water',
        title: 'UV & Hydration Awareness',
        description: 'Apply broad-spectrum sunscreen (SPF 30+) during peak sunshine hours and maintain healthy daily fluid intake.',
        actionRequired: false,
        problemSummary: 'Prolonged cumulative ultraviolet exposure causes cellular skin damage and premature aging.',
        resolutionSteps: [
          { step: 1, instruction: 'Apply SPF 30+ broad-spectrum sunscreen 15 minutes before direct sun exposure.', actionType: 'medical' },
          { step: 2, instruction: 'Reapply every two hours or immediately following swimming or heavy sweating.', actionType: 'medical' },
        ],
      },
      {
        id: 'norm-3',
        urgency: 'general',
        category: 'Disaster Kit',
        title: 'Routine Household Readiness Check',
        description: 'Keep your basic household first-aid kit stocked and ensure emergency contact numbers are saved on family phones.',
        actionRequired: false,
        problemSummary: 'Unexpected regional power disruptions or weather changes can occur without extended warning.',
        resolutionSteps: [
          { step: 1, instruction: 'Verify flashlights have working batteries and test domestic smoke/carbon monoxide alarms.', actionType: 'equipment' },
          { step: 2, instruction: 'Ensure family members have primary and secondary local emergency contact numbers memorized.', actionType: 'communication' },
        ],
      }
    );
  }

  // Always include standard disaster prep item if high risk or warning
  if (alertLevel !== 'safe' && !precautions.some((p) => p.category === 'Disaster Kit')) {
    precautions.push({
      id: 'kit-1',
      urgency: 'high',
      category: 'Disaster Kit',
      title: 'Power & Communication Readiness',
      description: 'Fully charge all mobile phones, rechargeable lanterns, and backup power banks before potential power grid disruptions.',
      actionRequired: true,
      problemSummary: 'High winds and deluge frequently sever municipal high-voltage transmission lines, disabling cellular towers.',
      resolutionSteps: [
        { step: 1, instruction: 'Charge all smartphones, rechargeable radios, and external battery power banks to 100%.', actionType: 'equipment' },
        { step: 2, instruction: 'Download offline area maps and save emergency contact cards to device local storage.', actionType: 'communication' },
        { step: 3, instruction: 'Switch phone to Battery Saver or Low Power mode to maximize communication duration.', actionType: 'equipment' },
      ],
    });
  }

  // Country-specific Emergency Contacts
  const emergencyContacts = getEmergencyContacts(countryCode);

  return {
    alertLevel,
    isRedZone,
    hazardTypes,
    primaryHazard,
    hazardTitle,
    hazardSummary,
    floodRiskScore: Math.round(floodRisk),
    cycloneRiskScore: Math.round(cycloneRisk),
    evacuationAdvisory,
    precautions,
    emergencyContacts,
  };
}

function getEmergencyContacts(countryCode: string) {
  switch (countryCode) {
    case 'US':
      return [
        { title: 'Universal Emergency', number: '911', description: 'Police, Fire, Ambulance & Life Rescue' },
        { title: 'FEMA Disaster Assistance', number: '1-800-621-3362', description: 'Federal Emergency Management Agency' },
        { title: 'National Hurricane Center', number: '305-229-4404', description: 'NOAA Severe Weather Operations' },
        { title: 'Poison Control Center', number: '1-800-222-1222', description: '24/7 Toxic Ingestion & Chemical Hotline' },
      ];
    case 'IN':
      return [
        { title: 'National Emergency Helpline', number: '112', description: 'Unified Police, Fire & Medical Response' },
        { title: 'NDMA Disaster Control', number: '1078', description: 'National Disaster Management Authority' },
        { title: 'Disaster Emergency Service', number: '1070', description: 'State Disaster Management Control Center' },
        { title: 'Ambulance Emergency', number: '108', description: '24/7 Rapid Medical & Trauma Care' },
      ];
    case 'GB':
      return [
        { title: 'UK Emergency Services', number: '999', description: 'Police, Fire, Coastguard & Ambulance' },
        { title: 'Floodline UK', number: '0345 988 1188', description: 'Environment Agency 24/7 Flood Alerts' },
        { title: 'NHS Health Advisory', number: '111', description: 'Non-emergency Medical Guidance' },
      ];
    case 'PH':
      return [
        { title: 'National Emergency', number: '911', description: 'Unified Emergency Dispatch' },
        { title: 'NDRRMC Disaster Hotline', number: '(02) 8911-5061', description: 'National Disaster Risk Reduction Council' },
        { title: 'Red Cross Philippines', number: '143', description: 'Disaster Relief & First Aid' },
      ];
    case 'JP':
      return [
        { title: 'Fire & Ambulance', number: '119', description: 'Fire Department & Emergency Rescue' },
        { title: 'Police Emergency', number: '110', description: 'National Police Agency' },
        { title: 'Disaster Message Dial', number: '171', description: 'NTT Emergency Voice Message Relay' },
      ];
    case 'AU':
      return [
        { title: 'Emergency Triple Zero', number: '000', description: 'Police, Fire & Ambulance Dispatch' },
        { title: 'State Emergency Service (SES)', number: '132 500', description: 'Storm & Flood Assistance' },
        { title: 'Bureau of Meteorology', number: '1300 659 210', description: 'National Weather & Cyclone Warnings' },
      ];
    default:
      return [
        { title: 'Universal International SOS', number: '112', description: 'Global Standard Emergency Protocol (GSM/Mobile)' },
        { title: 'Emergency Dispatch', number: '911 / 112', description: 'Local Police, Fire & Medical Rescue' },
        { title: 'Red Cross / Red Crescent', number: 'Local Branch', description: 'International Humanitarian & Disaster Relief' },
        { title: 'Local Disaster Management', number: 'Dial City Operator', description: 'Civil Defense & Municipal Shelter Office' },
      ];
  }
}
