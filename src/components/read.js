import React, { Component } from 'react';
import { Input, Row, Button, Col } from 'react-materialize';

import getWeb3 from '../utils/getWeb3'
import StorageContract from '../../build/contracts/Storage.json'

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
            id1 : '',
            id2 : '',
            entryId : ''
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
            })
        })
    }

    getData() {
        return deployedInstance.getData.call(this.state.entryId, { from: mAccounts[0] })
            .then((result) => {
                console.log("ID1: " + result[0] + ", ID2: " + result[1])
                this.setState({ id1: result[0], id2: result[1] })
            })
    }

    submit(event){
        event.preventDefault();
        if (this.state.entryId === undefined) {
            alert("All the fields are required");
        }
        else {
            this.getData()
        }
    }

//EntryID handler
EntryID(event){
    this.setState({
        entryId : event.target.value
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
                                <Input s={6} type='text' name='EntryID' onChange = {this.EntryID.bind(this)} label="Type ID here" />
                            </Row>
                            <Button className="btn waves-effect waves-light" type="submit" name="action" title='submit' style={{ display: 'block', margin : 0}}>Submit</Button>
                        </form>

            </div>
        )
    }
}


export default (Read);
