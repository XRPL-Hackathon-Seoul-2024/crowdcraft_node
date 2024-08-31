# CROWD_CRAFT_BACK

## Getting Started

To set up and run the application, follow these steps:

### Prerequisites

- Node.js v21.7.2

### Installation

1. Install the dependencies:

   ```bash
   npm install
   ```

2. Start the application:

   ```bash
   npm run start
   ```

## Tech Stack

The project utilizes the following technologies:

- **Ledger**: Axelar
- **SideChain**: The Root Network (testnet)
- **XRPL**: xrpl.js
- **Server**: Node.js Express
- **IPFS**: Pinata
- **Wallet**: Xumm-sdk
- **Language**: Solidity
- **Framework**: Truffle

## Deployment

The smart contract has been deployed to the blockchain. Below are the deployment details:

- **Contract Address**: `0x26b86e7f22ed4490aef79ef72dae8269af0af2e0`

### Deploy Log

```plaintext
Compiling your contracts...
===========================
> Everything is up to date, there is nothing to compile.

Starting migrations...
======================
> Network name:    'xrpl_evm_sidechain'
> Network id:      1440002
> Block gas limit: 21000000 (0x1406f40)

1_deploy_contracts.js
 <   {
 <     "id": 57,
 <     "jsonrpc": "2.0",
 <     "result": {
 <       "transactionHash": "0x8e12c5f39d9cd7b1c11c97413d4ebc50f355039a45bad43213f4c411bba9fcd3",
 <       "contractAddress": "0x26b86e7f22ed4490aef79ef72dae8269af0af2e0",
 <       "status": "0x1",
 <       "gasUsed": "0x1f8d44",
 <     }
 <   }
> confirmation number: 2 (block: 15171183)
> Total cost:            15.50835 ETH
```

## Transactions

Example transaction details:

- **Transaction Hash**: `0x9da2026d0e1b5da06de3575b8496c596f3180c24eb7c4ee4aedb60eb882dd03b`
- **Block Number**: `15171273`
- **Gas Used**: `331788n`



## Key Code Snippets

### Express Server and Routes

```javascript
const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 3000;

// The Root Network - Porcini Testnet Configuration
const provider = new ethers.JsonRpcProvider(process.env.ROOT_NETWORK_RPC);
const wallet = new ethers.Wallet(process.env.ROOT_NETWORK_PRIVATE_KEY, provider);

// Smart Contract ABI and Address
const CROWDFUNDING_ABI = [
  "function createProject(string,string,string,string,uint256,uint256)",
  "function fundProject(uint256) payable",
  "function getProjectDetails(uint256) view returns (string,string,string,string,address,uint256,uint256,uint256,bool,bool)",
  "function getProjectsCount() view returns (uint256)",
  "function getAllProjects() view returns ((string,string,string,string,address,uint256,uint256,uint256,bool,bool)[])",
  "event ProjectCreated(uint256 indexed projectId, string name, string category, string description, string imageUrl, address owner, uint256 goal, uint256 deadline)"
];
const CROWDFUNDING_ADDRESS = process.env.CROWDFUNDING_CONTRACT_ADDRESS;

// Create Smart Contract Instance
const crowdfundingContract = new ethers.Contract(CROWDFUNDING_ADDRESS, CROWDFUNDING_ABI, wallet);

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Import router and set dependencies
const { router, setDependencies } = require('./router');

// Inject dependencies into the router
setDependencies(crowdfundingContract, wallet, upload);

// Use the router
app.use('/api', router);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
```


## API Endpoints

### Wallet Creation Test

To create a new wallet:

```bash
curl -X POST http://localhost:3000/api/create/key
```

### NFT Creation Test

To create a new NFT:

```bash
curl -X POST http://localhost:3000/api/create/nft      -H "Content-Type: application/json"      -d '{"address": "your_xrp_address", "seed": "your_xrp_seed"}'
```

### NFT Retrieval Test

To retrieve NFTs for a given address:

```bash
curl -X GET "http://localhost:3000/api/nfts?address=your_xrp_address"
```

### Project Creation Test

To create a new crowdfunding project:

```bash
curl -X POST http://localhost:3000/api/create/project      -H "Content-Type: application/json"      -d '{
         "name": "Test Project",
         "category": "Technology",
         "description": "This is a test project",
         "imageUrl": "https://example.com/image.jpg",
         "goal": "1",
         "durationInDays": 30
     }'
```

### Project Funding Test

To fund a specific project:

```bash
curl -X POST http://localhost:3000/api/fund/project      -H "Content-Type: application/json"      -d '{
         "projectId": 0,
         "amount": "0.1",
         "xrpSeed": "your_xrp_seed"
     }'
```

### Project Details Retrieval Test

To get the details of a specific project:

```bash
curl -X GET http://localhost:3000/api/project/3
```