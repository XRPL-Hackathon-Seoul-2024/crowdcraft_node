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
- SideChain: The Root Network (testnet)
- XRPL: xrpl.js
- Server: Node.js Express
- IPFS: Pinata
- Wallet: Xumm-sdk
- Language: Solidity
- Framework: truffle
```

## Deploy

```
- Contract: 0x26b86e7f22ed4490aef79ef72dae8269af0af2e0
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
 <   {
 <     "id": 57,
 <     "jsonrpc": "2.0",
 <     "result": {
 <       "transactionHash": "0x8e12c5f39d9cd7b1c11c97413d4ebc50f355039a45bad43213f4c411bba9fcd3",
 <       "transactionIndex": "0x0",
 <       "blockHash": "0xd89fe172f1c1a0f9df8977d007505a7471f00248aeb30a77da4c5198ea19eb1b",
 <       "from": "0x8a31ea238800d52e3517be2e66b60705b1118ff0",
 <       "to": null,
 <       "blockNumber": "0xe77e6c",
 <       "cumulativeGasUsed": "0x1f8d44",
 <       "gasUsed": "0x1f8d44",
 <       "contractAddress": "0x26b86e7f22ed4490aef79ef72dae8269af0af2e0",
 <       "logs": [],
 <       "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
 <       "status": "0x1",
 <       "effectiveGasPrice": "0x6d23ad5f800",
 <       "type": "0x0"
 <     }
 <   }
   > {
   >   "jsonrpc": "2.0",
   >   "id": 59,
   >   "method": "eth_getBlockByNumber",
   >   "params": [
   >     "latest",
   >     false
   >   ]
   > }
 <   {
 <     "id": 58,
 <     "jsonrpc": "2.0",
 <     "result": "0xe77e6f"
 <   }
   > confirmation number: 2 (block: 15171183)
   > Saving artifacts
   -------------------------------------
   > Total cost:            15.50835 ETH
```

## Transaction
```
Transaction sent: 0x9da2026d0e1b5da06de3575b8496c596f3180c24eb7c4ee4aedb60eb882dd03b
Transaction receipt: ContractTransactionReceipt {
  provider: JsonRpcProvider {},
  to: '0x26B86E7f22ed4490aEf79ef72Dae8269Af0AF2E0',
  from: '0x8a31Ea238800D52e3517BE2E66B60705b1118Ff0',
  contractAddress: null,
  hash: '0x9da2026d0e1b5da06de3575b8496c596f3180c24eb7c4ee4aedb60eb882dd03b',
  index: 0,
  blockHash: '0x72d51ba96b22be5f7af5a8b96e2540d8ef5b8ac236795db6cbe69223f740cfa6',
  blockNumber: 15171273,
  logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000001000000020000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  gasUsed: 331788n,
  blobGasUsed: null,
  cumulativeGasUsed: 331788n,
  gasPrice: 7500000000000n,
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

