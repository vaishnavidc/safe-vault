var storage = artifacts.require("./Storage.sol");

contract('Storage', function (accounts) {
    var id;
    it("should be possible to add data to the blockchain", function () {
        var instance;
        return storage.deployed().then(function (i) {
            instance = i;
            return instance.addData("ID1", "ID2", accounts[0], { from: accounts[0] });
        }).then(function (result) {
            id = result.logs[0].args.id
            assert.equal(result.logs[0].event, "DataAdded", "The Log-Event should be DataAdded");
        })
    });

    it("should be possible to read data from the blockchain", function () {
        var instance;
        return storage.deployed().then(function (i) {
            instance = i;
            return instance.getData(id, { from: accounts[0] });
        }).then(function (result) {
            assert.equal(result[0], "ID1", "Data not added");
            assert.equal(result[1], "ID2", "Data not added");
        })
    });
});