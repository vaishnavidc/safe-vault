import React, { Component } from 'react';
import { Input, Row, Button, Col } from 'react-materialize';
import { Label } from 'react-bootstrap'
import nl2br from 'react-newline-to-break';
import CryptoJS from 'crypto-js';

import getWeb3 from '../utils/getWeb3'

const factor = 1000000000000000000;

// const contractAddress = '0xee0d8ac2a97fbe516b1c2e83ea689762f6f21112'
const contractAddress = '0xbdf49d6ecb6b608e7cd802e11f9a38d514140b50'

var storageContract
var deployedInstance
var mAccounts

var fileHash = ''

var web3 = null

var key = ''
var privateKey = ''

var keySize = 256;
var ivSize = 128;
var iterations = 100;

class Read extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: ''
        }
    }

    componentWillMount() {
        getWeb3
            .then(results => {
                web3 = results.web3
                this.instantiateContract()
            })
            .catch(() => {
                console.log('Error finding web3.')
            })
    }

    instantiateContract() {
        var contract = web3.eth.contract([{ "constant": false, "inputs": [{ "name": "_key", "type": "string" }, { "name": "_value", "type": "string" }, { "name": "_addressToCharge", "type": "address" }], "name": "addData", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "key", "type": "string" }, { "indexed": false, "name": "value", "type": "string" }], "name": "DataAdded", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "previousOwner", "type": "address" }, { "indexed": true, "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "constant": false, "inputs": [{ "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "constant": true, "inputs": [{ "name": "_key", "type": "string" }], "name": "getData", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }])
        storageContract = contract.at(contractAddress);

        web3.eth.getAccounts((error, accounts) => {
            if (accounts.length == 0) {
                alert("Metamask not set up.")
            }
            mAccounts = accounts
            var accountInterval = setInterval(function () {
                if (web3.eth.accounts[0] !== mAccounts[0]) {
                    mAccounts = web3.eth.accounts;
                    alert("Please reload the page.");
                }
            }, 100);
        })
    }

    decrypt(transitmessage, pass) {
        var salt = CryptoJS.enc.Hex.parse(transitmessage.substr(0, 32));
        var iv = CryptoJS.enc.Hex.parse(transitmessage.substr(32, 32))
        var encrypted = transitmessage.substring(64);

        var key = CryptoJS.PBKDF2(pass, salt, {
            keySize: keySize / 32,
            iterations: iterations
        });

        var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
            iv: iv,
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC

        })
        return decrypted;
    }

    getData() {
        return storageContract.getData.call(key, { from: mAccounts[0] }, ((error, result) => {
            console.log(result)
            var decrypted = this.decrypt(result, privateKey).toString(CryptoJS.enc.Utf8)
            console.log(decrypted)
            this.setState({ value: decrypted })
        }))
    }

    submit(event) {
        event.preventDefault();
        if (key == '' || privateKey == '') {
            alert("All fields are required");
        }
        else {
            this.getData()
        }
    }

    EntryID(event) {
        key = event.target.value
    }

    onHashCHange(event) {
        fileHash = event.target.value
    }

    privateKeyHandler(event) {
        privateKey = event.target.value
    }

    downloadFile(event) {
        event.preventDefault();
        var link = document.createElement("a");
        link.download = fileHash;
        link.href = "https://ipfs.io/ipfs/" + fileHash;
        document.body.appendChild(link);
        link.click();
    }

    render() {
        return (
            <div>
                <form onSubmit={this.submit.bind(this)}>
                    <br />
                    <Row>
                        <div > Data: </div>
                    </Row>
                    <p>
                        {nl2br(this.state.value)}
                    </p>
                    <Row s={12}>
                        <div > Input: </div>
                        <Input s={6} type='text' name='EntryID' onChange={this.EntryID.bind(this)} label="Enter Key here." />
                        <Input s={6} type='password' onChange={this.privateKeyHandler.bind(this)} name='privateKey' label="Enter Private key here." />
                    </Row>
                    <Button className="btn waves-effect waves-light" type="submit" name="action" title='submit' style={{ display: 'block', margin: 0 }}>Submit</Button>
                </form>

                <form onSubmit={this.downloadFile.bind(this)}>
                    <Row s={12}>
                        <Input s={6} type='text' name='FileHash' onChange={this.onHashCHange.bind(this)} label="Enter file hash here." />
                    </Row>
                    <Button className="btn waves-effect waves-light" type="submit" name="action" title='submit' style={{ display: 'block', margin: 0 }}>Download file</Button>
                </form>

            </div>
        )
    }
}

export default (Read);
