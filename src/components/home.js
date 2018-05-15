import React, { Component } from 'react';
import { Tab, Tabs, Input, Row, Button, Col } from 'react-materialize';

class Company extends Component {

    componentWillMount(){
        this.props.history.push('/write');
    }

    readBtnHandler(){
        this.props.history.push('/read');

    }

    writeBtnHandler(){
        this.props.history.push('/write');

    }

    render() {
        return (
            <div style = {{color: 'light-gray'}}>
             <Button onClick = {this.readBtnHandler.bind(this)}>Read</Button>
              <Button onClick = {this.writeBtnHandler.bind(this)}>Write</Button> 
            </div>
        )
    }
}


export default (Company);
