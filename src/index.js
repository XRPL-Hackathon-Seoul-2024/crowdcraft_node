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

// XRPL EVM 사이드체인 설정
const provider = new ethers.JsonRpcProvider(process.env.XRPL_EVM_SIDECHAIN_RPC);
const wallet = new ethers.Wallet(process.env.XRPL_EVM_SIDECHAIN_DEVNET_PRIVATE, provider);

// 스마트 컨트랙트 ABI와 주소
const CROWDFUNDING_ABI = [
    "function createProject(string memory _name, string memory _category, string memory _description, string memory _imageUrl, uint256 _goal, uint256 _durationInDays) public",
    "function fundProject(uint256 _projectId) public payable",
    "function getProjectDetails(uint256 _projectId) public view returns (string memory, string memory, string memory, string memory, address, uint256, uint256, uint256, bool, bool)",
    "function getProjectsCount() public view returns (uint256)",
    "function getAllProjects() public view returns (tuple(string,string,string,string,address,uint256,uint256,uint256,bool,bool)[] memory)"
];
const CROWDFUNDING_ADDRESS = process.env.CROWDFUNDING_CONTRACT_ADDRESS;

// 스마트 컨트랙트 인스턴스 생성
const crowdfundingContract = new ethers.Contract(CROWDFUNDING_ADDRESS, CROWDFUNDING_ABI, wallet);

// Multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // 'uploads' 폴더에 임시로 저장
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// 라우터 임포트
const { router, setDependencies } = require('./router');

// 라우터에 필요한 의존성 주입
setDependencies(crowdfundingContract, wallet, upload);

// 라우터 사용
app.use('/api', router);

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// 에러 핸들링
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});