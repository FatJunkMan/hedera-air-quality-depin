const axios = require('axios');
const fs = require('fs');

async function registerSensor() {
  const sensorAccount = JSON.parse(fs.readFileSync('sensor-account.json', 'utf8'));
  
  try {
    console.log("📝 Registering sensor...\n");
    
    const response = await axios.post('http://localhost:3000/api/sensors/register', {
      ownerAccountId: sensorAccount.accountId,
      ownerPrivateKey: sensorAccount.privateKey,
      location: "Test City, Test Country"
    });
    
    console.log("✅ Sensor registered!");
    console.log(response.data);
    console.log("\n🎉 Your sensor ID is: 1");
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

registerSensor();