pragma solidity ^0.4.2;

import "./Repository.sol";
import "./Ownable.sol";

contract Storage is Repository, Ownable {

    event DataAdded(string key, string value, string fileHash);
    
    function addData(string _key, string _value, string _fileHash, address _addressToCharge) public payable {
        if (keccak256(_fileHash) == keccak256("") && keccak256(_value) == keccak256("")) {
            revert();
        } else if (keccak256(_fileHash) == keccak256("") && keccak256(_value) != keccak256("")) {
            require(msg.value >= dataWriteCharge / ETHToUSDExchangeRate * WEI_T0_ETH_RATE);
        }
         else if (keccak256(_value) == keccak256("") && keccak256(_fileHash) != keccak256("")) {
            require(msg.value >= fileUploadCharge / ETHToUSDExchangeRate * WEI_T0_ETH_RATE);
        } else {
            require(msg.value >= fileUploadCharge / ETHToUSDExchangeRate * WEI_T0_ETH_RATE + dataWriteCharge / ETHToUSDExchangeRate * WEI_T0_ETH_RATE);
        }
        data[_key] = Data(_value, _addressToCharge, _fileHash);
        owner.transfer(msg.value);
        emit DataAdded(_key, _value, _fileHash);
    }

    function setExchangeRate(uint _exchangeRate) public onlyOwner {
        ETHToUSDExchangeRate = _exchangeRate;
    }

    function setDataWriteCharge(uint _charge) public onlyOwner {
        dataWriteCharge = _charge;
    }

    function setFileUploadCharge(uint _charge) public onlyOwner {
        fileUploadCharge = _charge;
    }

    function getData(string _key) public view returns(string, string) {
        return (data[_key].value, data[_key].fileHash);
    }

    constructor(/*uint _exchangeRate*/) public {
        owner = msg.sender;
        // ETHToUSDExchangeRate = _exchangeRate;
    }
}