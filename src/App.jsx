import React from 'react';
import ReactDOM from 'react-dom';
import styles from './App.css';
import { DropdownItem, Dropdown, Jumbotron, Alert, HelpBlock, Label, Form, FormGroup, ControlLabel, ToggleButtonGroup, ToggleButton, ButtonGroup, Panel, ListGroup, ListGroupItem, Navbar, Nav, NavItem, NavDropdown, Button, DropdownButton, MenuItem, FormControl, Breadcrumb, Modal, Grid, Row, Col } from 'react-bootstrap';
import Select from 'react-select'

import { AppNavbar } from './AppNavbar.jsx';
import { List } from 'immutable';
import { Board, MoveTable } from './ChessApp.jsx';

import { startingFen, getAllFeatures, getPrediction } from './helpers.jsx'
import { getBest } from './engine.js'

import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import Slider, { Range } from 'rc-slider';


/* Obtaining the starting state for a new game.
The starting state is not the same as the reset state, because we want
some properties, e.g. the Stockfish level, to persist throughout games.
The reset state does not contain these properties, so we need to add them 
here.
*/

const crazyMiddleGame = 'r1b1r3/pp1n1pk1/2pR1np1/4p2q/2B1P2P/2N1Qp2/PPP4R/2K3N1 w - - 1 18';
const startingPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const fens = {
  'Starting Position': startingPosition,
  'Crazy Middlegame': crazyMiddleGame,
  'Simple bishop vs knight endgame': '8/p4k1p/1pn5/6B1/8/5P2/P3K1PP/8 w - - 3 38',
  'Rook endgame': '8/8/1r3k2/R4pp1/8/6P1/6K1/8 w - - 0 55',
  'Tricky Kings Indian Position': 'r1b1q1k1/pp1nn1bp/3p3r/3Pp1p1/1PN1Pp2/2N2P2/P3BBPP/R2Q1RK1 w - - 2 17',
}

const OUTCOME_LOSS = 0;
const OUTCOME_BLUNDER = 1;
const OUTCOME_EVAL = 2;

const SCALE_LOSS = 37;
const SCALE_BLUNDER = 0.13;

var startingState = () => {
  var state = {
    elo: 2000
  , expectedLossCalculated: false
  , expectedLoss: 10
  , fen: crazyMiddleGame
  , outcome: OUTCOME_LOSS
  , calculating: true
  }
  
  return state
}


/* Get the stockfish levels in terms of Elo rating.
Stockfish levels range from 0 (1100 Elo) to 20 (3100 Elo)
These are really very rough heuristics, but should be close enough for 
our purposes.
*/
const getStockfishLevels = () => {
  var values = [];
  const numLevels = 29;
  const minElo = 1000;
  const maxElo = 2800;
  for (var i=0; i<=numLevels; i++){
    const elo = Math.floor((minElo + (maxElo - minElo) * (i / numLevels)) / 100) * 100;
    values.push({value: i, label: elo})
  }
  return values
}


export class ColorPicker extends React.Component {
  constructor(props){
    super(props);
  }
  render = () => {
      return (
        <Row>
          <Col xs={6}>
            <div> Color to move </div>
          </Col>
          <Col xs={6}>
            <ToggleButtonGroup justified type="radio" name="options" value={ this.props.whiteToMove } onChange={value => this.props.setWhiteToMove(value)}>
              <ToggleButton value={ true }>White</ToggleButton>
              <ToggleButton value={ false }>Black</ToggleButton>
            </ToggleButtonGroup>
          </Col>
        </Row>
      )
  }
}

export class FenSelector extends React.Component {
  constructor(props){
    super(props);
    this.state = startingState()
  }

  keyShow = key => {
    return (
      <MenuItem key={key} onClick={ () => this.props.setFen(fens[key]) }> { key }  </MenuItem>
    )
  }


  render = () => {
    return (
    <div style={{padding: "20px"}}>
      <Row style={{marginTop: "10px"}}>
        <ButtonGroup justified>
          <DropdownButton id='dd' className="btn-block" block={true} title="Select position">
            { Object.keys(fens).map(this.keyShow) }
          </DropdownButton>
        </ButtonGroup>
      </Row>
      <Row style={{marginTop: "10px"}}>
        <Form horizontal>
          <FormGroup>
            <Col componentClass={ControlLabel} xs={2}>fen</Col>
            <Col xs={10}>
              <FormControl
                ref="inputNode"
                type="text"
                value={ this.props.fen }
                onChange={ this.props.onChange }
              />
            </Col>
          </FormGroup>
        </Form>
      </Row>
    </div>
    )
  }

}

const outcomeParams = {
  1: {
    name: 'Blunder chance',
    scale: 0.13 * 100,
    ending: '%',
    digits: 0
  },
  0: {
    name: 'Expected loss',
    scale: 36.77,
    ending: ' CP',
    digits: 0
  }
}

const styleCenter = {
  fontSize: '50px',
  backgroundColor: 'FEF175'
};

/* The main app, which pulls in all the other windows. */
export class App extends React.Component {
  constructor(props){
    super(props);
    this.state = startingState()
  }
  setElo = elo => {
    this.setState({ elo: elo })
  };
  onChange = e => this.setFen(e.target.value)
  setFen = fen => this.setState({ fen: fen }, () => this.calculateScore())
  setScore = score => this.setState({ score: score });
  setOutcome = outcome => this.setState({ outcome: outcome }, () => this.calculateScore());
  getFormattedScore = () => {
    console.log("OUT");
    console.log(this.state.outcome);
    const params = outcomeParams[this.state.outcome];
    if (this.state.calculating){
      return [params.name, ''];
    }
    console.log(params);
    const score = this.state.score;
    const scoreScaled = score * params.scale;
    console.log(score);
    const disp = "" + scoreScaled.toFixed(params.digits) + params.ending;
    console.log(disp);
    return [params.name, disp];
  }
  async calculateScore () {
    this.setState({'calculating': true});
    const fen = this.state.fen;
    const isWhite = this.state.isWhite;
    const elo = this.state.elo;
    const allFeatures = getAllFeatures(fen, elo, isWhite)
    const pred = await getPrediction(allFeatures);
    const outcome = this.state.outcome;
    console.log("OUTCOME" + outcome);
    this.setScore(pred.dataSync()[outcome])
    this.setState({'calculating': false});
  }
  componentDidMount = () => {
    this.calculateScore()
  }

  render = () => {
    const [name, score] = this.getFormattedScore();
    return (
      <div>
        <AppNavbar/>
        <Grid fluid={true}>
            <Col sm={6} smOffset={3}>
              <Board fen={ this.state.fen }/>
              <Row>
                <div className="text-center">
                  <h3> {name}: <Label>{ score } </Label></h3>
                </div>
              </Row>
              <ToggleButtonGroup id='toggle' justified type="radio" name="options" value={ this.state.outcome } onChange={ this.setOutcome }>
                <ToggleButton value={ OUTCOME_LOSS } >Loss</ToggleButton>
                <ToggleButton value={ OUTCOME_BLUNDER }>Blunder</ToggleButton>
              </ToggleButtonGroup>
              <FenSelector fen={this.state.fen} onChange={this.onChange} setFen={this.setFen}/>
              <Row>
              </Row>
              <Row>
                <Form horizontal>
                  <FormGroup>
                    <Col componentClass={ControlLabel} xs={2}>Elo</Col>
                    <Col xs={7}>
                  <Slider min={1000} max={2800} value={ this.state.elo } onChange={this.setElo} onAfterChange={ () => this.calculateScore() }/>
                    </Col>
                    <Col style={{fontSize:'20px'}} xs={3}>
                        { this.state.elo }
                    
                    </Col>
                  </FormGroup>
                </Form>
              </Row>
            </Col>
        </Grid>
      </div>
    )
  }
}

App.defaultProps = {
  showInput: false
}


// <ResultDisplay expectedLoss={ this.state.expectedLoss }/>
