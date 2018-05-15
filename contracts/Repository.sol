pragma solidity ^0.4.22;

contract Repository {

    struct Data {
        string id1;
        string id2;
        address toCharge;
    }

    mapping(bytes32 => Data) public data;
}
