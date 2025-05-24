// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/utils/cryptography/MerkleProof.sol';

interface IHedzOriginals {
  function balanceOf(address owner) external view returns (uint256 balance);
}

interface IPepeEditions {
  function burn(address __account, uint256 __tokenID, uint256 __amount) external;
}

interface IZogzEditions {
  function balanceOf(address account, uint256 id) external view returns (uint256);

  function burn(address __account, uint256 __tokenID, uint256 __amount) external;
}

interface IPeplicatorNFT {
  function mint(address __account, uint256 __amount) external;
}

contract PeplicatorSales is AccessControl, Ownable, Pausable, ReentrancyGuard {
  error Forbidden();
  error IncorrectPrice();
  error InvalidAddress();
  error InvalidAmount();
  error InvalidProof();
  error MerkleRootNotSet();
  error NotEnoughClaims();
  error WithdrawFailed();

  event DiscountedMintPriceUpdate(uint256 __discountedMintPrice);
  event FullSetOwnersUpdate();
  event HedzOriginalsContractUpdate(address __hedzOriginalsContractUpdate);
  event MerkleRootUpdate(bytes32 __merkleRoot);
  event MintPriceUpdate(uint256 __mintPrice);
  event NFTContractUpdate(address __nftContractUpdate);
  event PepeEditionsContractUpdate(address __pepeEditionsContractAddress);
  event Withdraw(uint256 __amount);
  event ZogzEditionsContractUpdate(address __zogzEditionsContractAddress);

  IPeplicatorNFT private _nftContract;

  IHedzOriginals private _hedzOriginalsContract;
  IPepeEditions private _pepeEditionsContract;
  IZogzEditions private _zogzEditionsContract;

  uint256 private _discountedMintPrice = 0.042 ether;
  uint256 private _mintPrice = 0.1 ether;

  mapping(uint256 => uint256) private _burnForCreditsMap;
  mapping(address => uint256) private _hedzClaims;
  bytes32 private _merkleRoot;

  constructor(
    address __nftContractAddress,
    address __hedzOriginalsContract,
    address __pepeEditionsContractAddress,
    address __zogzEditionsContractAddress
  ) {
    if (
      __nftContractAddress == address(0) ||
      __hedzOriginalsContract == address(0) ||
      __pepeEditionsContractAddress == address(0) ||
      __zogzEditionsContractAddress == address(0)
    ) {
      revert InvalidAddress();
    }

    address sender = _msgSender();

    _nftContract = IPeplicatorNFT(__nftContractAddress);
    _hedzOriginalsContract = IHedzOriginals(__hedzOriginalsContract);
    _pepeEditionsContract = IPepeEditions(__pepeEditionsContractAddress);
    _zogzEditionsContract = IZogzEditions(__zogzEditionsContractAddress);

    _burnForCreditsMap[1] = 1; // ZOGZ Pepe
    _burnForCreditsMap[3] = 10; // ZOGGED Pepe
    _burnForCreditsMap[2] = 50; // HEDZ Pepe
    _burnForCreditsMap[5] = 500; // RARE Pepe
    _burnForCreditsMap[4] = 600; // PEGZ Pepe

    _pause();

    _grantRole(DEFAULT_ADMIN_ROLE, sender);
  }

  ////////////////////////////////////////////////////////////////////////////
  // MODIFIERS
  ////////////////////////////////////////////////////////////////////////////

  modifier onlyEOA() {
    if (tx.origin != msg.sender) {
      revert Forbidden();
    }
    _;
  }

  ////////////////////////////////////////////////////////////////////////////
  // OWNER
  ////////////////////////////////////////////////////////////////////////////

  /**
   * @dev Used to set HEDZ Originals contract.
   *
   * Emits {HedzOriginalsContractUpdate} event.
   *
   */
  function setHedzOriginalsContract(address __hedzOriginalsContractAddress) external onlyOwner {
    _hedzOriginalsContract = IHedzOriginals(__hedzOriginalsContractAddress);

    emit HedzOriginalsContractUpdate(__hedzOriginalsContractAddress);
  }

  /**
   * @dev Used to set NFT contract.
   *
   * Emits {NFTContractUpdate} event.
   *
   */
  function setNFTContract(address __nftContractAddress) external onlyOwner {
    _nftContract = IPeplicatorNFT(__nftContractAddress);

    emit NFTContractUpdate(__nftContractAddress);
  }

  /**
   * @dev Used to set Pepe Editions contract.
   *
   * Emits {PepeEditionsContractUpdate} event.
   *
   */
  function setPepeEditionsContract(address __pepeEditionsContractAddress) external onlyOwner {
    _pepeEditionsContract = IPepeEditions(__pepeEditionsContractAddress);

    emit PepeEditionsContractUpdate(__pepeEditionsContractAddress);
  }

  /**
   * @dev Used to set ZOGZ Editions contract.
   *
   * Emits {ZogzEditionsContractUpdate} event.
   *
   */
  function setZogzEditionsContract(address __zogzEditionsContractAddress) external onlyOwner {
    _zogzEditionsContract = IZogzEditions(__zogzEditionsContractAddress);

    emit ZogzEditionsContractUpdate(__zogzEditionsContractAddress);
  }

  /**
   * @dev Used to set HEDZ Originals contract.
   *
   * Emits {HedzOriginalsContractUpdate} event.
   *
   */
  function setMerkleRoot(bytes32 __merkleRoot) external onlyOwner {
    _merkleRoot = __merkleRoot;

    emit MerkleRootUpdate(__merkleRoot);
  }

  /**
   * @dev Used to withdraw funds from the contract.
   */
  function withdraw(uint256 __amount) external onlyOwner {
    (bool success, ) = owner().call{value: __amount}('');

    if (!success) revert WithdrawFailed();

    emit Withdraw(__amount);
  }

  /**
   * @dev Used to withdraw all funds from the contract.
   */
  function withdrawAll() external onlyOwner {
    uint256 amount = address(this).balance;

    (bool success, ) = owner().call{value: amount}('');

    if (!success) revert WithdrawFailed();

    emit Withdraw(amount);
  }

  ////////////////////////////////////////////////////////////////////////////
  // ADMIN
  ////////////////////////////////////////////////////////////////////////////

  /**
   * @dev Used to set discounted mint price.
   *
   * Emits {DiscountedMintPriceUpdate} event.
   *
   */
  function setDiscountedMintPrice(
    uint256 __discountedMintPrice
  ) external onlyRole(DEFAULT_ADMIN_ROLE) {
    _discountedMintPrice = __discountedMintPrice;

    emit DiscountedMintPriceUpdate(__discountedMintPrice);
  }

  /**
   * @dev Used to set mint price.
   *
   * Emits {MintPriceUpdate} event(s).
   *
   */
  function setMintPrice(uint256 __mintPrice) external onlyRole(DEFAULT_ADMIN_ROLE) {
    _mintPrice = __mintPrice;

    emit MintPriceUpdate(__mintPrice);
  }

  /**
   * @dev Used to pause sale.
   *
   * Emits {Paused} event(s).
   *
   */
  function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
    _pause();
  }

  /**
   * @dev Used to unpause sale.
   *
   * Emits {Unpaused} event(s).
   *
   */
  function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
    _unpause();
  }

  ////////////////////////////////////////////////////////////////////////////
  // WRITES
  ////////////////////////////////////////////////////////////////////////////

  /**
   * @dev Used to mint token(s).
   */
  function mint(uint256 __amount) external payable nonReentrant onlyEOA whenNotPaused {
    address sender = _msgSender();

    if (_mintPrice * __amount != msg.value) {
      revert IncorrectPrice();
    }

    _nftContract.mint(sender, __amount);
  }

  /**
   * @dev Used to mint token(s) with Pepe Editions burn.
   */
  function mintWithPepeEditionsBurn(
    uint256 __amount,
    uint256 __tokenID,
    uint256 __burnAmount
  ) external payable nonReentrant onlyEOA whenNotPaused {
    address sender = _msgSender();

    if (__amount != _burnForCreditsMap[__tokenID] * __burnAmount) {
      revert InvalidAmount();
    }
    if ((_mintPrice * __amount) / 2 != msg.value) {
      revert IncorrectPrice();
    }
    _pepeEditionsContract.burn(sender, __tokenID, __burnAmount);
    _nftContract.mint(sender, __amount);
  }

  /**
   * @dev Used to mint token(s) with ZOGZ Editions burn.
   */
  function mintWithZogzEditionsBurn(
    uint256 __amount,
    uint256 __tokenID
  ) external payable nonReentrant onlyEOA whenNotPaused {
    address sender = _msgSender();

    if ((_mintPrice * __amount) / 2 != msg.value) {
      revert IncorrectPrice();
    }
    _zogzEditionsContract.burn(sender, __tokenID, __amount);
    _nftContract.mint(sender, __amount);
  }

  /**
   * @dev Used to mint token(s) with claims discount.
   */
  function mintWithClaimsDiscount(
    uint256 __amount
  ) external payable nonReentrant onlyEOA whenNotPaused {
    address sender = _msgSender();

    if (_discountedMintPrice * __amount != msg.value) {
      revert IncorrectPrice();
    }
    if (_hedzOriginalsContract.balanceOf(sender) - _hedzClaims[sender] < __amount) {
      revert NotEnoughClaims();
    }
    _hedzClaims[sender] += __amount;
    _nftContract.mint(sender, __amount);
  }

  /**
   * @dev Used to mint token(s) with owner discount.
   */
  function mintWithOwnerDiscount(
    uint256 __amount,
    bytes32[] calldata __proof
  ) external payable nonReentrant onlyEOA whenNotPaused {
    address sender = _msgSender();

    if ((_mintPrice * __amount) / 2 != msg.value) {
      revert IncorrectPrice();
    }

    if (_merkleRoot == 0x0) revert MerkleRootNotSet();

    bool verified = MerkleProof.verify(__proof, _merkleRoot, keccak256(abi.encodePacked(sender)));

    if (!verified) revert Forbidden();

    _nftContract.mint(sender, __amount);
  }

  ////////////////////////////////////////////////////////////////////////////
  // READS
  ////////////////////////////////////////////////////////////////////////////

  /**
   * @dev Returns the discounted mint price.
   */
  function discountedMintPrice() external view returns (uint256) {
    return _discountedMintPrice;
  }

  /**
   * @dev Returns the number of HEDZ claims.
   */
  function hedzClaims(address __account) external view returns (uint256) {
    return _hedzClaims[__account];
  }

  /**
   * @dev Returns the mint price.
   */
  function mintPrice() external view returns (uint256) {
    return _mintPrice;
  }

  /**
   * @dev Returns the merkle root.
   */
  function merkleRoot() external view returns (bytes32) {
    return _merkleRoot;
  }
}
