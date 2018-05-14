import React, { Component } from 'react';
import { Tab, Tabs, Input, Row, Button, Col } from 'react-materialize';

import getWeb3 from '../utils/getWeb3'
import StorageContract from '../../build/contracts/Storage.json'

const contract = require('truffle-contract')

var storageContract
var deployedInstance
var mAccounts

class Company extends Component {
    constructor(props) {
        super(props);

        this.state = {
            web3: null,
            gasCostState: 'Average',
            customStateValue: 0,
            EntryID: 'ID',
            ID1Read: '123213',
            ID2Read: '23421rf223'
        }
    }

    componentWillMount() {
        getWeb3
            .then(results => {
                this.setState({
                    web3: results.web3
                })
                this.instantiateContract()
            })
            .catch(() => {
                console.log('Error finding web3.')
            })
    }

    instantiateContract() {
        storageContract = contract(StorageContract)
        storageContract.setProvider(this.state.web3.currentProvider)

        this.state.web3.eth.getAccounts((error, accounts) => {
            storageContract.deployed().then((instance) => {
                deployedInstance = instance
                mAccounts = accounts
            })
        })
    }

    addData(data) {
        let gasEstimate
        deployedInstance.addData.estimateGas(data.ID1, data.ID2, data.address)
            .then((result) => {
                gasEstimate = result * 2
                console.log("Estimated gas to add an apartment: " + gasEstimate)
            })
            .then((result) => {
                deployedInstance.addData.estimateGas(data.ID1, data.ID2, data.address, {
                    from: mAccounts[0],
                    gas: gasEstimate,
                    gasPrice: this.state.web3.eth.gasPrice
                })
            })
            .then((result) => {
                //TODO Update entry ID
            })
    }

    getData(entryId) {
        deployedInstance.getData.call(entryId, { from: mAccounts[0] })
            .then((result) => {
                //TODO Update ID1 and ID2
            })
    }

    writeSubmit(event) {
        event.preventDefault();
        if (this.refs.ID1.state.value === undefined || this.refs.ID2.state.value === undefined || this.refs.Address.state.value === undefined || this.refs.PrivateKey.state.value === undefined || this.state.EntryID === undefined) {
            alert("All the fields are required");
        }
        else {
            let Obj = {
                ID1: this.refs.ID1.state.value,
                ID2: this.refs.ID2.state.value,
                address: this.refs.Address.state.value,
                privateKey: this.refs.PrivateKey.state.value,
                entryId: this.state.EntryID,
                gasCost: this.refs.GasCost.state.value,
                customStateValue: this.refs.customStateValue.state.value
            }
            // aapky kaam ka object
            console.log(Obj);
            this.addData(Obj)
        }
    }

    readSubmit(event) {
        event.preventDefault();
        if (this.refs.EntryIDRead.state.value === undefined ) {
            alert("All the fields are required");
        }
        else {
            let Obj = {
                ID1: this.state.ID1Read,
                ID2: this.state.ID2Read,
                entryId: this.refs.EntryIDRead.state.value,
            }
            // aapky kaam ka object
            console.log(Obj);
            this.getData(Obj.entryId)
        }
    }

    dropdownChanged(event){
        if(event.target.value === 'Average' || event.target.value === 'Fast'){
            document.getElementById('editTitle').value = 0;
            document.getElementById('editTitle').disabled = true;

        }
        else if(event.target.value === 'Custom'){
            document.getElementById('editTitle').disabled = false
        }
    }

    customStateValue(event){
        console.log(this, event.target.value)
        this.setState({
            customStateValue : event.target.value
        })
    }

    render() {
        return (
            <div>
                <Tabs className='tab-demo z-depth-1' active>
                    <Tab title="Write" active>
                        <form onSubmit={this.submit.bind(this)}>
                            <br />
                            <Row style={{marginBottom : 0}}>
                            <div > Data: </div>
                                <Input s={6} type='text' ref='ID1' name='ID1' label="ID 1" />
                                <Input s={6} type='text' ref='ID2' label="ID 2" name='ID2' />
                            </Row>
                            <Row style={{marginBottom : 0}}>
                            <div>Credentials:</div>
                            <Input s={6} type='text' ref='Address' name='Address' label="Address" />
                            <Input s={6} type='text' ref='PrivateKey' label="Private Key" name='PrivateKey' />
                            </Row>
                            <Row style={{marginBottom : 0}}>
                                <div>Transaction Gas Cost:</div>
                                <div >
                                <Input s={3} type='select' ref='GasCost' label='GasCost : 10' onChange = {this.dropdownChanged.bind(this)}>
                                <option value='Fast'>Fast</option>
                                <option value='Average'>Average</option>
                                <option value='Custom' >Custom</option>
                                </Input>
                                
                                <Input s={3} type='text' id={'editTitle'} defaultValue = '0' ref = 'customStateValue' name='customStateValue' label="Enter Here" disabled />
                                
                                </div>
                            </Row >
                            <Row>
                            <div > Entry ID: </div>
                            {/* <Label style = {{color : 'blue'}}>{this.state.EntryID}</Label> */}
                            </Row>
                            <Button className="btn waves-effect waves-light" type="submit" name="action" title='submit' style={{ display: 'block', margin : 0}}>Submit</Button>
                        </form>
                    </Tab>
                    {/* Read Tab */}
                    <Tab title="Read">
                    <form onSubmit={this.readClicked.bind(this)}>
                            <br />
                            <Row>
                            <div > Data: </div>
                            <Col s={1}>ID1:</Col><Col s={5}>{this.state.ID1Read}</Col>
                            <Col s={1}>ID2:</Col><Col s={5}>{this.state.ID2Read}</Col>
                            </Row>
                            <Row s={12}>
                            <div > Entry ID: </div>
                                <Input s={6} type='text' ref='EntryIDRead' name='EntryID' label="Type ID here" />
                            </Row>
                            <Button className="btn waves-effect waves-light" type="submit" name="action" title='submit' style={{ display: 'block', margin : 0}}>Submit</Button>
                        </form>
                    </Tab>
                </Tabs>

            </div>
        )
    }
}

export default (Company);
