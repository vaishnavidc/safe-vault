import React from 'react';
import {
  Router,
  Route
} from 'react-router-dom';
import CustomNavbar from '../components/navbar'
import Company from '../components/comapny'
import history from '../history';

const BasicRouting = (props) => {
  return ( 
    <Router history={history}>
    <div>
        <CustomNavbar />
        <Route path="/" component={Company} />
    </div>
    </Router>
  )
}


export default (BasicRouting);