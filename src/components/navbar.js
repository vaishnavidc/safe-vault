import React, { Component } from 'react';
import {Navbar} from 'react-bootstrap';

class CustomNavbar extends Component {

    render() {
        return (
            <Navbar style = {{backgroundColor : '#2BBBAD'}}>
              <Navbar.Brand>
                <a href="#" style= {{fontSize : 20}}>BlockSave</a>
              </Navbar.Brand>
          </Navbar>
        )
    }
}


export default (CustomNavbar);
