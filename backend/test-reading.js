const axios = require('axios');
const fs = require('fs');

async function submitReading() {
  const sensorAccount = JSON.parse(fs.readFileSync('sensor-account.json', 'utf8'));
  
  try {
    console.log("📊 Submitting reading...\n");
    
    const response = await axios.post('http://localhost:3000/api/readings/submit', {
      ownerAccountId: sensorAccount.accountId,
      ownerPrivateKey: sensorAccount.privateKey,
      sensorId: 1,
      co2Level: 450,
      pm25: 12
    });
    
    console.log("✅ Reading submitted!");
    console.log(response.data);
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

submitReading(); 