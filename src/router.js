
const express = require('express');
const { ethers } = require('ethers');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const router = express.Router();

let crowdfundingContract;
let wallet;
let upload;

function setDependencies(contract, walletInstance, uploadMiddleware) {
  crowdfundingContract = contract;
  wallet = walletInstance;
  upload = uploadMiddleware;

  // 컨트랙트가 초기화된 후에 ABI를 로깅
  if (crowdfundingContract && crowdfundingContract.interface) {
    console.log('Contract ABI:', JSON.stringify(crowdfundingContract.interface.format('json'), null, 2));
  } else {
    console.error('Crowdfunding contract is not properly initialized');
  }
}

async function uploadToIPFS(file) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(file.path));

  const pinataMetadata = JSON.stringify({
    name: file.originalname,
  });
  formData.append('pinataMetadata', pinataMetadata);

  try {
    const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      maxBodyLength: "Infinity",
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        'Authorization': `Bearer ${process.env.PINATA_JWT}`
      }
    });
    return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload image to IPFS');
  }
}

// 프로젝트 생성
router.post('/create/project', (req, res, next) => {
    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, error: err.message });
      }
      try {
        console.log('Received request body:', req.body);
  
        const { name, category, description, goal, durationInDays } = req.body;
        if (!name || !category || !description || !goal || !durationInDays) {
          return res.status(400).json({ success: false, error: "Missing required fields" });
        }
  
        let imageUrl = '';
        
        if (req.file) {
          imageUrl = await uploadToIPFS(req.file);
        }
  
        console.log('createProject 함수 호출 인자:', {
          name,
          category,
          description,
          imageUrl,
          goal: ethers.parseEther(goal.toString()).toString(),
          durationInDays: BigInt(durationInDays).toString()
        });
      
        const tx = await crowdfundingContract.createProject(
          name,
          category,
          description,
          imageUrl,
          ethers.parseEther(goal.toString()),
          BigInt(durationInDays),
          { gasLimit: 3000000 }
        );
        
        console.log('Transaction sent:', tx.hash);
        
        const receipt = await tx.wait(2); // 2개의 확인을 기다림
        console.log('Transaction receipt:', receipt);
  
        let projectId;
        if (receipt.logs) {
          for (const log of receipt.logs) {
            try {
              if (log.topics[0] === ethers.id("ProjectCreated(uint256,string,string,string,string,address,uint256,uint256)")) {
                const decodedLog = crowdfundingContract.interface.parseLog({
                  topics: log.topics,
                  data: log.data
                });
                projectId = decodedLog.args[0];
                console.log('ProjectCreated event found. Project ID:', projectId.toString());
                break;
              }
            } catch (e) {
              console.log('Error parsing log:', e);
            }
          }
        }
  
        if (!projectId) {
          console.log('ProjectCreated event not found. Fetching project count as fallback.');
          const projectCount = await crowdfundingContract.getProjectsCount();
          projectId = projectCount - 1n; // Assuming projectId is zero-indexed
          console.log('Estimated Project ID from count:', projectId.toString());
        }
  
        // 프로젝트 세부 정보 조회로 확인
        try {
          const projectDetails = await crowdfundingContract.getProjectDetails(projectId);
          console.log('Project details retrieved:', projectDetails);
        } catch (error) {
          console.error('Error retrieving project details:', error);
        }
  
        res.json({ success: true, projectId: projectId.toString(), transactionHash: receipt.hash, imageUrl });
      } catch (error) {
        console.error('Error in project creation:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    });
  });


// 모든 프로젝트 조회
router.get('/projects', async (req, res) => {
  try {
    const projects = await crowdfundingContract.getAllProjects();
    const formattedProjects = projects.map((project, index) => ({
      id: index,
      name: project[0],
      category: project[1],
      description: project[2],
      imageUrl: project[3],
      owner: project[4],
      goal: ethers.formatEther(project[5]),
      amountRaised: ethers.formatEther(project[6]),
      deadline: new Date(Number(project[7]) * 1000).toISOString(),
      isFunded: project[8],
      isClosed: project[9]
    }));
    res.json({ success: true, projects: formattedProjects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 특정 프로젝트 조회
router.get('/projects/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await crowdfundingContract.getProjectDetails(projectId);
    const formattedProject = {
      id: projectId,
      name: project[0],
      category: project[1],
      description: project[2],
      imageUrl: project[3],
      owner: project[4],
      goal: ethers.formatEther(project[5]),
      amountRaised: ethers.formatEther(project[6]),
      deadline: new Date(Number(project[7]) * 1000).toISOString(),
      isFunded: project[8],
      isClosed: project[9]
    };
    res.json({ success: true, project: formattedProject });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 프로젝트 후원
router.post('/projects/:id/fund', async (req, res) => {
  try {
    const projectId = req.params.id;
    const { amount } = req.body;
    const tx = await crowdfundingContract.fundProject(projectId, { value: ethers.parseEther(amount) });
    const receipt = await tx.wait();
    res.json({ success: true, transactionHash: receipt.hash });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = {
  router: router,
  setDependencies: setDependencies
};