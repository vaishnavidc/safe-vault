import React, { Component } from 'react';
import { Tab, Tabs, Input, Row, Button, Col } from 'react-materialize';
import { Label } from 'react-bootstrap'
import { Nav, NavItem } from 'react-bootstrap';
import Textarea from 'react-expanding-textarea'

import getWeb3 from '../utils/getWeb3'

const factor = 1000000000000000000;

var storageContract
var mAccounts
var data = {
    key: '',
    value: '',
    address: ''
}
var currentState = 'Please select'

var web3 = null

var gasPriceInUSD = 0

class Write extends Component {
    constructor(props) {
        super(props);
        this.state = {
            gasLimit: 0,
            gasPrice: 0,
            transactionStateMessage: ''
        }
    }

    componentWillMount() {
        getWeb3
            .then(results => {
                web3 = results.web3
                this.instantiateContract()
                this.getEthToUSD()
            })
            .catch(() => {
                console.log('Error finding web3.')
            })
    }

    instantiateContract() {
        var contract = web3.eth.contract([{ "constant": false, "inputs": [{ "name": "_key", "type": "string" }, { "name": "_value", "type": "string" }, { "name": "_addressToCharge", "type": "address" }], "name": "addData", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "key", "type": "string" }, { "indexed": false, "name": "value", "type": "string" }], "name": "DataAdded", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "previousOwner", "type": "address" }, { "indexed": true, "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "constant": false, "inputs": [{ "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "constant": true, "inputs": [{ "name": "_key", "type": "string" }], "name": "getData", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }])
        storageContract = contract.at("0xee0d8ac2a97fbe516b1c2e83ea689762f6f21112");

        web3.eth.getAccounts((error, accounts) => {
            if (accounts.length == 0) {
                alert("Metamask not set up.")
            }
            mAccounts = accounts
            data.address = mAccounts[0]
            var accountInterval = setInterval(function () {
                if (web3.eth.accounts[0] !== mAccounts[0]) {
                    mAccounts = web3.eth.accounts;
                    alert("Please reload the page to reflect the changes.");
                }
            }, 100);
        })
    }

    getEthToUSD() {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var jObj = JSON.parse(this.responseText);
                gasPriceInUSD = parseInt(jObj.data.quotes.USD.price)
            }
        };
        xmlhttp.open("GET", "https://api.coinmarketcap.com/v2/ticker/1027/", true);
        xmlhttp.send();
    }

    estimateGas() {
        return storageContract.addData.estimateGas(data.key, data.value, data.address, ((error, result) => {
            console.log(error)
            console.log("Estimated gas: " + result)
            web3.eth.getGasPrice(((err, res) => {
                if (currentState === 'Average') {
                    this.setState({ gasPrice: res, gasLimit: result })
                }
                else if (currentState === 'Fast') {
                    this.setState({ gasPrice: res * 2, gasLimit: result })
                }
            }))
        }))
    }

    addData() {
        return storageContract.addData.estimateGas(data.key, data.value, data.address, {
            from: mAccounts[0],
            value: web3.toWei(this.state.gasPrice * this.state.gasLimit * 0.05, 'ether')
        }, ((error, result) => {
            web3.eth.getGasPrice(((err, res) => {
                if (currentState === 'Average') {
                    this.setState({ gasPrice: res, gasLimit: result })
                }
                else if (currentState === 'Fast') {
                    this.setState({ gasPrice: res * 2, gasLimit: result })
                }

                return storageContract.addData(data.key, data.value, data.address, {
                    from: data.address,
                    gas: this.state.gasLimit,
                    gasPrice: this.state.gasPrice,
                    value: this.state.gasPrice * this.state.gasLimit * 0.05
                }, ((error, result) => {
                    if (error === null) {
                        alert("Transaction has gone through. You can check the status at ropsten.etherscan.io/tx/" + result)
                        var event = storageContract.DataAdded()
                        event.watch((err, res) => {
                            if (err === null) {
                                this.setState({ transactionStateMessage: "Data has been saved in the blockchain. You can query data from the blockchain with this key." })
                                alert("Transaction has been mined.")
                            } else {
                                this.setState({ transactionStateMessage: "Please choose a unique key. This key already exists." })
                            }
                        })
                    }
                }))
            }))
        }))
    }

    submit(event) {
        event.preventDefault();
        if (data.key === ''
            || data.value === ''
            || data.address === ''
            || this.state.gasCostState === 'Please Select'
        ) {
            alert("All the fields are required");
            return
        }
        if (mAccounts.length == 0) {
            alert("Metamask not set up")
            return
        }
        else {
            this.addData()
        }
    }

    id1Handler(event) {
        data.key = event.target.value
        this.estimateGas()
    }

    id2Handler(event) {
        data.value = event.target.value
        this.estimateGas()
    }

    addressHandler(event) {
        data.address = event.target.value
        this.estimateGas()
    }

    gasCostHandler(event) {
        currentState = event.target.value
        if (currentState === 'Average' || currentState === 'Fast') {
            this.estimateGas()
        }
    }

    render() {
        return (
            <div>
                <form onSubmit={this.submit.bind(this)}>
                    <br />
                    <Row style={{ marginBottom: 0 }}>
                        <Input s={6} type='text' onChange={this.id1Handler.bind(this)} name='ID1' label="Key" />
                    </Row>
                    <Row style={{ marginBottom: 0 }}>
                        <div > Data: </div>
                        <Textarea rows="1" maxLength="3000" className="textarea" type='text' onChange={this.id2Handler.bind(this)} label="Value" name='ID2' />
                    </Row>
                    <Row style={{ marginBottom: 0 }}>
                        <div>Transaction Speed:</div>
                        <div >
                            <Input s={3} type='select' value={this.state.gasCostState} onChange={this.gasCostHandler.bind(this)} >
                                <option value='Please select'>Please select</option>
                                <option value='Fast'>Fast</option>
                                <option value='Average'>Average</option>
                            </Input>
                            <Label s={3} style={{ color: 'blue' }}>Transaction Cost: {(this.state.gasPrice * this.state.gasLimit + this.state.gasPrice * this.state.gasLimit * 0.05) / factor} ETH</Label>
                            <Label s={3} style={{ color: 'blue' }}> / {((this.state.gasPrice * this.state.gasLimit + this.state.gasPrice * this.state.gasLimit * 0.05) / factor) * gasPriceInUSD} USD</Label>
                        </div>
                    </Row >
                    <Row>
                        <Label style={{ color: 'blue' }}>{this.state.EntryID}</Label>
                    </Row>
                    <Button className="btn waves-effect waves-light" type="submit" name="action" title='submit' style={{ display: 'block', margin: 0 }}>Submit</Button>
                </form>
            </div>
        )
    }
}


export default (Write);
