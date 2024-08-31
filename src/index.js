const express = require('express');
const axios = require('axios');
const { ethers } = require('ethers');
const xrpl = require('xrpl');
const fs = require('fs'); 
const path = require('path');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 3000;

// Ethereum 설정
const AXELAR_GATEWAY = '0xAABdd46ba1B3147d0Cf6aCc9605a74fE8668fC74';
const AXELAR_GATEWAY_ABI = [
  "function sendToken(string destinationChain, string destinationAddress, string symbol, uint256 amount)"
];
const alchemyProvider = new ethers.JsonRpcProvider(process.env.ALCHEMY_API_URL);
const ethWallet = new ethers.Wallet(process.env.ETH_PRIVATE_KEY, alchemyProvider);

// XRPL 설정
const xrplClient = new xrpl.Client(process.env.XRPL_TEST_NETWORK);
const xrplWallet = xrpl.Wallet.fromSeed(process.env.XRPL_SEED);

async function setupXrplClient() {
  try {
    await xrplClient.connect();
    console.log('XRPL 클라이언트가 연결되었습니다.');
  } catch (error) {
    console.error('XRPL 클라이언트 연결 오류:', error);
  }
}

// XRP Ledger에서 계정 잔액 가져오기
async function getXrpBalance(address) {
  try {
    if (!address) {
      throw new Error("Invalid XRP address.");
    }
    const response = await xrplClient.request({
      command: 'account_info',
      account: address,
      ledger_index: 'validated'
    });
    console.log(`XRP Address Balance: ${response.result.account_data.Balance} drops`);
    return response.result.account_data.Balance;
  } catch (error) {
    console.error("Error getting XRP balance:", error.message);
    return null;
  }
}

// Ethereum 네트워크에서 계정 잔액 가져오기
async function getBalanceEvm(address) {
  try {
    if (!address || !ethers.isAddress(address)) {
      throw new Error("Invalid Ethereum address.");
    }

    const balance = await alchemyProvider.getBalance(address);
    if (!balance) {
      throw new Error("Failed to fetch balance from EVM.");
    }
    
    console.log(`EVM Address Balance: ${ethers.formatEther(balance)} ETH`);
    return balance;
  } catch (error) {
    console.error("Error getting EVM balance:", error.message);
    return null;
  }
}

// Ethereum에서 XRPL로 자산 전송
async function bridgeTokenToXRPL(toAddress, amount, symbol) {
  try {
    if (!toAddress) {
      throw new Error("Invalid address provided for transfer.");
    }

    const axelarGateway = new ethers.Contract(AXELAR_GATEWAY, AXELAR_GATEWAY_ABI, ethWallet);
    const tx = await axelarGateway.sendToken("xrpl", toAddress, symbol, amount);
    await tx.wait();
    console.log(`Bridged ${amount} ${symbol} to XRPL address ${toAddress}`);
    return tx.hash;
  } catch (error) {
    console.error('Error bridging token to XRPL:', error.message);
    return null;
  }
}

// XRPL에서 Ethereum으로 자산 전송
async function bridgeTokenToEthereum(toAddress, amount, symbol) {
  try {
    if (!toAddress) {
      throw new Error("Invalid address provided for transfer.");
    }

    const tx = await xrplClient.submitAndWait({
      TransactionType: "Payment",
      Account: xrplWallet.address,
      Amount: amount,
      Destination: "rfEf91bLxrTVC76vw1W3Ur8Jk4Lwujskmb", // Axelar's XRPL multisig account
      Memos: [
        {
          Memo: {
            MemoData: Buffer.from(toAddress.slice(2), 'hex').toString('hex'),
            MemoType: Buffer.from("destination_address", 'ascii').toString('hex'),
          },
        },
        {
          Memo: {
            MemoData: Buffer.from("ethereum", 'ascii').toString('hex'),
            MemoType: Buffer.from("destination_chain", 'ascii').toString('hex'),
          },
        },
        {
          Memo: {
            MemoData: "0".padStart(64, '0'),
            MemoType: Buffer.from("payload_hash", 'ascii').toString('hex'),
          },
        },
      ],
    }, { wallet: xrplWallet });  // 여기에 지갑을 추가합니다.
    console.log(`Bridged ${amount} ${symbol} to Ethereum address ${toAddress}`);
    return tx.result.hash;
  } catch (error) {
    console.error('Error bridging token to Ethereum:', error.message);
    return null;
  }
}


// 라우터 임포트
const { router } = require('./router');

// 라우터 사용
app.use('/api', router);

// 서버 실행
app.listen(port, async () => {
  console.log(`Server is running on http://localhost:${port}`);
  
  // XRPL 클라이언트 설정
  await setupXrplClient();

  // XRP 계정 잔액 가져오기
  const xrpAddress = xrplWallet.address;
  await getXrpBalance(xrpAddress);
  // EVM 계정 잔액 가져오기
  const evmAddress = ethWallet.address;
  await getBalanceEvm(evmAddress);

  // Axelar를 사용한 자산 전송 (EVM에서 XRPL로)
  await bridgeTokenToXRPL(xrpAddress, '10', 'aUSDC');
  // Axelar를 사용한 자산 전송 (XRPL에서 EVM으로)
  await bridgeTokenToEthereum(evmAddress, '10', 'XRP');

  // XRP 계정 잔액 가져오기
  await getXrpBalance(xrpAddress);
  // EVM 계정 잔액 가져오기
  await getBalanceEvm(evmAddress);
});