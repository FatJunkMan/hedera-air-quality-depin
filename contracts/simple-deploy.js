const {
  Client,
  PrivateKey,
  AccountId,
  FileCreateTransaction,
  FileAppendTransaction,
  ContractCreateTransaction,
  ContractFunctionParameters,
  Hbar
} = require('@hashgraph/sdk');
const fs = require('fs');
const solc = require('solc');
require('dotenv').config();

async function deploySolidityContract() {
  console.log('🚀 Simple Hedera Contract Deployment\n');
  
  const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
  const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
  
  const client = Client.forTestnet();
  client.setOperator(operatorId, operatorKey);
  
  console.log('✓ Connected to Hedera Testnet');
  console.log(`✓ Operator: ${operatorId}\n`);
  
  console.log('📝 Reading contract source...');
  const contractSource = fs.readFileSync('./AirQualityDePIN.sol', 'utf8');
  
  console.log('🔨 Compiling contract...');
  const input = {
  language: 'Solidity',
  sources: {
    'AirQualityDePIN.sol': {
      content: contractSource
    }
  },
  settings: {
    evmVersion: 'london',
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode.object']
      }
    },
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};
  
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  
  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === 'error');
    if (errors.length > 0) {
      console.error('❌ Compilation errors:');
      errors.forEach(err => console.error(err.formattedMessage));
      process.exit(1);
    }
  }
  
  const contract = output.contracts['AirQualityDePIN.sol']['AirQualityDePIN'];
  const bytecode = contract.evm.bytecode.object;
  const abi = contract.abi;
  
  console.log('✓ Contract compiled successfully');
  console.log(`✓ Bytecode size: ${bytecode.length / 2} bytes\n`);
  
  console.log('📤 Uploading bytecode to Hedera File Service...');
  
  const bytecodeBuffer = Buffer.from(bytecode, 'hex');
  const chunkSize = 4096;
  const chunks = [];
  
  for (let i = 0; i < bytecodeBuffer.length; i += chunkSize) {
    chunks.push(bytecodeBuffer.slice(i, i + chunkSize));
  }
  
  const fileCreateTx = new FileCreateTransaction()
    .setKeys([operatorKey])
    .setContents(chunks[0]);
  
  const fileCreateSubmit = await fileCreateTx.execute(client);
  const fileCreateReceipt = await fileCreateSubmit.getReceipt(client);
  const fileId = fileCreateReceipt.fileId;
  
  console.log(`✓ File created: ${fileId}`);
  
  for (let i = 1; i < chunks.length; i++) {
    console.log(`  Uploading chunk ${i + 1}/${chunks.length}...`);
    const fileAppendTx = new FileAppendTransaction()
      .setFileId(fileId)
      .setContents(chunks[i]);
    
    await fileAppendTx.execute(client);
  }
  
  console.log('✓ Bytecode uploaded successfully\n');
  
console.log('📋 Creating contract on Hedera...');

const { ContractCreateFlow } = require('@hashgraph/sdk');

const contractCreateFlow = new ContractCreateFlow()
  .setBytecode(bytecode)
  .setGas(1000000);
  

const contractCreateSubmit = await contractCreateFlow.execute(client);
const contractCreateReceipt = await contractCreateSubmit.getReceipt(client);
const contractId = contractCreateReceipt.contractId;
  
  console.log('\n✅ CONTRACT DEPLOYED SUCCESSFULLY!\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Contract ID: ${contractId}`);
  console.log(`File ID: ${fileId}`);
  console.log(`Explorer: https://hashscan.io/testnet/contract/${contractId}`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  const deploymentInfo = {
    contractId: contractId.toString(),
    fileId: fileId.toString(),
    network: 'testnet',
    deployedAt: new Date().toISOString(),
    explorerUrl: `https://hashscan.io/testnet/contract/${contractId}`
  };
  
  fs.writeFileSync('contract-info.json', JSON.stringify(deploymentInfo, null, 2));
  fs.writeFileSync('contract-address.txt', contractId.toString());
  fs.writeFileSync('AirQualityDePIN.abi.json', JSON.stringify(abi, null, 2));
  
  console.log('💾 Saved files:');
  console.log('  - contract-info.json');
  console.log('  - contract-address.txt');
  console.log('  - AirQualityDePIN.abi.json\n');
  
  client.close();
}

deploySolidityContract()
  .then(() => {
    console.log('✅ Deployment completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });