// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MilestoneVerification {
    
    struct Milestone {
        string startupId;
        string milestoneType; // "funding", "revenue", "users", "product_launch"
        uint256 value;
        string description;
        address mentorAddress;
        string proofHash; // IPFS hash of proof documents
        uint256 timestamp;
        bool verified;
    }
    
    // Mappings
    mapping(string => Milestone[]) public startupMilestones;
    mapping(address => bool) public mentors;
    mapping(string => address) public startupToMentor; // startup assigned to mentor
    
    // Events
    event MilestoneSubmitted(string indexed startupId, uint256 milestoneIndex);
    event MilestoneVerified(string indexed startupId, uint256 milestoneIndex, address mentor);
    event MentorAdded(address indexed mentorAddress);
    
    // Owner
    address public owner;
    
    constructor() {
        owner = msg.sender;
        // Add owner as first mentor
        mentors[msg.sender] = true;
    }
    
    // Add mentor (only owner can add mentors)
    function addMentor(address _mentorAddress) public {
        require(msg.sender == owner, "Only owner can add mentors");
        mentors[_mentorAddress] = true;
        emit MentorAdded(_mentorAddress);
    }
    
    // Assign mentor to startup
    function assignMentor(string memory _startupId, address _mentorAddress) public {
        require(msg.sender == owner, "Only owner can assign mentors");
        require(mentors[_mentorAddress], "Address is not a mentor");
        startupToMentor[_startupId] = _mentorAddress;
    }
    
    // Submit milestone for verification (anyone can submit)
    function submitMilestone(
        string memory _startupId,
        string memory _milestoneType,
        uint256 _value,
        string memory _description,
        string memory _proofHash
    ) public returns (uint256) {
        require(startupToMentor[_startupId] != address(0), "No mentor assigned");
        
        Milestone memory newMilestone = Milestone({
            startupId: _startupId,
            milestoneType: _milestoneType,
            value: _value,
            description: _description,
            mentorAddress: startupToMentor[_startupId],
            proofHash: _proofHash,
            timestamp: block.timestamp,
            verified: false
        });
        
        startupMilestones[_startupId].push(newMilestone);
        uint256 milestoneIndex = startupMilestones[_startupId].length - 1;
        
        emit MilestoneSubmitted(_startupId, milestoneIndex);
        return milestoneIndex;
    }
    
    // Verify milestone (called by assigned mentor)
    function verifyMilestone(string memory _startupId, uint256 _milestoneIndex) public {
        require(_milestoneIndex < startupMilestones[_startupId].length, "Milestone doesn't exist");
        require(msg.sender == startupMilestones[_startupId][_milestoneIndex].mentorAddress, "Only assigned mentor can verify");
        require(!startupMilestones[_startupId][_milestoneIndex].verified, "Already verified");
        
        startupMilestones[_startupId][_milestoneIndex].verified = true;
        
        emit MilestoneVerified(_startupId, _milestoneIndex, msg.sender);
    }
    
    // Get all milestones for a startup
    function getStartupMilestones(string memory _startupId) public view returns (Milestone[] memory) {
        return startupMilestones[_startupId];
    }
    
    // Get verified milestones count
    function getVerifiedMilestonesCount(string memory _startupId) public view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < startupMilestones[_startupId].length; i++) {
            if (startupMilestones[_startupId][i].verified) {
                count++;
            }
        }
        return count;
    }
}