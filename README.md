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

## Start Log
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
```