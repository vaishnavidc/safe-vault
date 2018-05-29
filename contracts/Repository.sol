pragma solidity ^0.4.2;

contract Repository {

    struct Data {
        string value;
        address toCharge;
        string fileHash;
    }

    uint constant public WEI_T0_ETH_RATE = 1 ether;

    uint public ETHToUSDExchangeRate = 500;

    uint public dataWriteCharge = 1;
    uint public fileUploadCharge = 5;

    mapping(string => Data) internal data;
}