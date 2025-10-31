const express = require('express');
const {
  Client,
  PrivateKey,
  AccountId,
  ContractExecuteTransaction,
  ContractCallQuery,
  ContractFunctionParameters,
  TopicMessageSubmitTransaction,
  TopicId
} = require('@hashgraph/sdk');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(require('cors')());

const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
const contractId = process.env.CONTRACT_ID;
const topicId = TopicId.fromString(process.env.TOPIC_ID);

const client = Client.forTestnet();
client.setOperator(operatorId, operatorKey);

// Create data hash
function createDataHash(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    contract: contractId,
    topic: topicId.toString(),
    message: 'Hedera Air Quality DePIN API - 4 Parameter Contract'
  });
});

// Submit a reading - FIXED FOR 4 PARAMETER CONTRACT
app.post('/api/readings/submit', async (req, res) => {
  try {
    const { 
      ownerAccountId, 
      ownerPrivateKey, 
      sensorId, 
      co2Level, 
      pm25,
      pm10,
      extraData 
    } = req.body;

    // Extract all sensor data
    const temperature = extraData?.temperature || 0;
    const humidity = extraData?.humidity || 0;
    const tvoc = extraData?.tvoc || 0;
    const aqi = extraData?.aqi || 0;
    const pm10Value = pm10 || extraData?.pm10 || 0;

    console.log('\n📊 Received Reading:');
    console.log(`  Sensor ID: ${sensorId}`);
    console.log(`  CO2: ${co2Level} ppm`);
    console.log(`  PM2.5: ${pm25} µg/m³`);
    console.log(`  PM10: ${pm10Value} µg/m³`);
    console.log(`  Temperature: ${temperature} °C`);
    console.log(`  Humidity: ${humidity} %`);
    console.log(`  TVOC: ${tvoc} ppb`);
    console.log(`  AQI: ${aqi}`);

    // Create data hash (includes all data for verification)
    const readingData = { 
      sensorId, 
      co2Level, 
      pm25, 
      pm10: pm10Value, 
      temperature, 
      humidity, 
      timestamp: Date.now() 
    };
    const dataHash = '0x' + createDataHash(readingData);

    // Prepare topic message with ALL data (temp & humidity included!)
    const topicData = {
      sensorId,
      co2Level,
      pm25,
      pm10: pm10Value,
      temperature,      // ← In topic!
      humidity,         // ← In topic!
      tvoc,
      aqi,
      timestamp: Date.now()
    };

    // 1. Submit to HCS Topic (with ALL data)
    console.log('\n📤 Publishing to HCS Topic...');
    const topicMessage = JSON.stringify(topicData);
    const topicTx = new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(topicMessage);
    
    const topicResponse = await topicTx.execute(client);
    const topicReceipt = await topicResponse.getReceipt(client);
    console.log('✓ Topic submission successful');

    // 2. Submit to Smart Contract (4 parameters only!)
    console.log('📝 Submitting to smart contract (4 parameters)...');
    
    const ownerClient = Client.forTestnet();
    ownerClient.setOperator(
      AccountId.fromString(ownerAccountId),
      PrivateKey.fromString(ownerPrivateKey)
    );

    // YOUR DEPLOYED CONTRACT EXPECTS ONLY 4 PARAMETERS:
    // submitReading(uint256 sensorId, uint256 co2Level, uint256 pm25, bytes32 dataHash)
    const contractTx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(1000000)
      .setFunction(
        'submitReading',
        new ContractFunctionParameters()
          .addUint256(sensorId)                                   // 1. sensorId
          .addUint256(co2Level)                                   // 2. co2Level
          .addUint256(Math.round(pm25))                           // 3. pm25
          .addBytes32(Buffer.from(dataHash.slice(2), 'hex'))      // 4. dataHash
      );
    
    const contractResponse = await contractTx.execute(ownerClient);
    const contractReceipt = await contractResponse.getReceipt(ownerClient);
    
    console.log('✓ Contract submission successful!');
    console.log(`✓ Transaction ID: ${contractResponse.transactionId}`);

    ownerClient.close();

    res.json({
      success: true,
      transactionId: contractResponse.transactionId.toString(),
      contractReceipt: contractReceipt.status.toString(),
      topicReceipt: 'SUCCESS',
      dataHash,
      explorer: `https://hashscan.io/testnet/transaction/${contractResponse.transactionId}`,
      topicExplorer: `https://hashscan.io/testnet/topic/${topicId}`,
      data: {
        sensorId,
        co2Level,
        pm25,
        temperature,
        humidity,
        note: 'Temperature & humidity are in the topic, not in contract storage'
      }
    });

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    res.status(500).json({ 
      success: false, 
      error: error.message,
      hint: error.message.includes('CONTRACT_REVERT') 
        ? 'Check sensor registration or contract parameters'
        : 'Check your account credentials.'
    });
  }
});

// Register a sensor
app.post('/api/sensors/register', async (req, res) => {
  try {
    const { ownerAccountId, ownerPrivateKey, location } = req.body;
    
    console.log(`\n🔧 Registering new sensor...`);
    
    const ownerClient = Client.forTestnet();
    ownerClient.setOperator(
      AccountId.fromString(ownerAccountId),
      PrivateKey.fromString(ownerPrivateKey)
    );
    
    const transaction = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(1000000)
      .setFunction(
        'registerSensor',
        new ContractFunctionParameters()
          .addString(location || 'Unknown Location')
      );
    
    const txResponse = await transaction.execute(ownerClient);
    const receipt = await txResponse.getReceipt(ownerClient);
    
    console.log('✓ Sensor registered successfully');
    
    ownerClient.close();
    
    res.json({
      success: true,
      transactionId: txResponse.transactionId.toString(),
      receipt: receipt.status.toString(),
      message: 'Sensor registered successfully'
    });
  } catch (error) {
    console.error('❌ Registration Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get sensor info
app.get('/api/sensors/:sensorId', async (req, res) => {
  try {
    const { sensorId } = req.params;
    
    const query = new ContractCallQuery()
      .setContractId(contractId)
      .setGas(100000)
      .setFunction(
        'getSensor',
        new ContractFunctionParameters().addUint256(parseInt(sensorId))
      );
    
    const result = await query.execute(client);
    
    res.json({
      success: true,
      sensorId,
      data: result
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║   Hedera DePIN Backend Running           ║');
  console.log('║   4-Parameter Contract (Minimal)         ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log(`Port: ${PORT}`);
  console.log(`Contract: ${contractId}`);
  console.log(`Topic: ${topicId}`);
  console.log('\n📊 Contract stores (4 params):');
  console.log('  1. Sensor ID');
  console.log('  2. CO2 Level');
  console.log('  3. PM2.5');
  console.log('  4. Data Hash');
  console.log('\n📡 Topic includes (full data):');
  console.log('  • All contract data PLUS');
  console.log('  • Temperature ✓');
  console.log('  • Humidity ✓');
  console.log('  • PM10, TVOC, AQI');
  console.log('═══════════════════════════════════════════\n');
  console.log('💡 Ready to receive sensor data...\n');
});