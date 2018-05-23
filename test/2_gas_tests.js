// var storage = artifacts.require("./Storage.sol");

// contract('Storage', function (accounts) {
//     it("should be possible to get gas", function () {
//         var instance;
//         return storage.deployed().then(function (i) {
//             instance = i;
//             return instance.addDataGas("key", "value", accounts[0], { 
//                 from: accounts[0],
//                 value: web3.eth.gasPrice * 1000,
//                 gasPrice: web3.eth.gasPrice
//             });
//         }).then(function (result) {
//             console.log(result.logs[0].args)
//             assert.equal(result.logs[0].event, "Gas", "The Log-Event should be Gas");
//         })
//     });
// });