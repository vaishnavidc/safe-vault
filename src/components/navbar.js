import React, { Component } from 'react';
import logo from '../images/logo.png';

class CustomNavbar extends Component {

    render() {
        return (
            <nav>
            <div className="nav-wrapper" style={{backgroundColor: '#ffffff'}}>
              <img src={logo} alt='logo' style={{width: "170px"}}/>
              {/* <ul id="nav-mobile" className="right hide-on-med-and-down">
                <li><a href="sass.html">Sass</a></li>
                <li><a href="badges.html">Components</a></li>
                <li><a href="collapsible.html">JavaScript</a></li>
              </ul> */}
            </div>
          </nav>
        )
    }
}


export default (CustomNavbar);
