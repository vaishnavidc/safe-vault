import React, { Component } from 'react';
import { Tab, Tabs, Input, Row, Button, Col } from 'react-materialize';
import {Label} from 'react-bootstrap'

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
    address: ''
}
var currentState = 'Please select'
var web3 = null

class Company extends Component {
    constructor(props) {
        super(props);
        this.state = {
            gasLimit: 0,
            gasPrice: 0,
            EntryID : '',
            ID1Read : '',
            ID2Read : ''
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
        let gasEstimate
        return this.estimateGas()
            .then(() => {
                return deployedInstance.addData(data.id1, data.id2, data.address, {
                    from: data.address,
                    gas: this.state.gasLimit,
                    gasPrice: this.state.gasPrice,
                    value: this.state.gasPrice * this.state.gasLimit * 0.05
                })
            })
            .then((result) => {
                console.log("The entry ID is: " + result.logs[0].args.id)
                this.setState({ EntryID: result.logs[0].args.id })
            })
    }

    getData(entryId) {
        return deployedInstance.getData.call(entryId, { from: mAccounts[0] })
            .then((result) => {
                console.log("ID1: " + result[0] + ", ID2: " + result[1])
                this.setState({ ID1Read: result[0], ID2Read: result[1] })
            })
    }

    writeSubmit(event) {
        event.preventDefault();
        if (this.refs.ID1.state.value === undefined
            || this.refs.ID2.state.value === undefined
            // || this.refs.Address.state.value === undefined 
            // || this.refs.PrivateKey.state.value === undefined 
            || this.state.EntryID === undefined
            || this.state.gasCostState === 'Please Select'
        ) {
            alert("All the fields are required");
        }
        else {
            this.addData()
        }
    }

    readSubmit(event){
        event.preventDefault();
        if (this.refs.EntryIDRead.state.value === undefined) {
            alert("All the fields are required");
        }
        else {
            let Obj = {
                ID1: this.state.ID1Read,
                ID2: this.state.ID2Read,
                entryId: this.refs.EntryIDRead.state.value,
            }
            console.log(Obj);
            this.getData(Obj.entryId)
        }
    }

    dropdownChanged(event) {
        event.preventDefault();

        currentState = event.target.value
        if (event.target.value === 'Average' || event.target.value === 'Fast') {
            document.getElementById('editTitle').value = 0;
            document.getElementById('editTitle').disabled = true;
            data = {
                id1: this.refs.ID1.state.value,
                id2: this.refs.ID2.state.value,
                // address: this.refs.Address.state.value
                address: mAccounts[0]
            }
            this.estimateGas()
        }
        else if (event.target.value === 'Custom') {
            document.getElementById('editTitle').disabled = false
            data = {
                id1: this.refs.ID1.state.value,
                id2: this.refs.ID2.state.value,
                // address: this.refs.Address.state.value
                address: mAccounts[0]
            }
            this.estimateGas()
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
                        <form onSubmit={this.writeSubmit.bind(this)}>
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
                                <Input s={3} type='select' ref='GasCost' onChange = {this.dropdownChanged.bind(this)}>
                                <option value='Please select'>Please select</option>
                                <option value='Fast'>Fast</option>
                                <option value='Average'>Average</option>
                                <option value='Custom' >Custom</option>
                                </Input>
                                
                                <Input s={3} type='number' id={'editTitle'} defaultValue = '0' ref = 'customStateValue' name='customStateValue' label="Enter gas price" disabled />
                                <Label s={3} style={{ color: 'blue' }}>Cost: {(this.state.gasPrice * this.state.gasLimit + this.state.gasPrice * this.state.gasLimit * 0.05) / factor} ETH</Label>

                                </div>
                            </Row >
                            <Row>
                            <div > Entry ID: </div>
                            <Label style = {{color : 'blue'}}>{this.state.EntryID}</Label>
                            </Row>
                            <Button className="btn waves-effect waves-light" type="submit" name="action" title='submit' style={{ display: 'block', margin : 0}}>Submit</Button>
                        </form>
                    </Tab>
                    {/* Read Tab */}
                    <Tab title="Read" >
                    <form onSubmit={this.readSubmit.bind(this)}>
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