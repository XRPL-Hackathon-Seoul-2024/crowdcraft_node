const express = require('express');
const axios = require('axios');
const { ethers } = require('ethers');
const xrpl = require('xrpl');
const fs = require('fs'); 
const path = require('path');
const { AxelarAssetTransfer, Environment, EvmChain } = require("@axelar-network/axelarjs-sdk");

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 3000;

// Axelar SDK 초기화
const axelarAssetTransfer = new AxelarAssetTransfer({
  environment: Environment.TESTNET,
  auth: 'local',
});

// EVM 스마트 계약 주소와 ABI 설정
const evmContractAddress = '0x995C0cF4ce124fb506541D500ae050797e67BcE0';
const contractPath = path.join(__dirname, '../build/contracts/CrowdFundingProject.json');

let evmContractABI = [];
try {
  const contractJson = fs.readFileSync(contractPath, 'utf8');
  const contractObject = JSON.parse(contractJson);
  evmContractABI = contractObject.abi;
} catch (error) {
  console.error('Error reading or parsing contract JSON file:', error);
  process.exit(1);
}
console.log({ evmContractAddress, evmContractABI });

// Polygon Mainnet 프로바이더 초기화
const alchemyProvider = new ethers.JsonRpcProvider(process.env.ALCHEMY_API_URL);

// 스마트 계약 인스턴스 생성
const contract = new ethers.Contract(evmContractAddress, evmContractABI, alchemyProvider);

// XRPL 클라이언트 초기화
const xrplClient = new xrpl.Client(process.env.XRPL_TEST_NETWORK);

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
  } catch (error) {
    console.error("Error getting XRP balance:", error.message);
  }
}

// EVM 네트워크에서 계정 잔액 가져오기
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
  } catch (error) {
    console.error("Error getting EVM balance:", error.message);
  }
}

// Axelar를 통해 EVM에서 XRPL로 자산 전송하기
async function transferAssetsFromEvmToXrpl(fromAddress, toAddress, amount, symbol) {
  try {
    if (!fromAddress || !toAddress) {
      throw new Error("Invalid address provided for transfer.");
    }

    const transferResult = await axelarAssetTransfer.sendToken({
      fromChain: EvmChain.POLYGON,
      toChain: 'ripple',
      fromAddress: fromAddress,
      toAddress: toAddress,
      asset: symbol,
      amount: amount
    });
    console.log('Transfer from EVM to XRPL successful:', transferResult);
  } catch (error) {
    console.error('Error transferring assets from EVM to XRPL:', error.message);
  }
}

// Axelar를 통해 XRPL에서 EVM으로 자산 전송하기
async function transferAssetsFromXrplToEvm(fromAddress, toAddress, amount, symbol) {
  try {
    if (!fromAddress || !toAddress) {
      throw new Error("Invalid address provided for transfer.");
    }

    const transferResult = await axelarAssetTransfer.sendToken({
      fromChain: 'ripple',
      toChain: EvmChain.POLYGON,
      fromAddress: fromAddress,
      toAddress: toAddress,
      asset: symbol,
      amount: amount
    });
    console.log('Transfer from XRPL to EVM successful:', transferResult);
  } catch (error) {
    console.error('Error transferring assets from XRPL to EVM:', error.message);
  }
}

// Import router.js and use it
const { router } = require('./router');
app.use('/api', router);

// 서버 실행
app.listen(port, async () => {
  console.log(`Server is running on http://localhost:${port}`);
  
  // XRPL 클라이언트 설정
  await setupXrplClient();

  // XRP 계정 잔액 가져오기
  const xrpAddress = 'r4YpZ6GrBxw9M8MAghGSGVG5BRnQeamtg5';
  await getXrpBalance(xrpAddress);
  
  // EVM 계정 잔액 가져오기
  const evmAddress = '0x950205541860cDD5719725c8cC2d1031e0Cc50b1';
  await getBalanceEvm(evmAddress);

  // Axelar를 사용한 자산 전송 (EVM에서 XRPL로)
  await transferAssetsFromEvmToXrpl(evmAddress, xrpAddress, '10', 'aUSDC');

  // Axelar를 사용한 자산 전송 (XRPL에서 EVM으로)
  await transferAssetsFromXrplToEvm(xrpAddress, evmAddress, '10', 'wXRP');
});