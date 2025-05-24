// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import 'forge-std/Script.sol';
import 'forge-std/console.sol';

import {Editions} from '../src/Editions.sol';
import {HedzOriginals} from '../src/HedzOriginals.sol';
import {PeplicatorNFT} from '../src/PeplicatorNFT.sol';
import {PeplicatorSales} from '../src/PeplicatorSales.sol';
import {ZogzEditions} from '../src/ZogzEditions.sol';

contract Local is Script {
  function run() public {
    // Deployed using private key for anvil account 0
    uint256 deployer = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;

    vm.startBroadcast(deployer);
    HedzOriginals hedzOriginalsContract = new HedzOriginals();
    Editions pepeEditionsContract = new Editions('Pepe Editions', 'PEPE');
    ZogzEditions zogzEditionsContract = new ZogzEditions();
    PeplicatorNFT nftContract = new PeplicatorNFT('Pepe NFT', 'PEPE');
    PeplicatorSales salesContract = new PeplicatorSales(
      address(nftContract),
      address(hedzOriginalsContract),
      address(pepeEditionsContract),
      address(zogzEditionsContract)
    );

    // do not use for mainnet deployment
    pepeEditionsContract.releaseEdition(25000, 'ipfs://abc');
    pepeEditionsContract.releaseEdition(10000, 'ipfs://def');
    pepeEditionsContract.releaseEdition(5000, 'ipfs://ghi');
    pepeEditionsContract.releaseEdition(1000, 'ipfs://jkl');
    pepeEditionsContract.releaseEdition(100, 'ipfs://mno');
    pepeEditionsContract.mint(0x70997970C51812dc3A010C7d01b50e0d17dc79C8, 1, 100);
    pepeEditionsContract.mint(0x70997970C51812dc3A010C7d01b50e0d17dc79C8, 2, 10);

    for (uint256 i = 0; i < 111; i++) {
      zogzEditionsContract.releaseEdition(0, 'ipfs://xyz');
    }
    for (uint256 i = 0; i < 111; i++) {
      zogzEditionsContract.mint(0x70997970C51812dc3A010C7d01b50e0d17dc79C8, i + 1, 100);
    }

    hedzOriginalsContract.mint(0x70997970C51812dc3A010C7d01b50e0d17dc79C8, 4);

    nftContract.grantRole(bytes32('MINTER_ROLE'), address(salesContract));

    // do not use for mainnet deployment
    // salesContract.setMerkleRoot(0x87dd768b3964c92f1f329f0bf870ac647d07388921c0b767790c4b5e9e6b5045);
    salesContract.unpause();

    vm.stopBroadcast();

    console.log('NEXT_PUBLIC_HEDZ_ORIGINALS_CONTRACT_ADDRESS="%s"', address(hedzOriginalsContract));
    console.log('NEXT_PUBLIC_PEPE_EDITIONS_CONTRACT_ADDRESS="%s"', address(pepeEditionsContract));
    console.log('NEXT_PUBLIC_ZOGZ_EDITIONS_CONTRACT_ADDRESS="%s"', address(zogzEditionsContract));
    console.log('NEXT_PUBLIC_PEPLICATOR_NFT_CONTRACT_ADDRESS="%s"', address(nftContract));
    console.log('NEXT_PUBLIC_PEPLICATOR_SALES_CONTRACT_ADDRESS="%s"', address(salesContract));
  }
}

contract Testnet1 is Script {
  function run() public {
    uint256 deployer = vm.envUint('SEPOLIA_DEPLOYER_PRIVATE_KEY');

    vm.startBroadcast(deployer);
    HedzOriginals hedzOriginalsContract = HedzOriginals(0x295110b5a4301ab7A3813eDed2D8aDc6c6ce2003);
    Editions pepeEditionsContract = Editions(0x4116150e23cEEC2344D9BAdD6848efd2B08B8169);
    ZogzEditions zogzEditionsContract = ZogzEditions(0x8772125F4982445e4C01b72cE7141746d80D7c53);
    PeplicatorNFT nftContract = PeplicatorNFT(0x653cFA02Ae4E4ae3aEBD203904c81A7E10f2095f);

    PeplicatorSales salesContract = new PeplicatorSales(
      address(nftContract),
      address(hedzOriginalsContract),
      address(pepeEditionsContract),
      address(zogzEditionsContract)
    );

    nftContract.grantRole(bytes32('MINTER_ROLE'), address(salesContract));
    // salesContract.setMerkleRoot(0x87dd768b3964c92f1f329f0bf870ac647d07388921c0b767790c4b5e9e6b5045);
    salesContract.unpause();

    vm.stopBroadcast();
  }
}

contract Testnet is Script {
  function run() public {
    uint256 deployer = vm.envUint('SEPOLIA_DEPLOYER_PRIVATE_KEY');

    vm.startBroadcast(deployer);
    HedzOriginals hedzOriginalsContract = new HedzOriginals();
    Editions pepeEditionsContract = new Editions('Pepe Editions', 'PEPE');
    ZogzEditions zogzEditionsContract = new ZogzEditions();
    PeplicatorNFT nftContract = new PeplicatorNFT('Peplicator NFT', 'PEPE');
    PeplicatorSales salesContract = new PeplicatorSales(
      address(nftContract),
      address(hedzOriginalsContract),
      address(pepeEditionsContract),
      address(zogzEditionsContract)
    );

    // do not use for mainnet deployment
    for (uint256 i = 0; i < 111; i++) {
      zogzEditionsContract.releaseEdition(0, 'ipfs://xyz');
    }
    for (uint256 i = 0; i < 111; i++) {
      zogzEditionsContract.mint(0x70997970C51812dc3A010C7d01b50e0d17dc79C8, i + 1, 100);
    }
    pepeEditionsContract.releaseEdition(25000, 'ipfs://abc');
    pepeEditionsContract.releaseEdition(10000, 'ipfs://def');
    pepeEditionsContract.releaseEdition(5000, 'ipfs://ghi');
    pepeEditionsContract.releaseEdition(1000, 'ipfs://jkl');
    pepeEditionsContract.releaseEdition(100, 'ipfs://mno');
    pepeEditionsContract.mint(0x70997970C51812dc3A010C7d01b50e0d17dc79C8, 1, 100);
    pepeEditionsContract.mint(0x70997970C51812dc3A010C7d01b50e0d17dc79C8, 3, 50);
    pepeEditionsContract.mint(0x70997970C51812dc3A010C7d01b50e0d17dc79C8, 2, 10);
    pepeEditionsContract.mint(0x70997970C51812dc3A010C7d01b50e0d17dc79C8, 5, 5);
    pepeEditionsContract.mint(0x70997970C51812dc3A010C7d01b50e0d17dc79C8, 4, 3);
    nftContract.grantRole(bytes32('MINTER_ROLE'), address(salesContract));

    // do not use for mainnet deployment
    salesContract.unpause();

    vm.stopBroadcast();

    console.log('Deployed HEDZ Originals at %s', address(hedzOriginalsContract));
    console.log('Deployed Pepe Editions at %s', address(pepeEditionsContract));
    console.log('Deployed ZOGZ Editions at %s', address(zogzEditionsContract));
    console.log('Deployed NFT at %s', address(nftContract));
    console.log('Deployed Sales at %s', address(salesContract));
  }
}

contract MainnetDeployPeplicatorNFT is Script {
  function run() public {
    uint256 deployer = vm.envUint('MAINNET_DEPLOYER_PRIVATE_KEY');

    vm.startBroadcast(deployer);
    PeplicatorNFT nftContract = new PeplicatorNFT('Peplicator', 'PPLCTR');
    vm.stopBroadcast();

    console.log('Deployed NFT at %s', address(nftContract));
  }
}

contract MainnetDeploySalesContract is Script {
  function run() public {
    uint256 deployer = vm.envUint('MAINNET_DEPLOYER_PRIVATE_KEY');

    vm.startBroadcast(deployer);

    HedzOriginals hedzOriginalsContract = HedzOriginals(0xEfed2A58cC6A5b81f9158B231847f005cF086c01);
    Editions pepeEditionsContract = Editions(0x4fAAB2f1851B58c26028ab7bA2873Ff3c7B52D4C);
    ZogzEditions zogzEditionsContract = ZogzEditions(0x808E5Cd160d8819CA24C2053037049EB611D0542);
    PeplicatorNFT nftContract = PeplicatorNFT(0x0BaECcD651cf4692A8790BCC4f606E79bF7A3B1c);

    PeplicatorSales salesContract = new PeplicatorSales(
      address(nftContract),
      address(hedzOriginalsContract),
      address(pepeEditionsContract),
      address(zogzEditionsContract)
    );

    nftContract.grantRole(bytes32('MINTER_ROLE'), address(salesContract));

    vm.stopBroadcast();

    console.log('Deployed NFT at %s', address(nftContract));
  }
}
