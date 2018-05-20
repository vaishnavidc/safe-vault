// var storage = artifacts.require("./Storage.sol");

// contract('Storage', function (accounts) {
//     it("should be possible to get gas", function () {
//         var instance;
//         return storage.deployed().then(function (i) {
//             instance = i;
//             return instance.addDataGas("key", "value", accounts[0], { from: accounts[0] });
//         }).then(function (result) {
//             console.log(result.logs[0].args.value)
//             assert.equal(result.logs[0].event, "Gas", "The Log-Event should be Gas");
//         })
//     });
// });