import React, { Component } from 'react';
import { Tab, Tabs, Input, Row, Button, Col } from 'react-materialize';
import { Label } from 'react-bootstrap'
import { Nav, NavItem } from 'react-bootstrap';

import getWeb3 from '../utils/getWeb3'

const factor = 1000000000000000000;

var storageContract
var mAccounts
var data = {
    id1: '',
    id2: '',
    address: '',
    privateKey: ''
}
var currentState = 'Please select'

var web3 = null

class Write extends Component {
    constructor(props) {
        super(props);
        this.state = {
            gasLimit: 0,
            gasPrice: 0
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
        var contract = web3.eth.contract([ { "constant": false, "inputs": [ { "name": "_id1", "type": "string" }, { "name": "_id2", "type": "string" }, { "name": "_addressToCharge", "type": "address" } ], "name": "addData", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [ { "name": "id", "type": "bytes32" } ], "name": "getData", "outputs": [ { "name": "", "type": "string" }, { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "id", "type": "bytes32" } ], "name": "DataAdded", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "previousOwner", "type": "address" }, { "indexed": true, "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" } ])
        storageContract = contract.at("0xa70adc7e42e54a32e66e93f410710b86ffd03872");

        web3.eth.getAccounts((error, accounts) => {
            if (accounts.length == 0) {
                alert("Metamask not set up.")
            }
            mAccounts = accounts
            data.address = mAccounts[0]
            var accountInterval = setInterval(function() {
                if (web3.eth.accounts[0] !== mAccounts[0]) {
                    mAccounts = web3.eth.accounts;
                    alert("Please reload the page to reflect the changes.");
                }
              }, 100);
        })
    }

    estimateGas(flag) {
        return storageContract.addData.estimateGas(data.id1, data.id2, data.address, ((error, result) => {
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
        return storageContract.addData.estimateGas( data.id1, data.id2, data.address, {
            from: mAccounts[0],
            value: web3.toWei(this.state.gasPrice * this.state.gasLimit * 0.05, 'ether')
        }, ((error, result) => {
            console.log("Estimated gas: " + result)
            web3.eth.getGasPrice(((err, res) => {
                if (currentState === 'Average') {
                    this.setState({ gasPrice: res, gasLimit: result })
                }
                else if (currentState === 'Fast') {
                    this.setState({ gasPrice: res * 2, gasLimit: result })
                }

                return storageContract.addData(data.id1, data.id2, data.address, {
                    from: data.address,
                    gas: this.state.gasLimit,
                    gasPrice: this.state.gasPrice,
                    value: this.state.gasPrice * this.state.gasLimit * 0.05
                }, ((error, result) => {
                    console.log(error)
                    if (error === null) {
                        alert("Transaction has gone through. You can check the status at ropsten.etherscan.io/tx/" + result)
                        console.log("Transaction has gone through. You can check the status on ropsten.etherscan.io/tx/" + result)
                        var event = storageContract.DataAdded()
                        event.watch((err, res) => {
                            if (err === null) {
                                console.log(res.args.id)
                                this.setState({ EntryID: res.args.id })
                                alert("Transaction has been mined.")
                            }
                        })
                    }
                }))
            }))
        })) 
    }

    submit(event) {
        event.preventDefault();
        if (mAccounts.length == 0) {
            alert("Metamask not set up")
            return
        }
        if (data.id1 === undefined
            || data.id2 === undefined
            || this.state.gasCostState === 'Please Select'
        ) {
            alert("All the fields are required");
        }
        else {
            this.addData()
        }
    }

    id1Handler(event) {
        data.id1 = event.target.value
        this.estimateGas()
    }

    id2Handler(event) {
        data.id2 = event.target.value
        this.estimateGas()
    }

    addressHandler(event) {
        data.address = event.target.value
        this.estimateGas()
    }

    privateKeyHandler(event) {
        data.privateKey = event.target.value
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
                        <div > Data: </div>
                        <Input s={6} type='text' value={this.state.id1} onChange={this.id1Handler.bind(this)} name='ID1' label="ID 1" />
                        <Input s={6} type='text' value={this.state.id2} onChange={this.id2Handler.bind(this)} label="ID 2" name='ID2' />
                    </Row>
                    {/* <Row style={{ marginBottom: 0 }}>
                        <div>Credentials:</div>
                        <Input s={6} type='text' value={this.state.address} onChange={this.addressHandler.bind(this)} name='Address' label="Address" />
                        <Input s={6} type='text' value={this.state.privateKey} onChange={this.privateKeyHandler.bind(this)} label="Private Key" name='PrivateKey' />
                    </Row> */}
                    <Row style={{ marginBottom: 0 }}>
                        <div>Transaction Speed:</div>
                        <div >
                            <Input s={3} type='select' value={this.state.gasCostState} onChange={this.gasCostHandler.bind(this)} >
                                <option value='Please select'>Please select</option>
                                <option value='Fast'>Fast</option>
                                <option value='Average'>Average</option>
                            </Input>
                            <Label s={3} style={{ color: 'blue' }}>Transaction Cost: {(this.state.gasPrice * this.state.gasLimit + this.state.gasPrice * this.state.gasLimit * 0.05) / factor} ETH</Label>
                        </div>
                    </Row >
                    <Row>
                        <div > Entry ID: </div>
                        <Label style={{ color: 'blue' }}>{this.state.EntryID}</Label>
                    </Row>
                    <Button className="btn waves-effect waves-light" type="submit" name="action" title='submit' style={{ display: 'block', margin: 0 }}>Submit</Button>
                </form>
            </div>
        )
    }
}


export default (Write);
