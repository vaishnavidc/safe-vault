import React, { Component } from 'react'
import { BrowserRouter, Route } from 'react-router-dom'

import StorageContract from '../build/contracts/Storage.json'
import getWeb3 from './utils/getWeb3'

import Home from './components/home'
import Artist from './components/artist'

const contract = require('truffle-contract')

var storageContract
var deployedInstance
var mAccounts

class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      storageValue: 0,
      artists: [],
      albums: []
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

  render() {
    return (
      <BrowserRouter>
          <div>
              <Route path="/" component={ Home }/>
          </div>
      </BrowserRouter>
    )
  }
}

export default App
