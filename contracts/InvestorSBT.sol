// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract InvestorSBT is ERC721, AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    struct Credential {
        bytes32 credentialHash;
        uint64 issuedAt;
        uint64 expiresAt;
        bool revoked;
        string uri;
    }

    uint256 private _nextId = 1;
    mapping(uint256 => Credential) public credentialOf;
    mapping(address => uint256) public tokenOf;

    event Minted(address indexed to, uint256 indexed tokenId, bytes32 credentialHash);
    event Revoked(uint256 indexed tokenId);
    event Renewed(uint256 indexed tokenId, uint64 newExpiry);

    constructor(address issuer) ERC721("CampusFounders Investor Passport", "CFIP") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // deployer is admin
        _grantRole(ISSUER_ROLE, issuer);           // assign issuer role
    }

    // Helper function to check if token exists
    function _tokenExists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    function mint(
        address to,
        bytes32 credentialHash,
        uint64 expiresAt,
        string calldata uri
    ) external onlyRole(ISSUER_ROLE) returns (uint256) {
        require(to != address(0), "Invalid address");
        require(tokenOf[to] == 0, "Already has token");

        uint256 tokenId = _nextId++;
        _safeMint(to, tokenId);

        credentialOf[tokenId] = Credential({
            credentialHash: credentialHash,
            issuedAt: uint64(block.timestamp),
            expiresAt: expiresAt,
            revoked: false,
            uri: uri
        });

        tokenOf[to] = tokenId;
        emit Minted(to, tokenId, credentialHash);
        return tokenId;
    }

    function revoke(uint256 tokenId) external onlyRole(ISSUER_ROLE) {
        require(_tokenExists(tokenId), "Nonexistent token");
        credentialOf[tokenId].revoked = true;
        emit Revoked(tokenId);
    }

    function renew(uint256 tokenId, uint64 newExpiry) external onlyRole(ISSUER_ROLE) {
        require(_tokenExists(tokenId), "Nonexistent token");
        credentialOf[tokenId].expiresAt = newExpiry;
        credentialOf[tokenId].revoked = false;
        emit Renewed(tokenId, newExpiry);
    }

    function isValid(uint256 tokenId) public view returns (bool) {
        if (!_tokenExists(tokenId)) return false;
        Credential memory c = credentialOf[tokenId];
        if (c.revoked) return false;
        if (c.expiresAt != 0 && block.timestamp > c.expiresAt) return false;
        return true;
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == 0) and burning (to == 0) only — block transfers
        if (from != address(0) && to != address(0)) {
            revert("SBT: non-transferable");
        }
        
        return super._update(to, tokenId, auth);
    }

    function approve(address, uint256) public pure override {
        revert("SBT: approval disabled");
    }

    function setApprovalForAll(address, bool) public pure override {
        revert("SBT: approval disabled");
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_tokenExists(tokenId), "Nonexistent token");
        return credentialOf[tokenId].uri;
    }

    // Additional helper functions for the platform
    function getInvestorToken(address investor) external view returns (uint256) {
        return tokenOf[investor];
    }

    function isVerifiedInvestor(address investor) external view returns (bool) {
        uint256 tokenId = tokenOf[investor];
        if (tokenId == 0) return false;
        return isValid(tokenId);
    }

    // Support for ERC165
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}