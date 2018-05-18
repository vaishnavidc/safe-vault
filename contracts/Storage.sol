pragma solidity ^0.4.22;

import "./Repository.sol";
import "./Ownable.sol";

contract Storage is Repository, Ownable {

    event DataAdded(string key, string value);

    function addData(string _key, string _value, address _addressToCharge) public payable {
        data[_key] = Data(_value, _addressToCharge);
        owner.transfer(msg.value);
        emit DataAdded(_key, _value);
    }

    function getData(string _key) public view returns(string) {
        return (data[_key].value);
    }

    constructor() public {
        owner = msg.sender;
    }
}