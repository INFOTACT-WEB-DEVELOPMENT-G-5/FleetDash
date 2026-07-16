const Vehicle = require("../models/Vehicle");
const FuelRecord = require("../models/FuelRecord");
const MaintenancePrediction = require("../models/MaintenancePrediction");
const DriverScore = require("../models/DriverScore");
const { sendUpdate } = require("../socket/socket");

// ===================== AI MAINTENANCE PREDICTION ENGINE =====================

async function analyzeMaintenanceNeeds(vehicle) {
  try {
    const mileage = vehicle.distance || 0;
    const fuel = vehicle.fuel || 100;
    const speed = vehicle.speed || 0;
    const fuelConsumption = 100 - fuel;
    const drivingIntensity = speed > 80 ? "High" : speed > 50 ? "Medium" : "Low";
    
    const components = [
      { name: "Brake System", probMultiplier: 0.3, costBase: 3000 },
      { name: "Engine Oil", probMultiplier: 0.2, costBase: 1500 },
      { name: "Tire Wear", probMultiplier: 0.15, costBase: 8000 },
      { name: "Battery Health", probMultiplier: 0.1, costBase: 5000 },
      { name: "Coolant System", probMultiplier: 0.05, costBase: 2000 },
      { name: "Transmission", probMultiplier: 0.2, costBase: 12000 }
    ];

    const predictions = [];
    let overallHealth = 100;

    for (const comp of components) {
      let baseProb = comp.probMultiplier * 100;
      
      // Mileage factor
      if (mileage > 10000) baseProb += 15;
      else if (mileage > 5000) baseProb += 8;
      
      // Fuel consumption factor
      if (fuelConsumption > 60) baseProb += 10;
      
      // Driving intensity factor
      if (drivingIntensity === "High") baseProb += 12;
      else if (drivingIntensity === "Medium") baseProb += 5;
      
      // Random variation
      const variation = (Math.random() - 0.5) * 20;
      const probability = Math.min(Math.round(baseProb + variation), 99);
      
      const predDays = Math.max(1, Math.round((100 - probability) * 0.5 + Math.random() * 10));
      
      const predictedDate = new Date();
      predictedDate.setDate(predictedDate.getDate() + predDays);
      
      const cost = Math.round(comp.costBase * (0.8 + Math.random() * 0.4));
      
      let severity = "Low";
      if (probability > 75) severity = "Critical";
      else if (probability > 55) severity = "High";
      else if (probability > 35) severity = "Medium";

      // Deduct from health score
      if (probability > 50) overallHealth -= (probability - 50) * 0.3;

      let prediction = await MaintenancePrediction.findOne({
        vehicleId: vehicle.vehicleId,
        component: comp.name,
        status: "Pending"
      });

      if (prediction) {
        prediction.probability = probability;
        prediction.predictedDays = predDays;
        prediction.healthScore = Math.max(0, Math.round(overallHealth));
        prediction.severity = severity;
        prediction.estimatedCost = cost;
        prediction.recommendedServiceDate = predictedDate;
        await prediction.save();
      } else {
        prediction = await MaintenancePrediction.create({
          vehicleId: vehicle.vehicleId,
          component: comp.name,
          probability,
          predictedDays: predDays,
          healthScore: Math.max(0, Math.round(overallHealth)),
          severity,
          estimatedCost: cost,
          recommendedServiceDate: predictedDate
        });
      }
      
      predictions.push(prediction);
    }

    // Send alert for critical predictions
    const criticalPreds = predictions.filter(p => p.severity === "Critical" && p.probability > 80);
    for (const cp of criticalPreds) {
      sendUpdate({
        type: "maintenance_alert",
        message: `Vehicle ${vehicle.vehicleId} has ${cp.probability}% chance of ${cp.component} maintenance required within ${cp.predictedDays} days.`,
        vehicleId: vehicle.vehicleId,
        severity: "Critical",
        timestamp: new Date()
      });
    }

    return predictions;
  } catch (error) {
    console.error("AI Maintenance Analysis Error:", error.message);
    return [];
  }
}

// ===================== DRIVER SAFETY SCORE ENGINE =====================

async function analyzeDriverScore(vehicle) {
  try {
    const speed = vehicle.speed || 0;
    let score = 100;

    // Speed violations
    let speedViolations = 0;
    if (speed > 80) {
      score -= 15;
      speedViolations = 1;
    } else if (speed > 60) {
      score -= 5;
    }

    // Random event simulation
    const hardBrake = Math.random() < 0.3 ? 1 : 0;
    const rapidAccel = Math.random() < 0.2 ? 1 : 0;
    const routeDev = Math.random() < 0.1 ? 1 : 0;

    if (hardBrake) score -= 10;
    if (rapidAccel) score -= 8;
    if (routeDev) score -= 5;

    score = Math.max(0, Math.min(100, score));

    let rating = "Excellent";
    if (score < 60) rating = "Risky";
    else if (score < 80) rating = "Good";

    let driverScore = await DriverScore.findOne({ vehicleId: vehicle.vehicleId });

    if (driverScore) {
      driverScore.safetyScore = Math.round((driverScore.safetyScore + score) / 2);
      driverScore.speedViolations += speedViolations;
      driverScore.hardBraking += hardBrake;
      driverScore.rapidAcceleration += rapidAccel;
      driverScore.routeDeviations += routeDev;
      driverScore.totalTrips += 1;
      driverScore.rating = score < 60 ? "Risky" : score < 80 ? "Good" : "Excellent";
      driverScore.updatedAt = new Date();
      await driverScore.save();
    } else {
      driverScore = await DriverScore.create({
        vehicleId: vehicle.vehicleId,
        driver: vehicle.driver || "Unknown",
        safetyScore: score,
        rating,
        speedViolations,
        hardBraking: hardBrake,
        rapidAcceleration: rapidAccel,
        routeDeviations: routeDev,
        tripsCompleted: 1,
        totalTrips: 1
      });
    }

    // Alert for risky drivers
    if (rating === "Risky") {
      sendUpdate({
        type: "driver_risk_alert",
        message: `Vehicle ${vehicle.vehicleId} driver ${vehicle.driver} is rated RISKY (Score: ${Math.round(score)})`,
        vehicleId: vehicle.vehicleId,
        severity: "High",
        timestamp: new Date()
      });
    }

    return driverScore;
  } catch (error) {
    console.error("Driver Score Analysis Error:", error.message);
    return null;
  }
}

// ===================== FUEL FRAUD DETECTION =====================

async function detectFuelFraud(vehicle) {
  try {
    const currentFuel = vehicle.fuel || 100;
    const speed = vehicle.speed || 0;

    // Check for sudden fuel drops
    const records = await FuelRecord.find({ vehicleId: vehicle.vehicleId })
      .sort({ timestamp: -1 })
      .limit(5);

    let isFraud = false;
    let alertMessage = "";

    if (records.length > 1) {
      const prevFuel = records[0].fuelLevel;
      const drop = prevFuel - currentFuel;

      // Sudden drop detection
      if (drop > 30 && speed < 5) {
        isFraud = true;
        alertMessage = `Possible fuel theft detected in Vehicle ${vehicle.vehicleId}. Fuel dropped by ${Math.round(drop)}L while stationary.`;
      }

      // Abnormal consumption pattern
      const avgConsumption = records.reduce((a, r) => a + (r.fuelConsumed || 0), 0) / records.length;
      const currentConsumption = prevFuel - currentFuel;
      if (currentConsumption > avgConsumption * 2 && currentConsumption > 10) {
        isFraud = true;
        alertMessage = `Abnormal fuel consumption detected in Vehicle ${vehicle.vehicleId}. ${Math.round(currentConsumption)}L used in last interval.`;
      }
    }

    const record = await FuelRecord.create({
      vehicleId: vehicle.vehicleId,
      fuelLevel: currentFuel,
      fuelConsumed: records.length > 0 ? Math.max(0, records[0].fuelLevel - currentFuel) : 0,
      expectedConsumption: speed * 0.08,
      anomalyScore: isFraud ? 85 : Math.random() * 20,
      isFraud,
      alertMessage: alertMessage || null,
      location: vehicle.location ? { lat: vehicle.location.lat, lng: vehicle.location.lng } : undefined
    });

    if (isFraud && alertMessage) {
      sendUpdate({
        type: "fuel_fraud_alert",
        message: alertMessage,
        vehicleId: vehicle.vehicleId,
        severity: "Critical",
        timestamp: new Date()
      });
    }

    return record;
  } catch (error) {
    console.error("Fuel Fraud Detection Error:", error.message);
    return null;
  }
}

// ===================== SMART ROUTE OPTIMIZATION =====================

function optimizeRoute(currentLocation, destination, preferences = {}) {
  const { type = "shortest" } = preferences;
  
  const latDiff = destination.lat - currentLocation.lat;
  const lngDiff = destination.lng - currentLocation.lng;
  const directDistance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // km

  let optimizedDistance = directDistance;
  let fuelSaving = 0;
  let timeSaving = 0;

  switch (type) {
    case "shortest":
      optimizedDistance = directDistance * 0.9;
      fuelSaving = directDistance * 0.05 * 2; // fuel units
      timeSaving = Math.round(directDistance * 0.1 * 2); // minutes
      break;
    case "fuel_saving":
      optimizedDistance = directDistance * 0.85;
      fuelSaving = directDistance * 0.15 * 2;
      timeSaving = Math.round(directDistance * 0.05 * 2);
      break;
    case "traffic_aware":
      optimizedDistance = directDistance * 0.95;
      fuelSaving = directDistance * 0.08 * 2;
      timeSaving = Math.round(directDistance * 0.2 * 2);
      break;
    case "delivery_priority":
      optimizedDistance = directDistance * 0.88;
      fuelSaving = directDistance * 0.1 * 2;
      timeSaving = Math.round(directDistance * 0.25 * 2);
      break;
  }

  return {
    currentRoute: {
      distance: Math.round(directDistance * 10) / 10,
      fuelCost: Math.round(directDistance * 2 * 10) / 10,
      time: Math.round(directDistance * 2)
    },
    optimizedRoute: {
      distance: Math.round(optimizedDistance * 10) / 10,
      fuelCost: Math.round(optimizedDistance * 1.5 * 10) / 10,
      time: Math.round(optimizedDistance * 1.5)
    },
    savings: {
      distance: Math.round((directDistance - optimizedDistance) * 10) / 10,
      fuel: Math.round(fuelSaving * 10) / 10,
      time: timeSaving
    },
    routeType: type
  };
}

// ===================== AI REPORT GENERATOR =====================

async function generateDailyReport() {
  try {
    const vehicles = await Vehicle.find();
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter(v => v.status === "Active").length;
    const totalDistance = vehicles.reduce((a, v) => a + (v.distance || 0), 0);
    const avgFuel = vehicles.reduce((a, v) => a + (v.fuel || 0), 0) / (totalVehicles || 1);
    const avgSpeed = vehicles.reduce((a, v) => a + (v.speed || 0), 0) / (totalVehicles || 1);

    const predictions = await MaintenancePrediction.find({ status: "Pending" });
    const criticalMaintenance = predictions.filter(p => p.severity === "Critical").length;
    const highMaintenance = predictions.filter(p => p.severity === "High").length;

    const driverScores = await DriverScore.find();
    const riskyDrivers = driverScores.filter(d => d.rating === "Risky").length;

    // Previous day comparison simulation
    const prevAvgFuel = avgFuel + (Math.random() - 0.5) * 5;
    const fuelEfficiencyChange = avgFuel > 0 ? ((avgFuel - prevAvgFuel) / prevAvgFuel * 100).toFixed(1) : 0;

    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalVehicles,
        activeVehicles,
        totalDistance: Math.round(totalDistance),
        avgSpeed: Math.round(avgSpeed),
        avgFuel: Math.round(avgFuel)
      },
      fleetHealth: {
        overallScore: Math.max(0, Math.round(100 - criticalMaintenance * 15 - highMaintenance * 5)),
        vehiclesNeedingService: predictions.filter(p => p.severity !== "Low").length,
        criticalMaintenance,
        highMaintenance
      },
      drivers: {
        total: driverScores.length,
        riskyDrivers,
        excellentDrivers: driverScores.filter(d => d.rating === "Excellent").length
      },
      fuelAnalysis: {
        avgFuelLevel: Math.round(avgFuel),
        fuelEfficiencyChange: parseFloat(fuelEfficiencyChange),
        totalEstimatedFuelCost: Math.round(totalDistance * 1.5)
      },
      narrative: generateNarrative(totalVehicles, totalDistance, fuelEfficiencyChange, criticalMaintenance, riskyDrivers)
    };

    return report;
  } catch (error) {
    console.error("Report Generation Error:", error.message);
    return null;
  }
}

function generateNarrative(totalVehicles, totalDistance, fuelChange, criticalMaint, riskyDrivers) {
  let narrative = `Today ${totalVehicles} vehicles travelled ${Math.round(totalDistance)} km. `;
  
  if (fuelChange < 0) {
    narrative += `Fuel efficiency decreased by ${Math.abs(fuelChange)}%. `;
  } else {
    narrative += `Fuel efficiency improved by ${fuelChange}%. `;
  }
  
  if (criticalMaint > 0) {
    narrative += `${criticalMaint} vehicles require immediate maintenance. `;
  }
  
  if (riskyDrivers > 0) {
    narrative += `${riskyDrivers} drivers flagged as high risk. `;
  }

  narrative += `Overall fleet operational status is ${criticalMaint > 2 ? "critical" : criticalMaint > 0 ? "moderate" : "excellent"}.`;
  
  return narrative;
}

// ===================== FLEET ANALYTICS PREDICTION =====================

function predictFleetAnalytics(vehicles) {
  const totalDistance = vehicles.reduce((a, v) => a + (v.distance || 0), 0);
  const avgFuel = vehicles.reduce((a, v) => a + (v.fuel || 0), 0) / (vehicles.length || 1);
  
  // Predict next month costs
  const monthlyDistance = totalDistance || 10000;
  const predictedFuelCost = Math.round(monthlyDistance * 1.5 * 30);
  const predictedMaintenanceCost = Math.round(monthlyDistance * 0.3 * 30);
  const fleetEfficiency = Math.round((avgFuel / 100) * 100);

  return {
    predictions: {
      nextMonthFuelCost: predictedFuelCost,
      nextMonthMaintenanceCost: predictedMaintenanceCost,
      quarterlyFuelCost: predictedFuelCost * 3,
      quarterlyMaintenanceCost: predictedMaintenanceCost * 3,
      fleetEfficiency,
      projectedCostPerKm: Math.round((predictedFuelCost + predictedMaintenanceCost) / (monthlyDistance || 1) * 100) / 100
    },
    trends: {
      fuelTrend: avgFuel > 50 ? "decreasing" : "increasing",
      maintenanceTrend: avgFuel < 40 ? "increasing" : "stable",
      efficiencyScore: fleetEfficiency
    }
  };
}

module.exports = {
  analyzeMaintenanceNeeds,
  analyzeDriverScore,
  detectFuelFraud,
  optimizeRoute,
  generateDailyReport,
  predictFleetAnalytics
};