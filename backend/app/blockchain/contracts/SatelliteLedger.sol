// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SatelliteLedger {
    struct ThreatRecord {
        uint256 threatId;
        string threatType;
        string severity;
        uint256 timestamp;
        string eventHash; 
    }

    mapping(uint256 => ThreatRecord) public threats;
    uint256[] public threatIds;

    event ThreatNotarized(uint256 indexed threatId, string threatType, string severity, string eventHash);

    function recordThreat(
        uint256 _threatId,
        string memory _threatType,
        string memory _severity,
        uint256 _timestamp,
        string memory _eventHash
    ) public {
        require(threats[_threatId].threatId == 0, "Threat ID already recorded");

        threats[_threatId] = ThreatRecord({
            threatId: _threatId,
            threatType: _threatType,
            severity: _severity,
            timestamp: _timestamp,
            eventHash: _eventHash
        });

        threatIds.push(_threatId);
        emit ThreatNotarized(_threatId, _threatType, _severity, _eventHash);
    }

    function getThreat(uint256 _threatId) public view returns (
        uint256 threatId,
        string memory threatType,
        string memory severity,
        uint256 timestamp,
        string memory eventHash
    ) {
        ThreatRecord memory t = threats[_threatId];
        return (t.threatId, t.threatType, t.severity, t.timestamp, t.eventHash);
    }

    function getTotalThreats() public view returns (uint256) {
        return threatIds.length;
    }
}
