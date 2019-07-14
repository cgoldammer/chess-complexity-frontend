import React, { Component } from 'react';
import { Nav, Navbar, NavDropdown, Modal, NavItem, MenuItem } from 'react-bootstrap';

export const appName = 'Position Complexity';

export class AppNavbar extends React.Component {
  constructor(props){
    super(props);
    this.state = { showAbout: false };
  }
  setAbout = val => this.setState({ showAbout: val })
  render = () => {
    return (
      <div style={{ marginBottom: 0 }}>
        <Navbar collapseOnSelect style={{ marginBottom: 0, borderRadius: 0 }}>
          <Navbar.Header>
            <Navbar.Brand>
              <a href='#brand'>{ appName } </a>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav pullRight>
              <NavItem onClick={ () => this.setAbout(true) }>
                About
              </NavItem>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Modal show={this.state.showAbout} onHide={() => this.setAbout(false)}>
          <Modal.Header closeButton>
            <Modal.Title>About</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>This tells you how likely a human chess position is to make a mistake 
            and how many centipawns (CP) they are expected to lose.
            </p>
            <p>This is based on data collected from <a target='_blank' href='https://chessinsights.org'>Chess Insights</a>.</p>
            <p>See the methodology and other fun results, for instance the sharpest games in the 2018 candidates tournament, <a target='_blank' href='https://github.com/cgoldammer/chess-analysis/blob/master/position_sharpness.ipynb'>here</a>!</p>
            <p>For more about me, check out <a target='_blank' href='https://www.chrisgoldammer.com'>my homepage</a>!</p>
            <p>If you have feedback or ideas, just send me an <a href='mailto:goldammer.christian@gmail.com'>email</a>!</p>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}
