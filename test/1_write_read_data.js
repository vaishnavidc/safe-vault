var storage = artifacts.require("./Storage.sol");

contract('Storage', function (accounts) {
    var key;
    it("should be possible to add data to the blockchain", function () {
        var instance;
        return storage.deployed().then(function (i) {
            instance = i;
            return instance.addData("key", "value", accounts[0], { 
                from: accounts[0],
                value: web3.eth.gasPrice * 1000,
                gasPrice: web3.eth.gasPrice
            });
        }).then(function (result) {
            key = result.logs[0].args.key
            assert.equal(result.logs[0].event, "DataAdded", "The Log-Event should be DataAdded");
        })
    });

    it("should be possible to read data from the blockchain", function () {
        var instance;
        return storage.deployed().then(function (i) {
            instance = i;
            return instance.getData(key, { from: accounts[0] });
        }).then(function (result) {
            assert.equal(result, "value", "Data not added");
        })
    });
});