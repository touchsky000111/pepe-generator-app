// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';

contract HedzOriginals is ERC721, Ownable {
  uint256 private _nextTokenID = 1;

  constructor() ERC721('Hedz', 'HEDZ') {}

  function mint(address __account, uint256 __amount) external onlyOwner {
    for (uint256 i = 0; i < __amount; i++) {
      uint256 tokenID = _nextTokenID++;
      _safeMint(__account, tokenID);
    }
  }
}
