import React, { Component } from 'react';
import { Input, Row, Button, Col } from 'react-materialize';
import { Label } from 'react-bootstrap'
import nl2br from 'react-newline-to-break';

import getWeb3 from '../utils/getWeb3'

const factor = 1000000000000000000;

// const contractAddress = '0xee0d8ac2a97fbe516b1c2e83ea689762f6f21112'
const contractAddress = '0xbdf49d6ecb6b608e7cd802e11f9a38d514140b50'

var storageContract
var deployedInstance
var mAccounts

var web3 = null

class Read extends Component {
    constructor(props) {
        super(props);
        this.state = {
            key: '',
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

    getData() {
        console.log(this.state.key)
        return storageContract.getData.call(this.state.key, { from: mAccounts[0] }, ((error, result) => {
            console.log(result)
            this.setState({ value: result })
        }))
    }

    formatText() {

    }

    submit(event) {
        event.preventDefault();
        if (this.state.key === undefined) {
            alert("Key is required");
        }
        else {
            this.getData()
        }
    }

    EntryID(event) {
        this.setState({
            key: event.target.value
        })
    }

    NewLineToBr({children = ""}){
        return children.split('\n').reduce(function (arr,line) {
          return arr.concat(
            line,
            <br />
          );
        },[]);
      }

    render() {
        return (
            <div>
                <form onSubmit={this.submit.bind(this)}>
                    <br />
                    <Row>
                        <div > Data: </div>
                        {/* <Col s={1}>Value:</Col> */}
                    </Row>
                    {/* <Row> */}
                        {/* <Label rows="1" maxLength="3000" className="textarea" type='text' s={5}>{this.state.value}</Label> */}
                        <p>
                            {nl2br(this.state.value)}
                        </p>
                    {/* </Row> */}
                    <Row s={12}>
                        <div > Key: </div>
                        <Input s={6} type='text' name='EntryID' onChange={this.EntryID.bind(this)} label="Enter key here." />
                    </Row>
                    <Button className="btn waves-effect waves-light" type="submit" name="action" title='submit' style={{ display: 'block', margin: 0 }}>Submit</Button>
                </form>

            </div>
        )
    }
}

export default (Read);
