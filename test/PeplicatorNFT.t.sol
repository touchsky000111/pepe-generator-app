// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import 'forge-std/console.sol';
import 'forge-std/Test.sol';

import {Editions} from '../src/Editions.sol';
import {HedzOriginals} from '../src/HedzOriginals.sol';
import {PeplicatorNFT} from '../src/PeplicatorNFT.sol';
import {PeplicatorSales} from '../src/PeplicatorSales.sol';
import {ZogzEditions} from '../src/ZogzEditions.sol';

contract PeplicatorNFTTest is Test {
  HedzOriginals internal _hedzOriginalsContract;
  Editions internal _pepeEditionsContract;
  ZogzEditions internal _zogzEditionsContract;

  PeplicatorNFT internal _nftContract;
  PeplicatorSales internal _salesContract;

  address internal _owner = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
  address internal _newOwner = 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc;
  uint256 internal _deployer = 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d;

  address internal _admin1 = makeAddr('admin1');
  address internal _admin2 = makeAddr('admin2');

  address internal _user1 = makeAddr('user1');
  address internal _user2 = makeAddr('user2');
  address internal _user3 = makeAddr('user3');

  address internal _allowlistUser1 = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;

  uint256 internal _discountedMintPrice = 0;
  uint256 internal _mintPrice = 0;

  bytes32 constant _DEFAULT_ADMIN_ROLE = 0x00;
  bytes32 constant _MINTER_ROLE = bytes32('MINTER_ROLE');

  bytes32[] _proof;

  function setUp() public {
    vm.startBroadcast(_deployer);

    _hedzOriginalsContract = new HedzOriginals();
    _pepeEditionsContract = new Editions('Pepe Editions', 'PEPE');
    _zogzEditionsContract = new ZogzEditions();
    _nftContract = new PeplicatorNFT('Pepe NFT', 'PEPE');
    _salesContract = new PeplicatorSales(
      address(_nftContract),
      address(_hedzOriginalsContract),
      address(_pepeEditionsContract),
      address(_zogzEditionsContract)
    );

    _pepeEditionsContract.releaseEdition(25000, 'ipfs://abc');
    _pepeEditionsContract.releaseEdition(10000, 'ipfs://def');
    _pepeEditionsContract.releaseEdition(5000, 'ipfs://ghi');
    _pepeEditionsContract.releaseEdition(1000, 'ipfs://jkl');
    _pepeEditionsContract.releaseEdition(100, 'ipfs://mno');

    _zogzEditionsContract.releaseEdition(0, 'ipfs://xyz1');
    _zogzEditionsContract.releaseEdition(0, 'ipfs://xyz2');

    _nftContract.grantRole(_DEFAULT_ADMIN_ROLE, _admin1);
    _nftContract.grantRole(_DEFAULT_ADMIN_ROLE, _admin2);
    _nftContract.grantRole(_MINTER_ROLE, address(_salesContract));

    _discountedMintPrice = _salesContract.discountedMintPrice();
    _mintPrice = _salesContract.mintPrice();

    _salesContract.unpause();

    vm.stopBroadcast();

    vm.deal(_user1, 1000000 ether);
    vm.deal(_user2, 1000000 ether);
    vm.deal(_user3, 1000000 ether);
    vm.deal(_allowlistUser1, 1000000 ether);

    _proof = [
      bytes32(0x00314e565e0574cb412563df634608d76f5c59d9f817e85966100ec1d48005c0),
      bytes32(0x7e0eefeb2d8740528b8f598997a219669f0842302d3c573e9bb7262be3387e63),
      bytes32(0xa22d2d4af6076ff70babd4ffc5035bdce39be98f440f86a0ddc202e3cd935a59)
    ];
  }

  function testAdmin() public {
    assertEq(_nftContract.hasRole(_DEFAULT_ADMIN_ROLE, _owner), true);
    assertEq(_salesContract.hasRole(_DEFAULT_ADMIN_ROLE, _owner), true);
  }

  function testOwner() public {
    assertEq(_nftContract.owner(), _owner);
    assertEq(_salesContract.owner(), _owner);
  }

  function testNameAndSymbol() public {
    assertEq(_nftContract.name(), 'Pepe NFT');
    assertEq(_nftContract.symbol(), 'PEPE');
  }

  function testMintWith1PepeOE1Burn() public {
    vm.prank(_owner);
    _pepeEditionsContract.mint(_user1, 1, 100);

    vm.prank(_user1, _user1);
    _pepeEditionsContract.setApprovalForAll(address(_salesContract), true);

    vm.prank(_user1, _user1);
    _salesContract.mintWithPepeEditionsBurn{value: _mintPrice / 2}(1, 1, 1);

    assertEq(_nftContract.balanceOf(_user1), 1);
    assertEq(_pepeEditionsContract.balanceOf(_user1, 1), 99);
  }

  function testRevertIfMintWithPepeOE1BurnWithZeroAmount() public {
    vm.prank(_owner);
    _pepeEditionsContract.mint(_user1, 1, 100);

    vm.prank(_user1, _user1);
    _pepeEditionsContract.setApprovalForAll(address(_salesContract), true);

    vm.prank(_user1, _user1);
    vm.expectRevert(PeplicatorSales.InvalidAmount.selector);
    _salesContract.mintWithPepeEditionsBurn{value: _mintPrice / 2}(1, 1, 0);
  }

  function testRevertIfMintWithPepeOE1BurnWithIncorrectAmount() public {
    vm.prank(_owner);
    _pepeEditionsContract.mint(_user1, 1, 100);

    vm.prank(_user1, _user1);
    _pepeEditionsContract.setApprovalForAll(address(_salesContract), true);

    vm.prank(_user1, _user1);
    vm.expectRevert(PeplicatorSales.InvalidAmount.selector);
    _salesContract.mintWithPepeEditionsBurn{value: _mintPrice / 2}(2, 1, 1);
  }

  function testMintWith1PepeOE3Burn() public {
    vm.prank(_owner);
    _pepeEditionsContract.mint(_user1, 3, 100);

    vm.prank(_user1, _user1);
    _pepeEditionsContract.setApprovalForAll(address(_salesContract), true);

    vm.prank(_user1, _user1);
    _salesContract.mintWithPepeEditionsBurn{value: (_mintPrice / 2) * 10}(10, 3, 1);

    assertEq(_nftContract.balanceOf(_user1), 10);
    assertEq(_pepeEditionsContract.balanceOf(_user1, 3), 99);
  }

  function testRevertMintWith1PepeOE3BurnWithZeroAmount() public {
    vm.prank(_owner);
    _pepeEditionsContract.mint(_user1, 3, 100);

    vm.prank(_user1, _user1);
    _pepeEditionsContract.setApprovalForAll(address(_salesContract), true);

    vm.prank(_user1, _user1);
    vm.expectRevert(PeplicatorSales.InvalidAmount.selector);
    _salesContract.mintWithPepeEditionsBurn{value: (_mintPrice / 2) * 10}(10, 3, 0);
  }

  function testRevertMintWith1PepeOE3BurnWithTooMuchAmount() public {
    vm.prank(_owner);
    _pepeEditionsContract.mint(_user1, 3, 100);

    vm.prank(_user1, _user1);
    _pepeEditionsContract.setApprovalForAll(address(_salesContract), true);

    vm.prank(_user1, _user1);
    vm.expectRevert(PeplicatorSales.InvalidAmount.selector);
    _salesContract.mintWithPepeEditionsBurn{value: (_mintPrice / 2) * 10}(10, 3, 2);
  }

  function testRevertMintWith1PepeOE3BurnWithTooLittleAmount() public {
    vm.prank(_owner);
    _pepeEditionsContract.mint(_user1, 3, 100);

    vm.prank(_user1, _user1);
    _pepeEditionsContract.setApprovalForAll(address(_salesContract), true);

    vm.prank(_user1, _user1);
    vm.expectRevert(PeplicatorSales.InvalidAmount.selector);
    _salesContract.mintWithPepeEditionsBurn{value: (_mintPrice / 2) * 10}(20, 3, 1);
  }

  function testMintWith5PepeOE1Burns() public {
    vm.prank(_owner);
    _pepeEditionsContract.mint(_user1, 1, 100);

    vm.prank(_user1, _user1);
    _pepeEditionsContract.setApprovalForAll(address(_salesContract), true);

    vm.prank(_user1, _user1);
    _salesContract.mintWithPepeEditionsBurn{value: (_mintPrice / 2) * 5}(5, 1, 5);

    assertEq(_nftContract.balanceOf(_user1), 5);
    assertEq(_pepeEditionsContract.balanceOf(_user1, 1), 95);
  }

  function testMintWith5PepeOE3Burns() public {
    vm.prank(_owner);
    _pepeEditionsContract.mint(_user1, 3, 100);

    vm.prank(_user1, _user1);
    _pepeEditionsContract.setApprovalForAll(address(_salesContract), true);

    vm.prank(_user1, _user1);
    _salesContract.mintWithPepeEditionsBurn{value: (_mintPrice / 2) * 50}(50, 3, 5);

    assertEq(_nftContract.balanceOf(_user1), 50);
    assertEq(_pepeEditionsContract.balanceOf(_user1, 3), 95);
  }

  function testMintWith1ZogzOE1Burn() public {
    vm.prank(_owner);
    _zogzEditionsContract.mint(_user1, 1, 100);

    vm.prank(_user1, _user1);
    _zogzEditionsContract.setApprovalForAll(address(_salesContract), true);

    vm.prank(_user1, _user1);
    _salesContract.mintWithZogzEditionsBurn{value: _mintPrice / 2}(1, 1);

    assertEq(_nftContract.balanceOf(_user1), 1);
    assertEq(_zogzEditionsContract.balanceOf(_user1, 1), 99);
  }

  function testBurn2ZogzOE2ForCredits() public {
    vm.prank(_owner);
    _zogzEditionsContract.mint(_user1, 2, 100);

    vm.prank(_user1, _user1);
    _zogzEditionsContract.setApprovalForAll(address(_salesContract), true);

    vm.prank(_user1, _user1);
    _salesContract.mintWithZogzEditionsBurn{value: _mintPrice}(2, 2);

    assertEq(_nftContract.balanceOf(_user1), 2);
    assertEq(_zogzEditionsContract.balanceOf(_user1, 2), 98);
  }

  function testRevertBurnMintWithPepeOEIfNotApproved() public {
    vm.prank(_owner);
    _pepeEditionsContract.mint(_user1, 1, 1000);

    vm.prank(_user1, _user1);
    vm.expectRevert('ERC1155: caller is not token owner or approved');
    _salesContract.mintWithPepeEditionsBurn{value: _mintPrice / 2}(1, 1, 1);
  }

  function testTokenURI() public {
    vm.prank(_owner, _owner);
    _nftContract.setBaseURI('https://metadata.example.org/');

    vm.prank(_user1, _user1);
    _salesContract.mint{value: _mintPrice * 10}(10);

    assertEq(_nftContract.tokenURI(1), 'https://metadata.example.org/1');
  }

  function testBurn() public {
    vm.startPrank(_user1, _user1);

    _salesContract.mint{value: _mintPrice}(1);
    _nftContract.burn(1);

    vm.expectRevert('ERC721: invalid token ID');
    _nftContract.ownerOf(1);

    assertEq(_nftContract.balanceOf(_user1), 0);
    assertEq(_nftContract.totalSupply(), 0);

    vm.stopPrank();
  }

  function testRevertIfBurnByAnotherUser() public {
    vm.prank(_user1, _user1);
    _salesContract.mint{value: _mintPrice}(1);

    vm.prank(_user2, _user2);
    vm.expectRevert('ERC721: caller is not token owner or approved');
    _nftContract.burn(1);
  }

  function testRevertIfBurnByContractOwner() public {
    vm.prank(_user1, _user1);
    _salesContract.mint{value: _mintPrice}(1);

    vm.prank(_owner, _owner);
    vm.expectRevert('ERC721: caller is not token owner or approved');
    _nftContract.burn(1);
  }

  function testRevertIfBurnByAdmin() public {
    vm.prank(_user1, _user1);
    _salesContract.mint{value: _mintPrice}(1);

    vm.prank(_admin1, _admin1);
    vm.expectRevert('ERC721: caller is not token owner or approved');
    _nftContract.burn(1);
  }

  function testMintOne() public {
    vm.startPrank(_user1, _user1);

    _salesContract.mint{value: _mintPrice}(1);

    assertEq(_nftContract.balanceOf(_user1), 1);
    assertEq(_nftContract.ownerOf(1), _user1);
    assertEq(_nftContract.totalSupply(), 1);

    vm.stopPrank();
  }

  function testMintOneMultiple() public {
    vm.startPrank(_user1, _user1);

    _salesContract.mint{value: _mintPrice}(1);

    assertEq(_nftContract.balanceOf(_user1), 1);
    assertEq(_nftContract.ownerOf(1), _user1);
    assertEq(_nftContract.totalSupply(), 1);

    _salesContract.mint{value: _mintPrice}(1);

    assertEq(_nftContract.balanceOf(_user1), 2);
    assertEq(_nftContract.ownerOf(1), _user1);
    assertEq(_nftContract.ownerOf(2), _user1);
    assertEq(_nftContract.totalSupply(), 2);

    vm.stopPrank();
  }

  function testRevertIfMintOneExceedsMaxSupply() public {
    vm.prank(_owner);
    _nftContract.setMaxSupply(2);

    vm.prank(_user1, _user1);
    _salesContract.mint{value: _mintPrice}(1);

    vm.prank(_user1, _user1);
    _salesContract.mint{value: _mintPrice}(1);

    vm.prank(_user1, _user1);
    vm.expectRevert(PeplicatorNFT.NotEnoughSupply.selector);
    _salesContract.mint{value: _mintPrice}(1);
  }

  function testSetMaxSupply() public {
    vm.prank(_owner);
    _nftContract.setMaxSupply(100000);

    assertEq(_nftContract.maxSupply(), 100000);

    vm.prank(_owner);
    _nftContract.setMaxSupply(200000);

    assertEq(_nftContract.maxSupply(), 200000);
  }

  function testMintOneWithClaimsDiscount() public {
    vm.prank(_owner);
    _hedzOriginalsContract.mint(_user1, 3);

    vm.startPrank(_user1, _user1);

    _salesContract.mintWithClaimsDiscount{value: _discountedMintPrice}(1);

    assertEq(_nftContract.balanceOf(_user1), 1);
    assertEq(_nftContract.ownerOf(1), _user1);
    assertEq(_nftContract.totalSupply(), 1);
    assertEq(_salesContract.hedzClaims(_user1), 1);

    vm.stopPrank();
  }

  function testMintManyWithClaimsDiscount() public {
    vm.prank(_owner);
    _hedzOriginalsContract.mint(_user1, 3);

    vm.startPrank(_user1, _user1);

    _salesContract.mintWithClaimsDiscount{value: _discountedMintPrice * 3}(3);

    assertEq(_nftContract.balanceOf(_user1), 3);
    assertEq(_nftContract.ownerOf(1), _user1);
    assertEq(_nftContract.ownerOf(2), _user1);
    assertEq(_nftContract.ownerOf(3), _user1);
    assertEq(_nftContract.totalSupply(), 3);
    assertEq(_salesContract.hedzClaims(_user1), 3);

    vm.stopPrank();
  }

  function testRevertIfMintManyWithClaimsDiscountExceedsAvailableClaims() public {
    vm.prank(_owner);
    _hedzOriginalsContract.mint(_user1, 3);

    vm.startPrank(_user1, _user1);

    vm.expectRevert(PeplicatorSales.NotEnoughClaims.selector);
    _salesContract.mintWithClaimsDiscount{value: _discountedMintPrice * 4}(4);

    vm.stopPrank();
  }

  function testMintOneWithOwnerDiscount() public {
    vm.startPrank(_owner);

    for (uint256 tokenID = 1; tokenID <= 100; tokenID++) {
      _zogzEditionsContract.releaseEdition(0, 'ipfs://');
      _zogzEditionsContract.mint(_user1, tokenID, 1);
    }

    _salesContract.setMerkleRoot(
      0x8ae4777407987470bb4c7cde049e112c915237cb4c3c248b605355ddbac307a3
    );

    vm.startPrank(_allowlistUser1, _allowlistUser1);

    _salesContract.mintWithOwnerDiscount{value: _mintPrice / 2}(1, _proof);

    assertEq(_nftContract.balanceOf(_allowlistUser1), 1);
    assertEq(_nftContract.ownerOf(1), _allowlistUser1);
    assertEq(_nftContract.totalSupply(), 1);

    vm.stopPrank();
  }

  function testRevertIfMintOneWithOwnerDiscountAsNonOwner() public {
    vm.startPrank(_owner);

    for (uint256 tokenID = 1; tokenID <= 100; tokenID++) {
      _zogzEditionsContract.releaseEdition(0, 'ipfs://');
      _zogzEditionsContract.mint(_user1, tokenID, 1);
    }

    _salesContract.setMerkleRoot(
      0x8ae4777407987470bb4c7cde049e112c915237cb4c3c248b605355ddbac307a3
    );

    vm.startPrank(_user1, _user1);

    vm.expectRevert(PeplicatorSales.Forbidden.selector);
    _salesContract.mintWithOwnerDiscount{value: _mintPrice / 2}(1, _proof);

    vm.stopPrank();
  }

  function testRevertIfMerkleRootNotSet() public {
    vm.startPrank(_owner);

    for (uint256 tokenID = 1; tokenID <= 100; tokenID++) {
      _zogzEditionsContract.releaseEdition(0, 'ipfs://');
      _zogzEditionsContract.mint(_user1, tokenID, 1);
    }

    vm.startPrank(_allowlistUser1, _allowlistUser1);

    vm.expectRevert(PeplicatorSales.MerkleRootNotSet.selector);
    _salesContract.mintWithOwnerDiscount{value: _mintPrice / 2}(1, _proof);

    vm.stopPrank();
  }

  function testMintManyWithOne() public {
    vm.startPrank(_user1, _user1);

    _salesContract.mint{value: _mintPrice}(1);

    assertEq(_nftContract.balanceOf(_user1), 1);
    assertEq(_nftContract.ownerOf(1), _user1);
    assertEq(_nftContract.totalSupply(), 1);

    vm.stopPrank();
  }

  function testMintMany() public {
    vm.startPrank(_user1, _user1);

    _salesContract.mint{value: _mintPrice * 10}(10);

    assertEq(_nftContract.balanceOf(_user1), 10);
    assertEq(_nftContract.ownerOf(1), _user1);
    assertEq(_nftContract.ownerOf(2), _user1);
    assertEq(_nftContract.ownerOf(3), _user1);
    assertEq(_nftContract.ownerOf(4), _user1);
    assertEq(_nftContract.ownerOf(5), _user1);
    assertEq(_nftContract.ownerOf(6), _user1);
    assertEq(_nftContract.ownerOf(7), _user1);
    assertEq(_nftContract.ownerOf(8), _user1);
    assertEq(_nftContract.ownerOf(9), _user1);
    assertEq(_nftContract.ownerOf(10), _user1);
    assertEq(_nftContract.totalSupply(), 10);

    vm.stopPrank();
  }

  function testRevertIfMintManyExceedsMaxSupply() public {
    vm.prank(_owner);
    _nftContract.setMaxSupply(10);

    vm.prank(_user1, _user1);
    vm.expectRevert(PeplicatorNFT.NotEnoughSupply.selector);
    _salesContract.mint{value: _mintPrice * 11}(11);
  }

  function testRevertIfMintManyExceedsMintLimit() public {
    vm.startPrank(_user1, _user1);

    _salesContract.mint{value: _mintPrice * 100}(100);

    assertEq(_nftContract.balanceOf(_user1), 100);
    assertEq(_nftContract.totalSupply(), 100);

    vm.expectRevert(PeplicatorNFT.ExceedsMintLimit.selector);
    _salesContract.mint{value: _mintPrice * 601}(601);

    vm.stopPrank();
  }

  function testWithdrawAll() public {
    vm.prank(_user1, _user1);
    _salesContract.mint{value: _mintPrice}(1);

    vm.prank(_user2, _user2);
    _salesContract.mint{value: _mintPrice}(1);

    assertEq(address(_owner).balance, 0);
    assertEq(address(_salesContract).balance, _mintPrice * 2);

    vm.prank(_owner);
    _salesContract.withdrawAll();

    assertEq(address(_owner).balance, _mintPrice * 2);
    assertEq(address(_salesContract).balance, 0);
  }

  function testWithdrawSome() public {
    vm.prank(_user1, _user1);
    _salesContract.mint{value: _mintPrice}(1);

    vm.prank(_user2, _user2);
    _salesContract.mint{value: _mintPrice}(1);

    assertEq(address(_owner).balance, 0);
    assertEq(address(_salesContract).balance, _mintPrice * 2);

    vm.prank(_owner);
    _salesContract.withdraw(_mintPrice);

    assertEq(address(_owner).balance, _mintPrice);
    assertEq(address(_salesContract).balance, _mintPrice);
  }

  function testRevertIfAdminAttempsToWithdrawAll() public {
    vm.prank(_user1, _user1);
    _salesContract.mint{value: _mintPrice}(1);

    vm.prank(_user1, _user1);
    vm.expectRevert('Ownable: caller is not the owner');
    _salesContract.withdrawAll();
  }

  function testRevertIfAdminAttempsToWithdrawSome() public {
    vm.prank(_user1, _user1);
    _salesContract.mint{value: _mintPrice}(1);

    vm.prank(_user1, _user1);
    vm.expectRevert('Ownable: caller is not the owner');
    _salesContract.withdraw(_mintPrice);
  }

  function testPause() public {
    vm.prank(_owner);
    _salesContract.pause();

    vm.prank(_user1, _user1);
    vm.expectRevert('Pausable: paused');
    _salesContract.mint{value: _mintPrice}(1);
  }

  function testUnpause() public {
    vm.prank(_owner);
    _salesContract.pause();

    vm.prank(_owner);
    _salesContract.unpause();

    vm.prank(_user1, _user1);
    _salesContract.mint{value: _mintPrice}(1);

    assertEq(_nftContract.balanceOf(_user1), 1);
    assertEq(_nftContract.ownerOf(1), _user1);
    assertEq(_nftContract.totalSupply(), 1);
  }

  function testRevertIfUserAttemptsToPause() public {
    vm.prank(_user1);
    vm.expectRevert(
      'AccessControl: account 0x29e3b139f4393adda86303fcdaa35f60bb7092bf is missing role 0x0000000000000000000000000000000000000000000000000000000000000000'
    );
    _salesContract.pause();
  }

  function testRevertIfUserAttemptsToUnpause() public {
    vm.prank(_user1);
    vm.expectRevert(
      'AccessControl: account 0x29e3b139f4393adda86303fcdaa35f60bb7092bf is missing role 0x0000000000000000000000000000000000000000000000000000000000000000'
    );
    _salesContract.unpause();
  }
}
