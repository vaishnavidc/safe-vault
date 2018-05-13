pragma solidity ^0.4.8;

import "./Repository.sol";
import "./Ownable.sol";

contract Storage is Repository, Ownable {

    event DataAdded(bytes32 id);

    function addData(string _id1, string _id2, address _toCharge) public {
        bytes32 id = keccak256(_id1, _id2);
        data[id] = Data(_id1, _id2, _toCharge);
        emit DataAdded(id);
    }

    function getData(bytes32 id) public view returns(string, string, address) {
        return (data[id].id1, data[id].id2, data[id].toCharge);
    }

    constructor() public {
        owner = msg.sender;
    }
}