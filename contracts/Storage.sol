pragma solidity ^0.4.22;

import "./Repository.sol";
import "./Ownable.sol";

contract Storage is Repository, Ownable {

    event DataAdded(bytes32 id);

    function addData(string _id1, string _id2, address _addressToCharge) public {
        bytes32 id = keccak256(_id1, _id2, _addressToCharge, now);
        data[id] = Data(_id1, _id2, _addressToCharge);
        emit DataAdded(id);
    }

    function getData(bytes32 id) public view returns(string, string) {
        return (data[id].id1, data[id].id2);
    }

    constructor() public {
        owner = msg.sender;
    }
}