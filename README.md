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
- SideChain: Polygon Mainnet(Solidity)
- XRPL: xrpl.js
- Server: Node.js Express
- IPFS: Pinata
- Wallet: Xumm-sdk
```

## Deploy

```
- SideChain Contract: 0x7b36b9d55f06377b8aed57e315393f74d8b0cec66cf03e4ed5a6d21daa945302 (EVM)
```

## Log
```
    mac@macs-MacBook-Pro crowdcraft_node % npm run start

    > xrpl_client_node@1.0.0 start
    > node src/index.js

    Server is running on http://localhost:3000
    XRPL 클라이언트가 연결되었습니다.
    XRP Address Balance: 99999988 drops
    EVM Address Balance: 19.305210999689483764 ETH
    Polygon 연결됨. 현재 블록 번호: 61269048
    Bridged 10 aUSDC to XRPL address r4YpZ6GrBxw9M8MAghGSGVG5BRnQeamtg5
    Bridged 10 XRP to Ethereum address 0x950205541860cDD5719725c8cC2d1031e0Cc50b1
    XRP Address Balance: 99999976 drops
    EVM Address Balance: 19.304509246089391428 ETH

    Project created: 0x3218ee3fcd90f89980f8eb862bd0f2cd2cef7a941b4fac12bc6b360c0ad4a627
    check: https://polygonscan.com/tx/0x3218ee3fcd90f89980f8eb862bd0f2cd2cef7a941b4fac12bc6b360c0ad4a627

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

