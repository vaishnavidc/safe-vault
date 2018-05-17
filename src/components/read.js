import React, { Component } from 'react';
import { Input, Row, Button, Col } from 'react-materialize';

import getWeb3 from '../utils/getWeb3'

const contract = require('truffle-contract')

const factor = 1000000000000000000;

var storageContract
var deployedInstance
var mAccounts

var web3 = null

class Read extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id1: '',
            id2: '',
            entryId: ''
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
        var contract = web3.eth.contract([{ "constant": false, "inputs": [{ "name": "_id1", "type": "string" }, { "name": "_id2", "type": "string" }, { "name": "_addressToCharge", "type": "address" }], "name": "addData", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [{ "name": "id", "type": "bytes32" }], "name": "getData", "outputs": [{ "name": "", "type": "string" }, { "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "id", "type": "bytes32" }], "name": "DataAdded", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "previousOwner", "type": "address" }, { "indexed": true, "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }])
        storageContract = contract.at("0xa70adc7e42e54a32e66e93f410710b86ffd03872");

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

    getData() {
        return storageContract.getData.call(this.state.entryId, { from: mAccounts[0] }, ((error, result) => {
            console.log(result)
            console.log("ID1: " + result[0] + ", ID2: " + result[1])
            this.setState({ id1: result[0], id2: result[1] })
        }))
    }

    submit(event) {
        event.preventDefault();
        if (this.state.entryId === undefined) {
            alert("All the fields are required");
        }
        else {
            this.getData()
        }
    }

    EntryID(event) {
        this.setState({
            entryId: event.target.value
        })
    }

    render() {
        return (
            <div>
                <form onSubmit={this.submit.bind(this)}>
                    <br />
                    <Row>
                        <div > Data: </div>
                        <Col s={1}>ID1:</Col><Col s={5}>{this.state.id1}</Col>
                        <Col s={1}>ID2:</Col><Col s={5}>{this.state.id2}</Col>
                    </Row>
                    <Row s={12}>
                        <div > Entry ID: </div>
                        <Input s={6} type='text' name='EntryID' onChange={this.EntryID.bind(this)} label="Type ID here" />
                    </Row>
                    <Button className="btn waves-effect waves-light" type="submit" name="action" title='submit' style={{ display: 'block', margin: 0 }}>Submit</Button>
                </form>

            </div>
        )
    }
}


export default (Read);
