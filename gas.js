const Web3 = require('web3');
require('dotenv').config();

async function checkBalanceAndEstimateCost() {
  const web3 = new Web3(process.env.ROOT_NETWORK_RPC);
  const account = web3.eth.accounts.privateKeyToAccount(process.env.ROOT_NETWORK_PRIVATE_KEY);
  
  try {
    const balance = await web3.eth.getBalance(account.address);
    console.log(`Account address: ${account.address}`);
    console.log(`Balance: ${web3.utils.fromWei(balance, 'ether')} XRP`);
    
    // 가스 예상치 계산
    const gasPrice = await web3.eth.getGasPrice();
    const estimatedGas = 8000000; // truffle-config.js에 설정된 가스 한도
    const estimatedCost = web3.utils.toBN(gasPrice).mul(web3.utils.toBN(estimatedGas));
    console.log(`Current gas price: ${web3.utils.fromWei(gasPrice, 'gwei')} Gwei`);
    console.log(`Estimated deployment cost: ${web3.utils.fromWei(estimatedCost, 'ether')} XRP`);
    
    if (web3.utils.toBN(balance).lt(estimatedCost)) {
      console.log('Warning: Insufficient funds for estimated deployment cost');
    } else {
      console.log('Sufficient funds available for estimated deployment cost');
    }
  } catch (error) {
    console.error('Error checking balance:', error);
  }
}

checkBalanceAndEstimateCost();