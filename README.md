# 🌍 Hedera Air Quality DePIN Network

A decentralized physical infrastructure network (DePIN) for real-time air quality monitoring built on Hedera blockchain, featuring ESP32 sensors, smart contracts, and AI-powered email alerts.

![Hedera](https://img.shields.io/badge/Hedera-Testnet-blue)
![Solidity](https://img.shields.io/badge/Solidity-0.8.20-green)
![ESP32](https://img.shields.io/badge/ESP32-IoT-red)
![Node.js](https://img.shields.io/badge/Node.js-Backend-brightgreen)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Hardware Requirements](#hardware-requirements)
- [Software Requirements](#software-requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Smart Contract](#smart-contract)
- [API Endpoints](#api-endpoints)
- [Email Alerts](#email-alerts)
- [Deployment](#deployment)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

This project creates a decentralized air quality monitoring network where:
- **ESP32 microcontrollers** equipped with environmental sensors collect real-time data
- Data is submitted to **Hedera blockchain** for immutable storage and verification
- **Smart contracts** manage sensor registration and data validation
- **HCS (Hedera Consensus Service)** streams real-time data
- **AI-powered monitoring** analyzes air quality and sends intelligent email alerts

### Live Deployment
- **Smart Contract**: `0.0.7092903` ([View on HashScan](https://hashscan.io/testnet/contract/0.0.7092903))
- **HCS Topic**: `0.0.7093266` ([View Messages](https://hashscan.io/testnet/topic/0.0.7093266))
- **Network**: Hedera Testnet

## ✨ Features

### Blockchain Integration
- ✅ Immutable data storage on Hedera blockchain
- ✅ Sensor ownership verification via smart contracts
- ✅ Real-time data streaming with Hedera Consensus Service (HCS)
- ✅ Transparent and auditable air quality data

### IoT Sensing
- ✅ Multi-sensor support (ENS160, AHT21, DSM501A)
- ✅ Measures CO2, PM2.5, PM10, TVOC, temperature, humidity, AQI
- ✅ Automatic readings every 5 minutes
- ✅ WiFi connectivity for data transmission

### AI Monitoring
- ✅ Intelligent air quality analysis
- ✅ Multi-metric threshold detection
- ✅ Contextual health recommendations
- ✅ Automated email alerts with HTML formatting
- ✅ Alert cooldown to prevent spam (1 hour)

### Developer Features
- ✅ REST API for sensor management
- ✅ Contract deployment automation
- ✅ Comprehensive testing scripts
- ✅ Easy configuration via environment variables

## 🏗️ Architecture

```
┌─────────────────┐
│   ESP32 Sensor  │
│   + ENS160      │
│   + AHT21       │
│   + DSM501A     │
└────────┬────────┘
         │ WiFi
         ▼
┌─────────────────┐
│  Backend API    │
│  (Node.js)      │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌──────────────┐
│ Smart   │ │ HCS Topic    │
│ Contract│ │ (Messages)   │
└─────────┘ └──────────────┘
    │              │
    └──────┬───────┘
           ▼
    ┌──────────────┐
    │   Hedera     │
    │  Blockchain  │
    └──────────────┘
           │
           ▼
    ┌──────────────┐
    │ AI Monitor   │
    │ + Email      │
    │   Alerts     │
    └──────────────┘
```

## 🔧 Hardware Requirements

### Required Components
- **ESP32 Development Board** (38-pin version)
- **ENS160 Digital Air Quality Sensor**
  - Measures: CO2, TVOC, eCO2, AQI
  - Interface: I2C (0x53)
  - Voltage: 3.3V
- **AHT21 Temperature & Humidity Sensor**
  - Measures: Temperature, Relative Humidity
  - Interface: I2C (0x38)
  - Voltage: 3.3V
- **DSM501A Particulate Matter Sensor** (Optional)
  - Measures: PM2.5, PM10
  - Interface: Digital Output
  - Voltage: 5V
- **Breadboard and Jumper Wires**
- **USB Cable** for ESP32 programming

### Wiring Diagram

```
ESP32          ENS160/AHT21       DSM501A
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3.3V    ────→  VCC
GND     ────→  GND                GND
D21     ────→  SDA
D22     ────→  SCL
D25     ───────────────────────→  PM2.5
D26     ───────────────────────→  PM10
VIN     ───────────────────────→  VCC (5V)
```

## 💻 Software Requirements

### Development Environment
- **Node.js** v16 or higher
- **Arduino IDE** 2.0+ or PlatformIO
- **Git** for version control

### Required Libraries

#### Arduino/ESP32
```cpp
- WiFi (built-in)
- HTTPClient (built-in)
- ArduinoJson (6.21.0+)
- ScioSense_ENS160 (1.0.0+)
- Adafruit_AHTX0 (2.0.0+)
```

#### Node.js Backend
```json
{
  "@hashgraph/sdk": "^2.75.0",
  "express": "^5.1.0",
  "dotenv": "^17.2.3",
  "axios": "^1.12.2",
  "cors": "^2.8.5",
  "nodemailer": "^6.9.0"
}
```

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/hedera-air-quality-depin.git
cd hedera-air-quality-depin
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
# Hedera Configuration
OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
OPERATOR_KEY=302e020100300506032b657004220420...
CONTRACT_ID=0.0.YOUR_CONTRACT_ID
TOPIC_ID=0.0.YOUR_TOPIC_ID
PORT=3000

# Email Alerts
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-specific-password
ALERT_EMAIL=recipient@example.com
MONITOR_PORT=3001
```

### 3. Smart Contract Deployment

```bash
cd contracts
npm install
```

Create `.env` file:
```env
OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
OPERATOR_KEY=302e020100300506032b657004220420...
```

Deploy contract:
```bash
node simple-deploy.js
```

### 4. ESP32 Setup

1. Install Arduino IDE
2. Install ESP32 board support
3. Install required libraries (see Software Requirements)
4. Open `esp32/sensor_client.ino`
5. Configure WiFi and Hedera credentials
6. Upload to ESP32

## ⚙️ Configuration

### Hedera Account Setup

1. Create a Hedera testnet account at [portal.hedera.com](https://portal.hedera.com)
2. Save your Account ID and Private Key
3. Fund account with test HBAR from faucet

### Email Configuration (Gmail)

1. Enable 2-Factor Authentication
2. Generate App Password:
   - Google Account → Security → 2-Step Verification → App passwords
3. Use App Password in `.env` as `EMAIL_APP_PASSWORD`

### Sensor Registration

Register your sensor before first use:

```bash
cd backend
node test-register.js
```

This returns a Sensor ID (typically `1` for first sensor).

## 🚀 Usage

### Start the Backend Server

```bash
cd backend
node server.js
```

Server runs on `http://localhost:3000`

### Start AI Monitoring (Optional)

```bash
cd backend
node ai-monitor.js
```

Monitor runs on `http://localhost:3001`

### ESP32 Operation

Once programmed, the ESP32:
1. Connects to WiFi (2.4 GHZ)
2. Initializes sensors
3. Takes readings every 5 minutes
4. Submits data to backend API
5. Backend stores in blockchain and HCS topic

### View Your Data

**Smart Contract Data:**
- Visit: https://hashscan.io/testnet/contract/0.0.7092903
- Click "Contract Calls" to see submissions

**Topic Messages:**
- Visit: https://hashscan.io/testnet/topic/0.0.7093266
- View real-time messages with full sensor data

## 📜 Smart Contract

### Contract Overview

**File:** `contracts/AirQualityDePIN.sol`

**Key Functions:**

```solidity
// Register a new sensor
function registerSensor(string memory location) external returns (uint256)

// Submit air quality reading
function submitReading(
    uint256 sensorId,
    uint256 co2Level,
    uint256 pm25,
    bytes32 dataHash
) external returns (uint256)

// Verify reading (admin only)
function verifyReading(uint256 readingId) external

// Query sensor information
function getSensor(uint256 sensorId) external view returns (
    address sensorOwner,
    string memory location,
    bool isActive,
    uint256 totalReadings
)

// Query reading data
function getReading(uint256 readingId) external view returns (
    uint256 sensorId,
    uint256 timestamp,
    uint256 co2Level,
    uint256 pm25,
    bool verified
)
```

### Data Structures

```solidity
struct Sensor {
    address owner;
    string location;
    bool isActive;
    uint256 totalReadings;
}

struct Reading {
    uint256 sensorId;
    uint256 timestamp;
    uint256 co2Level;
    uint256 pm25;
    bytes32 dataHash;
    bool verified;
}
```

## 🔌 API Endpoints

### Backend Server (Port 3000)

#### Register Sensor
```http
POST /api/sensors/register
Content-Type: application/json

{
  "ownerAccountId": "0.0.7093383",
  "ownerPrivateKey": "302e...",
  "location": "Living Room"
}
```

#### Submit Reading
```http
POST /api/readings/submit
Content-Type: application/json

{
  "ownerAccountId": "0.0.xxxxxxx",
  "ownerPrivateKey": "302e...",
  "sensorId": 1,
  "co2Level": 450,
  "pm25": 12,
  "extraData": {
    "temperature": 22.5,
    "humidity": 55.0,
    "tvoc": 150,
    "aqi": 2,
    "pm10": 18
  }
}
```

#### Get Sensor Info
```http
GET /api/sensors/:sensorId
```

### AI Monitor (Port 3001)

#### Test Email Alert
```http
POST /api/test-alert
Content-Type: application/json

{
  "co2Level": 2000,
  "pm25": 150,
  "temperature": 25,
  "humidity": 60
}
```

#### Check Monitor Status
```http
GET /api/monitor/check/:sensorId
```

## 📧 Email Alerts

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| CO2 | 1000 ppm | 2000 ppm |
| PM2.5 | 35 µg/m³ | 55 µg/m³ |
| PM10 | 154 µg/m³ | 254 µg/m³ |
| Temperature | <15°C or >30°C | N/A |
| Humidity | <30% or >70% | N/A |

### Alert Features

- **HTML Formatted Emails** with color-coded severity
- **AI Analysis** of air quality conditions
- **Personalized Recommendations** based on readings
- **Spam Prevention** (1-hour cooldown per severity level)
- **Multi-Metric Detection** (identifies combined issues)

### Testing Alerts

```bash
curl -X POST http://localhost:3001/api/test-alert \
  -H "Content-Type: application/json" \
  -d '{"co2Level":2000,"pm25":150}'
```

## 🚀 Deployment

### Deploy to Hedera Mainnet

1. Update `.env` files:
```env
# Change testnet to mainnet
HEDERA_NETWORK=mainnet
```

2. Get mainnet HBAR from exchange

3. Deploy contract:
```bash
cd contracts
node simple-deploy.js
```

4. Update `CONTRACT_ID` and `TOPIC_ID` in backend `.env`

### Production Considerations

- Use environment variables for all secrets
- Implement rate limiting on API endpoints
- Add authentication for sensor registration
- Set up monitoring and logging (PM2, Winston)
- Use HTTPS for backend API
- Implement data backup strategies

## 🧪 Testing

### Test Scripts

**Register Sensor:**
```bash
cd backend
node test-register.js
```

**Submit Test Reading:**
```bash
node test-reading.js
```

**Send Fake Data (10 readings):**
```bash
node send-fake-data.js
```

**Test Email Alerts:**
```bash
curl -X POST http://localhost:3001/api/test-alert \
  -H "Content-Type: application/json" \
  -d '{"co2Level":2000,"pm25":150}'
```

### Expected Results

✅ Sensor registration returns transaction ID  
✅ Reading submission returns SUCCESS status  
✅ Data appears on HashScan explorer  
✅ Email alerts trigger for dangerous conditions  
✅ ESP32 Serial Monitor shows successful submissions

## 🔍 Troubleshooting

### Common Issues

**ESP32 won't connect to WiFi:**
- Check SSID and password
- Ensure 2.4GHz network (ESP32 doesn't support 5GHz)
- Verify signal strength
- When deploying in the testnet you may need to turn off FIREWALL protection

**CONTRACT_REVERT_EXECUTED error:**
- Sensor not registered → Run `test-register.js`
- Wrong account credentials → Verify account ID matches sensor owner
- Insufficient gas → Increase gas limit in contract call

**Email alerts not working:**
- Verify Gmail App Password is correct
- Check `EMAIL_USER` and `EMAIL_APP_PASSWORD` in `.env`
- Ensure 2FA is enabled on Gmail account
- Check spam folder

**Sensors reading zero:**
- ENS160 requires 24-48 hour warm-up period
- Check I2C connections (SDA/SCL)
- Verify 3.3V power supply
- Run I2C scanner to detect sensors

**Backend connection refused:**
- Verify server is running on correct port
- Check firewall settings
- Ensure ESP32 and computer on same network

### Debug Commands

**Check sensor I2C addresses:**
```cpp
// Add to Arduino setup()
Wire.beginTransmission(0x53); // ENS160
if (Wire.endTransmission() == 0) {
  Serial.println("ENS160 found!");
}
```

**Test backend connectivity:**
```bash
curl http://localhost:3000/
```

**View contract on HashScan:**
```
https://hashscan.io/testnet/contract/0.0.7092903
```

## 📊 Data Format

### HCS Topic Message Format

```json
{
  "sensorId": 1,
  "co2Level": 450,
  "pm25": 12,
  "pm10": 18,
  "temperature": 22.5,
  "humidity": 55.0,
  "tvoc": 150,
  "aqi": 2,
  "timestamp": 1761898051522
}
```

### Smart Contract Storage

- **Sensor ID**: uint256
- **CO2 Level**: uint256 (ppm)
- **PM2.5**: uint256 (µg/m³)
- **Data Hash**: bytes32 (SHA-256 of full reading)
- **Timestamp**: block.timestamp
- **Verified**: bool

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Test thoroughly before submitting
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Hedera Hashgraph** for blockchain infrastructure
- **ScioSense** for ENS160 sensor library
- **Adafruit** for AHT21 sensor library
- **Anthropic** for AI assistance in development

## 📞 Contact

- **GitHub**: [@yourusername](https://github.com/yourusername)
- **Email**: your.email@example.com
- **Project Link**: https://github.com/yourusername/hedera-air-quality-depin

## 🔗 Useful Links

- [Hedera Documentation](https://docs.hedera.com)
- [Hedera Portal](https://portal.hedera.com)
- [HashScan Explorer](https://hashscan.io)
- [ESP32 Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/)
- [Arduino Libraries](https://www.arduino.cc/reference/en/libraries/)

---

**Built with ❤️ using Hedera Blockchain**
