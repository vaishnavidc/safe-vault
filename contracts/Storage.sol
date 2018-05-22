pragma solidity ^0.4.2;

import "./Repository.sol";
import "./Ownable.sol";

contract Storage is Repository, Ownable {

    uint public ETHUSD;

    // event newOraclizeQuery(string description);
    // event newKrakenPriceTicker(string price);
    event DataAdded(string key, string value);

    function addData(string _key, string _value, address _addressToCharge) public payable {
        require(msg.value >= tx.gasprice * 1000);
        data[_key] = Data(_value, _addressToCharge);
        owner.transfer(msg.value);
        emit DataAdded(_key, _value);
    }

    function getData(string _key) public view returns(string) {
        return (data[_key].value);
    }

    // function __callback(bytes32 myid, string result, bytes proof) {
    //     if (msg.sender != oraclize_cbAddress()) throw;
    //     newKrakenPriceTicker(result);
    //     ETHUSD = parseInt(result, 2); 
    // }

    // function update() payable {
    //     if (oraclize_getPrice("URL") > this.balance) {
    //         newOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
    //     } else {
    //         newOraclizeQuery("Oraclize query was sent, standing by for the answer..");
    //         oraclize_query(0, "URL", "json(https://api.kraken.com/0/public/Ticker?pair=ETHUSD).result.XETHZUSD.c.0");
    //     }
    // }

    constructor() public {
        owner = msg.sender;
        // update();
    }
}