pragma solidity ^0.5.0;

contract Ownable {
    address payable public owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address payable newOwner) public onlyOwner {
        require(newOwner != address(0));
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}