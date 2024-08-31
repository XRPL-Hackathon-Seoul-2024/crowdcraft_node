# CROWD_CRAFT_BACK

## Commoand line Script

```
# node 21.7.2

npm install
npm run start
```

## Tech Stack

```
- Ledger: Axelar
- SideChain: xrpl_evm_sidechain
- XRPL: xrpl.js
- Server: Node.js Express
- IPFS: Pinata
- Wallet: Xumm-sdk
- Language: Solidity
- Framework: truffle
```

## Deploy

```
- Contract: 0x9782B600d43cB7A881317Dd562a0676E19aB3a27
- EVM Block explorer: https://explorer.xrplevm.org/address/0x6e38bA2048085FF9e5b0E4e260bfaa07D5E0e4e6
```

### Deploy Log
```
Compiling your contracts...
===========================
> Everything is up to date, there is nothing to compile.


Starting migrations...
======================
> Network name:    'xrpl_evm_sidechain'
> Network id:      1440002
> Block gas limit: 21000000 (0x1406f40)


1_deploy_contracts.js
=====================

   Replacing 'CrowdFundingProject'
   -------------------------------
   > transaction hash:    0xc4b0f1f6fdef398c75b3ce2d8706acae31b44ac356b2a4769b78395a1cce6ae6
   > Blocks: 2            Seconds: 5
   > contract address:    0x9782B600d43cB7A881317Dd562a0676E19aB3a27
   > block number:        10878681
   > block timestamp:     1725136568
   > account:             0x05da2e47cA2983852F1f8A76e068d92609B9Bb60
   > balance:             48.7595499
   > gas used:            4000000 (0x3d0900)
   > gas price:           4500 gwei
   > value sent:          0 ETH
   > total cost:          18 ETH

   Pausing for 2 confirmations...

   -------------------------------
   > confirmation number: 1 (block: 10878683)
   > confirmation number: 2 (block: 10878684)
   > Saving artifacts
   -------------------------------------
   > Total cost:                  18 ETH

Summary
=======
> Total deployments:   1
> Final cost:          18 ETH
```

## Transaction
```
Transaction sent: 0x5a4d03971450577145599c66b18ff5cf18f01f31c443261312a15c6a19d3bc31
Transaction receipt: ContractTransactionReceipt {
  provider: JsonRpcProvider {},
  to: '0x9782B600d43cB7A881317Dd562a0676E19aB3a27',
  from: '0x05da2e47cA2983852F1f8A76e068d92609B9Bb60',
  contractAddress: null,
  hash: '0x5a4d03971450577145599c66b18ff5cf18f01f31c443261312a15c6a19d3bc31',
  index: 0,
  blockHash: '0x3cc4549c6dc6d2cb787f6b49c94ac68a10c22b9025d7ca9e17cff3c02095e8de',
  blockNumber: 10879725,
  logsBloom: '0x00040000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000400000000000000000000000000000000000000000000000000080000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  gasUsed: 269583n,
  blobGasUsed: null,
  cumulativeGasUsed: 269583n,
  gasPrice: 1100000000000n,
  blobGasPrice: null,
  type: 2,
  status: 1,
  root: undefined
}
```

## Test
#### 지갑 생성 테스트:
`curl -X POST http://localhost:3000/api/create/key`

#### NFT 생성 테스트:
```
curl -X POST http://localhost:3000/api/create/nft \
     -H "Content-Type: application/json" \
     -d '{"address": "your_xrp_address", "seed": "your_xrp_seed"}'
```

#### NFT 조회 테스트:
`curl -X GET "http://localhost:3000/api/nfts?address=your_xrp_address"`

#### 프로젝트 생성 테스트:
```
curl -X POST http://localhost:3000/api/create/project \
     -H "Content-Type: application/json" \
     -d '{
         "name": "Test Project",
         "category": "Technology",
         "description": "This is a test project",
         "imageUrl": "https://example.com/image.jpg",
         "goal": "1",
         "durationInDays": 30
     }'
```

#### 프로젝트 펀딩 테스트:
```
curl -X POST http://localhost:3000/api/fund/project \
     -H "Content-Type: application/json" \
     -d '{
         "projectId": 0,
         "amount": "0.1",
         "xrpSeed": "your_xrp_seed"
     }'
```

#### 프로젝트 상세 정보 조회 테스트:
`curl -X GET http://localhost:3000/api/project/0`

