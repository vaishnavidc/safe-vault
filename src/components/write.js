import React, { Component } from 'react';
import { Tab, Tabs, Input, Row, Button, Col } from 'react-materialize';
import { Label } from 'react-bootstrap'
import { Nav, NavItem } from 'react-bootstrap';
import Textarea from 'react-expanding-textarea'
import CryptoJS from 'crypto-js';
import FileEncryptor from 'file-encryptor'

import getWeb3 from '../utils/getWeb3'
import Config from '../config/config'

import ipfs from '../ipfs';

const factor = 1000000000000000000;

// Current test contract
const contractAddress = '0xd65e45f8cd1ea771149c5fce10f551e4a5ef41cd'

// Contract instance
var storageContract

// Accounts
var mAccounts

// Data object
var data = {
    key: '',
    value: '',
    ipfsHash: ''
}

// Encrypted Data object
var encryptedData = {
    value: '',
    ipfsHash: ''
}

// Web3 instance
var web3 = null

// Gas price on the blockchain
var gasPrice = 0
// Fee to be charged to the user
var feeToCharge = 0

// Private key of the user (used for encryption)
var privateKey = ''

// Encryption parameters
var keySize = 256;
var ivSize = 128;
var iterations = 100;

class Write extends Component {
    constructor(props) {
        super(props);
        this.state = {
            gasLimit: 0,
            transactionStateMessage: '',
            buffer: '',
            currentStatus: ''
        }
    }

    componentWillMount() {
        getWeb3
            .then(results => {
                web3 = results.web3
                this.instantiateContract()
                this.getGasPrice()
            })
            .catch(() => {
                console.log('Error finding web3.')
            })
    }

    instantiateContract() {
        var contract = web3.eth.contract([{ "constant": false, "inputs": [{ "name": "_key", "type": "string" }, { "name": "_value", "type": "string" }, { "name": "_fileHash", "type": "string" }], "name": "addData", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [], "name": "WEI_T0_ETH_RATE", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "ETHToUSDExchangeRate", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "dataWriteCharge", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_charge", "type": "uint256" }], "name": "setDataWriteCharge", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "_key", "type": "string" }], "name": "getData", "outputs": [{ "name": "", "type": "string" }, { "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_charge", "type": "uint256" }], "name": "setFileUploadCharge", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_exchangeRate", "type": "uint256" }], "name": "setExchangeRate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "fileUploadCharge", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "key", "type": "string" }, { "indexed": false, "name": "value", "type": "string" }, { "indexed": false, "name": "fileHash", "type": "string" }], "name": "DataAdded", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "previousOwner", "type": "address" }, { "indexed": true, "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }])
        storageContract = contract.at(contractAddress);

        web3.eth.getAccounts((error, accounts) => {
            if (accounts.length == 0) {
                alert("Metamask not set up.")
            }
            mAccounts = accounts
            var accountInterval = setInterval(function () {
                if (web3.eth.accounts[0] !== mAccounts[0]) {
                    mAccounts = web3.eth.accounts;
                    alert("Please reload the page to reflect the changes.");
                }
            }, 100);
        })
    }

    encrypt(msg, pass) {
        var salt = CryptoJS.lib.WordArray.random(128 / 8);
        var key = CryptoJS.PBKDF2(pass, salt, {
            keySize: keySize / 32,
            iterations: iterations
        });

        var iv = CryptoJS.lib.WordArray.random(128 / 8);
        var encrypted = CryptoJS.AES.encrypt(msg, key, {
            iv: iv,
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC

        });

        var transitmessage = salt.toString() + iv.toString() + encrypted.toString();
        return transitmessage;
    }

    estimateGas() {
        if (data.value != '' && data.ipfsHash != '') {
            feeToCharge = (Config.fileUploadCharge / Config.ETHToUSDExchangeRate + Config.dataWriteCharge / Config.ETHToUSDExchangeRate)
            encryptedData.value = this.encrypt(data.value, privateKey)
            encryptedData.ipfsHash = this.encrypt(data.ipfsHash, privateKey)
        } else if (data.value != '' && data.ipfsHash == '') {
            feeToCharge = Config.dataWriteCharge / Config.ETHToUSDExchangeRate
            encryptedData.value = this.encrypt(data.value, privateKey)
        } else if (data.value == '' && data.ipfsHash != '') {
            feeToCharge = Config.fileUploadCharge / Config.ETHToUSDExchangeRate
            encryptedData.ipfsHash = this.encrypt(data.ipfsHash, privateKey)
        }

        return storageContract.addData.estimateGas(data.key, encryptedData.value, encryptedData.ipfsHash, {
            from: mAccounts[0],
            value: web3.toWei(feeToCharge, 'ether'),
            gasPrice: gasPrice
        }, ((error, result) => {
            if (error != null) {
                console.log(error)
            } else {
                console.log("Estimated startGas: " + result)
                this.setState({ gasLimit: result })
                this.setState({ currentStatus: "Gas estimated." })
                this.openConfirmationDialog()
            }
        }))
    }

    getGasPrice() {
        web3.eth.getGasPrice(((err, res) => {
            console.log("gasPrice: " + res)
            gasPrice = res
        }))
    }

    addData() {
        if (data.ipfsHash != '') {
            encryptedData.ipfsHash = this.encrypt(data.ipfsHash, privateKey)
        }
        return storageContract.addData(data.key, encryptedData.value, encryptedData.ipfsHash, {
            from: mAccounts[0],
            gas: this.state.gasLimit,
            gasPrice: gasPrice,
            value: web3.toWei(feeToCharge, 'ether')
        }, ((error, result) => {
            if (error === null) {
                this.setState({ currentStatus: "Transaction has gone through." })
                alert("Transaction has gone through. You can check the status at ropsten.etherscan.io/tx/" + result)
                var event = storageContract.DataAdded()
                event.watch((err, res) => {
                    if (err === null) {
                        this.setState({ currentStatus: "Transaction has been mined." })
                        alert("Transaction has been mined.")
                    }
                })
            }
        }))

    }

    onSaveData(event) {
        event.preventDefault();
        this.setState({ currentStatus: "Estimating gas.." })
        if (data.value === '' && this.state.buffer == '') {
            alert("Please enter data or select file to upload")
            return
        }
        if (data.key === ''
            || mAccounts[0] === ''
            || privateKey === ''
        ) {
            alert("All the fields are required");
            return
        }
        if (mAccounts.length == 0) {
            alert("Metamask not set up")
            return
        }

        this.estimateGas()
    }

    openConfirmationDialog() {
        var retVal = confirm("Transaction cost will be " + (((gasPrice * this.state.gasLimit) / factor + feeToCharge) * Config.ETHToUSDExchangeRate).toString() + " USD " + "Do you want to continue ?");
        if (retVal == true) {
            if (data.ipfsHash != 0) {
                this.setState({ currentStatus: "Uploading file.." })
                this.uploadFile()
            }
            else {
                this.setState({ currentStatus: "Adding data.." })
                this.addData()
            }
            return true;
        }
        else {
            return false;
        }
    }

    onKeyChange(event) {
        data.key = event.target.value
    }

    onValueChange(event) {
        data.value = event.target.value
    }

    onPrivateKeyChange(event) {
        privateKey = event.target.value
    }

    uploadFile = async () => {
        await ipfs.add(this.state.buffer, (err, ipfsHash) => {
            if (err == null) {
                data.ipfsHash = ipfsHash[0].hash
                console.log(data.ipfsHash)
                this.setState({ currentStatus: "Adding data.." })
                this.addData()
            } else {
                console.log(err);
            }
        })
    };

    captureFile = (event) => {
        event.stopPropagation()
        event.preventDefault()
        const file = event.target.files[0]
        let reader = new window.FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadend = () => this.convertToBuffer(reader)
    };

    convertToBuffer = async (reader) => {
        const buffer = await Buffer.from(reader.result);
        this.setState({ buffer: buffer });
        data.ipfsHash = 'QmVunwR4mvC4F5eTYWCGU3Baq9kmaTyRPot6nRGp24D4aJ'
    };

    render() {
        return (
            <div>
                <form onSubmit={this.onSaveData.bind(this)}>
                    <br />
                    <Row style={{ marginBottom: 0 }}>

                        <Col s={3}></Col>
                        <Col s={6}>
                            <Label style={{ color: 'blue' }}>{this.state.currentStatus}</Label>
                            <Label style={{ color: 'blue' }}>Please enter a key that you can use later to read back your information, this is like an index key</Label>
                            <br />
                            <Input s={12} type='text' onChange={this.onKeyChange.bind(this)} name='ID1' label="Enter Key here" />
                            <Label style={{ color: 'blue' }}>Either type or copy and paste any text here that you would like stored and encrypted on the blockchain</Label>
                            <div > Data: </div>
                            <textarea rows="30" style={{ "height": "250px", "maxHeight": "700px" }} maxLength="3000" className="textarea" type='text' onChange={this.onValueChange.bind(this)} label="Value" name='ID2' />
                            <Label style={{ color: 'blue' }}>Please select a document, preferably a pdf, to store and upload. The document will be encrypted to protect it</Label>
                            <br />
                            <input
                                type="file"
                                onChange={this.captureFile}
                            />
                            <br />
                            <br />
                            <Label style={{ color: 'blue' }}>Please enter a password here that will be ued to encrypt your data and file. Do not forget this password as you will need it to read your data or file later</Label>
        
                            <Input s={12} type="password" onChange={this.onPrivateKeyChange.bind(this)} name='privateKey' label="Enter Private Key here (used to encrypt data)" />
                            <Button className="btn waves-effect waves-light" type="submit" name="action" title='submit' style={{ display: 'block', margin: 0, backgroundColor: '#004EFF' }}>Save Data</Button>
                        </Col>
                        <Col s={3}></Col>
                    </Row>
                </form>
            </div>
        )
    }
}


export default (Write);
