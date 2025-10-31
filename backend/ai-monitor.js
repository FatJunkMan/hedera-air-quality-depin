// AI-Powered Email Alert System
// Monitors air quality and sends intelligent alerts

const express = require('express');
const nodemailer = require('nodemailer');
const {
  Client,
  PrivateKey,
  AccountId,
  ContractCallQuery,
  ContractFunctionParameters
} = require('@hashgraph/sdk');
require('dotenv').config();

const app = express();
app.use(express.json());

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

// Hedera client
const client = Client.forTestnet();
client.setOperator(
  AccountId.fromString(process.env.OPERATOR_ID),
  PrivateKey.fromString(process.env.OPERATOR_KEY)
);

const contractId = process.env.CONTRACT_ID;

// Alert thresholds
const THRESHOLDS = {
  co2: {
    warning: 1000,    // ppm
    critical: 2000
  },
  pm25: {
    warning: 35,      // µg/m³
    critical: 55
  },
  pm10: {
    warning: 154,     // µg/m³
    critical: 254
  },
  temperature: {
    low: 15,          // °C
    high: 30
  },
  humidity: {
    low: 30,          // %
    high: 70
  }
};

// Alert history to prevent spam
const alertHistory = new Map();
const ALERT_COOLDOWN = 3600000; // 1 hour

// AI Analysis Function
function analyzeAirQuality(reading) {
  const issues = [];
  const recommendations = [];
  let severity = 'good';
  
  // CO2 Analysis
  if (reading.co2 > THRESHOLDS.co2.critical) {
    issues.push(`❌ CRITICAL: CO2 at ${reading.co2} ppm (very high!)`);
    recommendations.push('🔴 Open windows immediately and increase ventilation');
    severity = 'critical';
  } else if (reading.co2 > THRESHOLDS.co2.warning) {
    issues.push(`⚠️ WARNING: CO2 at ${reading.co2} ppm (elevated)`);
    recommendations.push('🟡 Improve room ventilation');
    if (severity === 'good') severity = 'warning';
  }
  
  // PM2.5 Analysis
  if (reading.pm25 > THRESHOLDS.pm25.critical) {
    issues.push(`❌ CRITICAL: PM2.5 at ${reading.pm25} µg/m³ (unhealthy)`);
    recommendations.push('🔴 Use air purifier, avoid outdoor activities');
    severity = 'critical';
  } else if (reading.pm25 > THRESHOLDS.pm25.warning) {
    issues.push(`⚠️ WARNING: PM2.5 at ${reading.pm25} µg/m³ (moderate pollution)`);
    recommendations.push('🟡 Consider using air purifier');
    if (severity === 'good') severity = 'warning';
  }
  
  // PM10 Analysis
  if (reading.pm10 > THRESHOLDS.pm10.critical) {
    issues.push(`❌ CRITICAL: PM10 at ${reading.pm10} µg/m³`);
    recommendations.push('🔴 Dust levels high - clean environment');
    severity = 'critical';
  } else if (reading.pm10 > THRESHOLDS.pm10.warning) {
    issues.push(`⚠️ WARNING: PM10 at ${reading.pm10} µg/m³`);
    recommendations.push('🟡 Consider cleaning or dusting');
    if (severity === 'good') severity = 'warning';
  }
  
  // Temperature Analysis
  if (reading.temperature < THRESHOLDS.temperature.low) {
    issues.push(`❄️ Low temperature: ${reading.temperature}°C`);
    recommendations.push('🔵 Room is too cold - adjust heating');
    if (severity === 'good') severity = 'warning';
  } else if (reading.temperature > THRESHOLDS.temperature.high) {
    issues.push(`🔥 High temperature: ${reading.temperature}°C`);
    recommendations.push('🔴 Room is too hot - improve cooling');
    if (severity === 'good') severity = 'warning';
  }
  
  // Humidity Analysis
  if (reading.humidity < THRESHOLDS.humidity.low) {
    issues.push(`💧 Low humidity: ${reading.humidity}%`);
    recommendations.push('💧 Air is too dry - consider humidifier');
    if (severity === 'good') severity = 'warning';
  } else if (reading.humidity > THRESHOLDS.humidity.high) {
    issues.push(`💦 High humidity: ${reading.humidity}%`);
    recommendations.push('🌫️ High moisture - use dehumidifier, check ventilation');
    if (severity === 'good') severity = 'warning';
  }
  
  // Combined Analysis (AI Intelligence)
  if (reading.co2 > 800 && reading.pm25 > 25) {
    recommendations.push('🧠 AI Insight: Both CO2 and particles elevated - likely poor ventilation');
  }
  
  if (reading.temperature > 25 && reading.humidity > 60) {
    recommendations.push('🧠 AI Insight: Hot and humid conditions - ideal for mold growth');
  }
  
  if (reading.co2 < 500 && reading.pm25 < 10) {
    recommendations.push('✅ Excellent air quality - no action needed');
  }
  
  return {
    severity,
    issues,
    recommendations,
    timestamp: new Date().toISOString()
  };
}

// Send Email Alert
async function sendEmailAlert(sensorId, reading, analysis) {
  const alertKey = `${sensorId}-${analysis.severity}`;
  const lastAlert = alertHistory.get(alertKey);
  
  // Check cooldown
  if (lastAlert && Date.now() - lastAlert < ALERT_COOLDOWN) {
    console.log(`Alert cooldown active for sensor ${sensorId}`);
    return;
  }
  
  const severityEmoji = {
    good: '✅',
    warning: '⚠️',
    critical: '🚨'
  };
  
  const severityColor = {
    good: '#28a745',
    warning: '#ffc107',
    critical: '#dc3545'
  };
  
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { 
          background: ${severityColor[analysis.severity]}; 
          color: white; 
          padding: 20px; 
          border-radius: 5px; 
          text-align: center;
        }
        .content { background: #f9f9f9; padding: 20px; margin-top: 20px; border-radius: 5px; }
        .reading { 
          background: white; 
          padding: 15px; 
          margin: 10px 0; 
          border-left: 4px solid ${severityColor[analysis.severity]};
        }
        .issue { color: #dc3545; margin: 10px 0; }
        .recommendation { 
          background: #e7f3ff; 
          padding: 10px; 
          margin: 10px 0; 
          border-radius: 5px;
          border-left: 3px solid #0066cc;
        }
        .footer { margin-top: 20px; padding: 20px; text-align: center; color: #666; }
        .metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .metric { 
          background: white; 
          padding: 10px; 
          border-radius: 5px;
          text-align: center;
        }
        .metric-value { font-size: 24px; font-weight: bold; color: ${severityColor[analysis.severity]}; }
        .metric-label { font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${severityEmoji[analysis.severity]} Air Quality Alert</h1>
          <h2>${analysis.severity.toUpperCase()}</h2>
          <p>Sensor ID: ${sensorId}</p>
        </div>
        
        <div class="content">
          <h3>📊 Current Readings</h3>
          <div class="metrics">
            <div class="metric">
              <div class="metric-value">${reading.co2}</div>
              <div class="metric-label">CO2 (ppm)</div>
            </div>
            <div class="metric">
              <div class="metric-value">${reading.pm25.toFixed(1)}</div>
              <div class="metric-label">PM2.5 (µg/m³)</div>
            </div>
            <div class="metric">
              <div class="metric-value">${reading.temperature.toFixed(1)}°C</div>
              <div class="metric-label">Temperature</div>
            </div>
            <div class="metric">
              <div class="metric-value">${reading.humidity.toFixed(1)}%</div>
              <div class="metric-label">Humidity</div>
            </div>
          </div>
          
          ${analysis.issues.length > 0 ? `
            <h3>⚠️ Issues Detected</h3>
            ${analysis.issues.map(issue => `<div class="issue">${issue}</div>`).join('')}
          ` : ''}
          
          <h3>💡 AI Recommendations</h3>
          ${analysis.recommendations.map(rec => `
            <div class="recommendation">${rec}</div>
          `).join('')}
          
          <div class="reading">
            <p><strong>🕐 Time:</strong> ${new Date(analysis.timestamp).toLocaleString()}</p>
            <p><strong>🔗 View on Blockchain:</strong> 
              <a href="https://hashscan.io/testnet/contract/${contractId}">View Contract</a>
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p>🌍 Hedera Air Quality DePIN Network</p>
          <p>Powered by blockchain technology</p>
          <p style="font-size: 12px; color: #999;">
            You're receiving this because air quality thresholds were exceeded.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ALERT_EMAIL,
    subject: `${severityEmoji[analysis.severity]} Air Quality ${analysis.severity.toUpperCase()} - Sensor ${sensorId}`,
    html: emailHtml
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✓ Alert email sent for sensor ${sensorId}`);
    alertHistory.set(alertKey, Date.now());
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Monitor readings endpoint
app.post('/api/monitor/reading', async (req, res) => {
  try {
    const { sensorId, reading } = req.body;
    
    // AI Analysis
    const analysis = analyzeAirQuality(reading);
    
    console.log(`📊 Analysis for Sensor ${sensorId}:`, analysis.severity);
    
    // Send alert if needed
    if (analysis.severity !== 'good') {
      await sendEmailAlert(sensorId, reading, analysis);
    }
    
    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Error monitoring reading:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get latest reading from contract
async function getLatestReading(sensorId) {
  try {
    const query = new ContractCallQuery()
      .setContractId(contractId)
      .setGas(50000)
      .setFunction(
        'getSensor',
        new ContractFunctionParameters().addUint256(sensorId)
      );
    
    const result = await query.execute(client);
    
    return {
      totalReadings: result.getUint256(5).toNumber()
    };
  } catch (error) {
    console.error('Error querying contract:', error);
    return null;
  }
}

// Manual check endpoint
app.get('/api/monitor/check/:sensorId', async (req, res) => {
  try {
    const { sensorId } = req.params;
    const sensorInfo = await getLatestReading(parseInt(sensorId));
    
    res.json({
      success: true,
      sensorInfo,
      alertHistory: Array.from(alertHistory.entries())
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test email endpoint
app.post('/api/monitor/test-email', async (req, res) => {
  try {
    const testReading = {
      co2: 1500,
      pm25: 45,
      pm10: 80,
      temperature: 28,
      humidity: 65
    };
    
    const analysis = analyzeAirQuality(testReading);
    await sendEmailAlert(999, testReading, analysis);
    
    res.json({ success: true, message: 'Test email sent!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

//ADDED: Test alert endpoint for curl command
app.post('/api/test-alert', async (req, res) => {
  try {
    console.log('\n🧪 TEST ALERT TRIGGERED');
    
    const testReading = {
      co2: req.body.co2Level || 2000,
      pm25: req.body.pm25 || 150,
      pm10: req.body.pm10 || 180,
      temperature: req.body.temperature || 25,
      humidity: req.body.humidity || 60
    };
    
    console.log('Test reading:', testReading);
    
    const analysis = analyzeAirQuality(testReading);
    console.log('Analysis:', analysis);
    
    await sendEmailAlert(999, testReading, analysis);
    
    res.json({
      success: true,
      message: 'Test alert processed and email sent!',
      analysis
    });
  } catch (error) {
    console.error('❌ Test alert error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.MONITOR_PORT || 3001;

app.listen(PORT, () => {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║   AI Air Quality Monitor Running         ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log(`Port: ${PORT}`);
  console.log(`Email: ${process.env.ALERT_EMAIL}`);
  console.log('\n📊 Monitoring air quality...');
  console.log('📧 Email alerts enabled');
  console.log(`\n🧪 Test with: curl -X POST http://localhost:${PORT}/api/test-alert\n`);
});