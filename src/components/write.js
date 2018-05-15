import React, { Component } from 'react';
import { Tab, Tabs, Input, Row, Button, Col } from 'react-materialize';
import { Label } from 'react-bootstrap'
import { Nav, NavItem } from 'react-bootstrap';

import getWeb3 from '../utils/getWeb3'
import StorageContract from '../../build/contracts/Storage.json'

const contract = require('truffle-contract')

const factor = 1000000000000000000;

var storageContract
var deployedInstance
var mAccounts
var customGasPrice = 0
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
        storageContract = contract(StorageContract)
        storageContract.setProvider(web3.currentProvider)

        web3.eth.getAccounts((error, accounts) => {
            storageContract.deployed().then((instance) => {
                deployedInstance = instance
                mAccounts = accounts
                data.address = mAccounts[0]
            })
        })
    }

    estimateGas() {
        return deployedInstance.addData.estimateGas(data.id1, data.id2, data.address)
            .then((result) => {
                if (currentState === 'Average') {
                    this.setState({ gasPrice: web3.eth.gasPrice, gasLimit: result })
                }
                else if (currentState === 'Fast') {
                    this.setState({ gasPrice: web3.eth.gasPrice * 2, gasLimit: result })
                }
                else if (currentState === 'Custom') {
                    this.setState({ gasPrice: customGasPrice, gasLimit: result })
                }
            })
    }

    addData() {
        console.log(this.state.gasPrice * this.state.gasLimit * 0.05)
        return deployedInstance.addData(data.id1, data.id2, data.address, {
            from: data.address,
            gas: this.state.gasLimit,
            gasPrice: this.state.gasPrice
            // value: this.state.gasPrice * this.state.gasLimit * 0.05
        })
        .then((result) => {
            console.log("The entry ID is: " + result.logs[0].args.id)
            this.setState({ EntryID: result.logs[0].args.id })
        })
    }

    submit(event) {
        event.preventDefault();
        if (data.id1 === undefined
            || data.id2 === undefined
            // || data.address === undefined 
            // || data.private === undefined 
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
            document.getElementById('editTitle').disabled = true;
            this.estimateGas()
        }
        else if (currentState === 'Custom') {
            document.getElementById('editTitle').disabled = false
            this.estimateGas()
        }
    }
    customStateValueHandler(event) {
        customGasPrice = event.target.value
        this.estimateGas()
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
                    <Row style={{ marginBottom: 0 }}>
                        <div>Credentials:</div>
                        <Input s={6} type='text' value={this.state.address} onChange={this.addressHandler.bind(this)} name='Address' label="Address" />
                        <Input s={6} type='text' value={this.state.privateKey} onChange={this.privateKeyHandler.bind(this)} label="Private Key" name='PrivateKey' />
                    </Row>
                    <Row style={{ marginBottom: 0 }}>
                        <div>Transaction Options:</div>
                        <div >
                            <Input s={3} type='select' value={this.state.gasCostState} onChange={this.gasCostHandler.bind(this)} >
                                <option value='Please select'>Please select</option>
                                <option value='Fast'>Fast</option>
                                <option value='Average'>Average</option>
                                <option value='Custom' >Custom</option>
                            </Input>

                            <Input s={3} type='number' id={'editTitle'} value={this.state.customStateValue} name='customStateValue' onChange={this.customStateValueHandler.bind(this)} label="Enter gas price (gwei)" disabled />
                            <Label s={3} style={{ color: 'blue' }}>Cost: {(this.state.gasPrice * this.state.gasLimit + this.state.gasPrice * this.state.gasLimit * 0.05) / factor} ETH</Label>

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
