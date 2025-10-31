// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/**
 * @title AirQualityDePIN - Minimal Version
 * @dev Simplified for Hedera deployment
 */
contract AirQualityDePIN {
    
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
    
    uint256 public nextSensorId = 1;
    uint256 public nextReadingId = 1;
    
    mapping(uint256 => Sensor) public sensors;
    mapping(uint256 => Reading) public readings;
    mapping(address => uint256[]) public ownerSensors;
    
    address public owner;
    
    event SensorRegistered(uint256 indexed sensorId, address indexed owner);
    event ReadingSubmitted(uint256 indexed readingId, uint256 indexed sensorId);
    
    constructor() {
        owner = msg.sender;
    }
    
    function registerSensor(string memory location) external returns (uint256) {
        uint256 sensorId = nextSensorId++;
        
        sensors[sensorId] = Sensor({
            owner: msg.sender,
            location: location,
            isActive: true,
            totalReadings: 0
        });
        
        ownerSensors[msg.sender].push(sensorId);
        emit SensorRegistered(sensorId, msg.sender);
        return sensorId;
    }
    
    function submitReading(
        uint256 sensorId,
        uint256 co2Level,
        uint256 pm25,
        bytes32 dataHash
    ) external returns (uint256) {
        require(sensors[sensorId].owner == msg.sender, "Not owner");
        require(sensors[sensorId].isActive, "Inactive");
        
        uint256 readingId = nextReadingId++;
        
        readings[readingId] = Reading({
            sensorId: sensorId,
            timestamp: block.timestamp,
            co2Level: co2Level,
            pm25: pm25,
            dataHash: dataHash,
            verified: false
        });
        
        sensors[sensorId].totalReadings++;
        emit ReadingSubmitted(readingId, sensorId);
        return readingId;
    }
    
    function verifyReading(uint256 readingId) external {
        require(msg.sender == owner, "Only owner");
        require(!readings[readingId].verified, "Already verified");
        readings[readingId].verified = true;
    }
    
    function getSensor(uint256 sensorId) external view returns (
        address sensorOwner,
        string memory location,
        bool isActive,
        uint256 totalReadings
    ) {
        Sensor memory s = sensors[sensorId];
        return (s.owner, s.location, s.isActive, s.totalReadings);
    }
    
    function getReading(uint256 readingId) external view returns (
        uint256 sensorId,
        uint256 timestamp,
        uint256 co2Level,
        uint256 pm25,
        bool verified
    ) {
        Reading memory r = readings[readingId];
        return (r.sensorId, r.timestamp, r.co2Level, r.pm25, r.verified);
    }
    
    function getSensorsByOwner(address sensorOwner) external view returns (uint256[] memory) {
        return ownerSensors[sensorOwner];
    }
    
    receive() external payable {}
}