// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract InvestorVerification {
    address public admin;

    struct VerificationRequest {
        address investor;
        string metadata; // IPFS hash / placeholder for KYC docs
        bool pending;
    }

    mapping(address => VerificationRequest) public requests;
    mapping(address => bool) public verifiedInvestors;

    event VerificationRequested(address indexed investor, string metadata);
    event InvestorVerified(address indexed investor);
    event InvestorRevoked(address indexed investor);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // Step 1: Investor submits request
    function requestVerification(string memory metadata) external {
        require(!verifiedInvestors[msg.sender], "Already verified");
        requests[msg.sender] = VerificationRequest(msg.sender, metadata, true);
        emit VerificationRequested(msg.sender, metadata);
    }

    // Step 2: Admin approves
    function approveRequest(address investor) external onlyAdmin {
        require(requests[investor].pending, "No pending request");
        verifiedInvestors[investor] = true;
        requests[investor].pending = false;
        emit InvestorVerified(investor);
    }

    // Step 3: Admin can revoke
    function revokeInvestor(address investor) external onlyAdmin {
        verifiedInvestors[investor] = false;
        emit InvestorRevoked(investor);
    }

    function isVerified(address investor) external view returns (bool) {
        return verifiedInvestors[investor];
    }
}
