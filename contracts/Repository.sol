pragma solidity ^0.4.22;

contract Repository {

    struct Data {
        string value;
        address toCharge;
    }

    mapping(string => Data) internal data;
}