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
