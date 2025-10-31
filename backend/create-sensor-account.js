const { Client, PrivateKey, AccountId, AccountCreateTransaction, Hbar } = require('@hashgraph/sdk');
require('dotenv').config();

async function createSensorAccount() {
  const client = Client.forTestnet();
  client.setOperator(
    AccountId.fromString(process.env.OPERATOR_ID),
    PrivateKey.fromString(process.env.OPERATOR_KEY)
  );
  
  console.log("👤 Creating sensor account...\n");
  
  const newKey = PrivateKey.generateED25519();
  
  const transaction = new AccountCreateTransaction()
    .setKey(newKey.publicKey)
    .setInitialBalance(Hbar.from(10));
  
  const txResponse = await transaction.execute(client);
  const receipt = await txResponse.getReceipt(client);
  const accountId = receipt.accountId;
  
  console.log("✅ Sensor Account Created!");
  console.log("═══════════════════════════════════");
  console.log("Account ID:", accountId.toString());
  console.log("Private Key:", newKey.toString());
  console.log("═══════════════════════════════════");
  console.log("\n📝 Save these for ESP32 config!\n");
  
  const fs = require('fs');
  fs.writeFileSync('sensor-account.json', JSON.stringify({
    accountId: accountId.toString(),
    privateKey: newKey.toString()
  }, null, 2));
  
  console.log("💾 Saved to sensor-account.json");
  
  client.close();
}

createSensorAccount().catch(console.error);