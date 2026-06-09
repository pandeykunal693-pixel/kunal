const express = require('express');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(express.json());

// 1. Mock Database / Static Emission Factors
const EMISSION_FACTORS = {
  transport: { medium_gasoline_car: 0.192, electric_vehicle: 0.053, public_bus: 0.102 },
  energy: { electricity_grid: 0.380, natural_gas: 0.185 },
  diet: { vegan_meal: 0.7, meat_heavy_meal: 3.3 }
};

// Simulated Database State
let mockUserDashboard = {
  userId: "64a7c8e1f1d2b34567890abc",
  targetMonthlyKg: 400.0,
  breakdown: { transport: 12.5, energy: 8.2, diet: 4.5 }
};

// 2. Calculation Helper
function calculateFootprint(category, subCategory, amount) {
  const factor = EMISSION_FACTORS[category]?.[subCategory];
  if (!factor) return null;
  return parseFloat((amount * factor).toFixed(2));
}

// 3. Dynamic Insights Engine
function getPersonalizedTip(category, calculatedValue) {
  if (category === 'transport' && calculatedValue > 4) {
    return "This single trip generated a heavy footprint. Swapping this for public transit would save roughly 50% of these emissions.";
  }
  if (category === 'diet' && calculatedValue > 3) {
    return "Meat-heavy meals impact your profile significantly. Substituting one red meat meal with a plant-based option cuts diet emissions by ~78%.";
  }
  return "Great job keeping this entry low! Consistency is key to meeting your targets.";
}

// 4. Activity Logging Endpoint
app.post('/api/v1/activities', [
  body('category').isIn(['transport', 'energy', 'diet']).withMessage('Invalid category'),
  body('subCategory').isString().notEmpty().withMessage('Subcategory is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  body('timestamp').isISO8601().withMessage('Valid ISO 8601 timestamp required')
], (req, res) => {
  
  // Handle Validation Edge Cases
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { category, subCategory, amount, timestamp } = req.body;

  // Process Calculation
  const calculatedEmissionsKg = calculateFootprint(category, subCategory, amount);
  if (calculatedEmissionsKg === null) {
    return res.status(422).json({ 
      success: false, 
      error: `Unsupported subcategory parsing connection for ${category} -> ${subCategory}` 
    });
  }

  // Simulate Atomic DB Aggregation Update ($inc)
  mockUserDashboard.breakdown[category] = parseFloat(
    (mockUserDashboard.breakdown[category] + calculatedEmissionsKg).toFixed(2)
  );

  const totalEmissions = Object.values(mockUserDashboard.breakdown).reduce((a, b) => a + b, 0);
  const targetProgressPercentage = parseFloat(((totalEmissions / mockUserDashboard.targetMonthlyKg) * 100).toFixed(1));

  // Generate Personalized Output Response
  res.status(201).json({
    success: true,
    meta: {
      processedAt: new Date().toISOString(),
      clientTimestampReceived: timestamp // Preserves timezone metadata context
    },
    data: {
      activityId: Math.random().toString(36).substr(2, 9),
      category,
      subCategory,
      calculatedEmissionsKg,
      insight: getPersonalizedTip(category, calculatedEmissionsKg)
    },
    updatedMetrics: {
      totalMonthlyEmissionsKg: parseFloat(totalEmissions.toFixed(2)),
      targetMonthlyKg: mockUserDashboard.targetMonthlyKg,
      targetProgressPercentage,
      breakdown: mockUserDashboard.breakdown
    }
  });
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`Carbon Tracker Engine running on port ${PORT}`));