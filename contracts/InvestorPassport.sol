// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract InvestorVerification {
    address public admin;

    mapping(address => bool) public verifiedInvestors;

    event InvestorVerified(address indexed investor);
    event InvestorRevoked(address indexed investor);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function verifyInvestor(address investor) external onlyAdmin {
        verifiedInvestors[investor] = true;
        emit InvestorVerified(investor);
    }

    function revokeInvestor(address investor) external onlyAdmin {
        verifiedInvestors[investor] = false;
        emit InvestorRevoked(investor);
    }

    function isVerified(address investor) external view returns (bool) {
        return verifiedInvestors[investor];
    }
}
