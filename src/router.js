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
      const { name, category, description, goal, durationInDays } = req.body;
      let imageUrl = '';
      
      if (req.file) {
        imageUrl = await uploadToIPFS(req.file);
      }

      const tx = await crowdfundingContract.createProject(
        name,
        category,
        description,
        imageUrl,
        ethers.parseEther(goal.toString()),
        durationInDays
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment.name === 'ProjectCreated');
      const projectId = event.args.projectId;
      
      res.json({ success: true, projectId: projectId.toString(), transactionHash: receipt.hash, imageUrl });
    } catch (error) {
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