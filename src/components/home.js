import React, { Component } from 'react';
import { Tab, Tabs, Input, Row, Button, Col } from 'react-materialize';

class Company extends Component {

    componentWillMount(){
        this.props.history.push('/read');
        document.title = "BlockSave"
    }

    componentDidMount() {
        
    }

    readBtnHandler(){
        this.props.history.push('/read');

    }

    writeBtnHandler(){
        this.props.history.push('/write');

    }

    render() {
        return (
            <Row style = {{color: 'light-gray'}} s={12}>
                <Col s={4}></Col>
                <Col s={4}>                
             <Button onClick = {this.readBtnHandler.bind(this)} style={{width : '49.1%'}}>Read</Button>
              <Button onClick = {this.writeBtnHandler.bind(this)} style={{width : '49.1%'}}>Write</Button> 
                </Col>
                <Col s={4}></Col>
            </Row>
        )
    }
}


export default (Company);
