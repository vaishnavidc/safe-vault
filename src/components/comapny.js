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
            web3: null
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
                console.log(mAccounts)
            })
        })
    }

    submit(event) {
        event.preventDefault();
        if (this.refs.ID1.state.value === undefined || this.refs.ID2.state.value === undefined || this.refs.Address.state.value === undefined || this.refs.PrivateKey.state.value === undefined || this.refs.EntryID.state.value === undefined ) {
            alert("All the fields are required");
        }
        else {
            let Obj = {
                ID1: this.refs.ID1.state.value,
                ID2: this.refs.ID2.state.value,
                address: this.refs.Address.state.value,
                privateKey: this.refs.PrivateKey.state.value,
                entryId: this.refs.EntryID.state.value,
                gasCost : this.refs.GasCost.state.value
            }
            // aapky kaam ka object
            console.log(Obj);
        }
    }

    readClicked(event){
        event.preventDefault();
        if (this.refs.ID1.state.value === undefined || this.refs.ID2.state.value === undefined || this.refs.EntryID.state.value === undefined ) {
            alert("All the fields are required");
        }
        else {
            let Obj = {
                ID1: this.refs.ID1.state.value,
                ID2: this.refs.ID2.state.value,
                entryId: this.refs.EntryID.state.value,
            }
            // aapky kaam ka object
            console.log(Obj);
        }
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
                                <Input s={3} type='select' defaultValue='Average' ref="GasCost">
                                <option value='Fast'>Fast</option>
                                <option value='Average'>Average</option>
                                <option value='Custom'>Custom</option>
                                </Input>
                            </Row >
                            <Row style={{marginBottom : 0}}>
                            <div > Entry ID: </div>
                                <Input s={6} type='text' ref='EntryID' name='EntryID' label="Type ID here" />
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
                                <Input s={6} type='text' ref='ID1' name='ID1' label="ID 1" />
                                <Input s={6} type='text' ref='ID2' label="ID 2" name='ID2' />
                            </Row>
                            <Row s={12}>
                            <div > Entry ID: </div>
                                <Input s={6} type='text' ref='EntryID' name='EntryID' label="Type ID here" />
                            </Row>
                            <Button className="btn waves-effect waves-light" type="submit" name="action" title='submit' style={{ display: 'block', margin : 0}}>Submit</Button>
                        </form>
                    </Tab>
                </Tabs>

            </div>
        )
    }
}

// function mapStateToProp(state) {
//     console.log(state)
//     return ({
//         user: state.root.currentUser,
//         userID: state.root.userID
//     })
// }


// function mapDispatchToProp(dispatch) {
//     return ({
//         pushAdsToFirebase: (adInfo, uid) => {
//             dispatch(pushAdsToFirebase(adInfo, uid))
//         }
//     })
// }

export default (Company);
