const express = require('express');
const xrpl = require('xrpl');
const { ethers } = require('ethers');
const { parseEther } = ethers;
const { generateWallet, mintNFT, getNFTs } = require('./wallet');

const router = express.Router();

// XRPL 클라이언트 초기화
const xrplClient = new xrpl.Client(process.env.XRPL_TEST_NETWORK);
// Polygon 프로바이더 설정
const polygonProvider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);

// CrowdFunding 컨트랙트 설정
const crowdFundingABI = [
    "function createProject(string memory _name, string memory _category, string memory _description, string memory _imageUrl, uint256 _goal, uint256 _durationInDays) public",
    "function fundProject(uint256 _projectId) public payable",
    "function getProjectDetails(uint256 _projectId) public view returns (string memory, string memory, string memory, string memory, address, uint256, uint256, uint256, bool, bool)"
];
const crowdFundingAddress = process.env.CROWDFUNDING_CONTRACT_ADDRESS;
const crowdFundingContract = new ethers.Contract(crowdFundingAddress, crowdFundingABI, polygonProvider);

router.post('/create/key', async (req, res) => {
    try {
        const wallet = await generateWallet(xrplClient);
        const {publicKey, privateKey, classicAddress, seed} = wallet;
        console.log({publicKey, privateKey, classicAddress, seed});
        return res.send({publicKey, privateKey, classicAddress, seed});
    } catch (error) {
        console.log(`/api/create/key catch error: ${error}`);
        return res.status(401).send(error);
    }
});

router.post('/create/nft', async (req, res) => {
    try {
        const {address, seed} = req.body;
        console.log({address, seed});

        const wallet = xrpl.Wallet.fromSeed(seed);

        const tx = await mintNFT(xrplClient, address, wallet);
        console.log({tx});
        return res.send({tx});
    } catch (error) {
        console.log(`/api/create/nft catch error: ${error}`);
        return res.status(401).send(error);
    }
});

router.get('/nfts', async (req, res) => {
    try {
        const {address} = req.query;
        const nfts = await getNFTs(xrplClient, address);
        return res.send({nfts});
    } catch (error) {
        console.log(`/api/nfts catch error: ${error}`);
        return res.status(401).send(error);
    }
});

// 프로젝트 생성
router.post('/create/project', async (req, res) => {
    try {
        const { name, category, description, imageUrl, goal, durationInDays } = req.body;
        
        const wallet = new ethers.Wallet(process.env.POLYGON_PRIVATE_KEY, polygonProvider);
        const contractWithSigner = crowdFundingContract.connect(wallet);

        const tx = await contractWithSigner.createProject(
            name,
            category,
            description,
            imageUrl,
            parseEther(goal.toString()),
            durationInDays
        );

        const receipt = await tx.wait();
        console.log("Project created:", receipt.hash);

        return res.send({ transactionHash: receipt.hash });
    } catch (error) {
        console.log(`/api/create/project catch error: ${error}`);
        return res.status(401).send(error);
    }
});

// XRP를 사용한 프로젝트 펀딩
router.post('/fund/project', async (req, res) => {
    try {
        const { projectId, amount, xrpSeed } = req.body;
        
        // XRP에서 브릿지 계정으로 전송
        const xrpWallet = xrpl.Wallet.fromSeed(xrpSeed);
        const xrpTx = await xrplClient.submitAndWait({
            TransactionType: "Payment",
            Account: xrpWallet.address,
            Amount: xrpl.xrpToDrops(amount),
            Destination: process.env.BRIDGE_ACCOUNT
        }, { wallet: xrpWallet });

        if (xrpTx.result.meta.TransactionResult !== "tesSUCCESS") {
            throw new Error("XRP transaction failed");
        }

        // Polygon 상의 컨트랙트 호출
        const polygonWallet = new ethers.Wallet(process.env.POLYGON_PRIVATE_KEY, polygonProvider);
        const contractWithSigner = crowdFundingContract.connect(polygonWallet);

        const polygonTx = await contractWithSigner.fundProject(projectId, {
            value: ethers.utils.parseEther(amount)
        });

        const receipt = await polygonTx.wait();
        console.log("Project funded:", receipt.transactionHash);

        return res.send({ 
            xrpTransactionHash: xrpTx.result.hash,
            polygonTransactionHash: receipt.transactionHash 
        });
    } catch (error) {
        console.log(`/api/fund/project catch error: ${error}`);
        return res.status(401).send(error);
    }
});

// 프로젝트 상세 정보 조회
router.get('/project/:id', async (req, res) => {
    try {
        const projectId = req.params.id;
        const projectDetails = await crowdFundingContract.getProjectDetails(projectId);
        return res.send({ projectDetails });
    } catch (error) {
        console.log(`/api/project/:id catch error: ${error}`);
        return res.status(401).send(error);
    }
});

module.exports = {
    router, xrplClient
};