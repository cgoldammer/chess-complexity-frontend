import { List } from 'immutable';

/* A hack for a weird problem: The import is handled differently
when running in webpack-dev-server and through jest. 
Just importing twice, and using the one version that works */
import { Chess } from 'chess.js';
import Chess2 from 'chess.js';

import { getBest } from './engine.js';
import * as tf from '@tensorflow/tfjs';



//const tf = require("@tensorflow/tfjs");
//import * as tfn from "@tensorflow/tfjs-node";
//const model = tf.loadModel(handler);


export const startingFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

export const gameStatus = {
  starting: [0, "New Game", "info"]
, active: [1, "Active Game", "primary"]
, whiteWon: [2, "White won", "danger"]
, blackWon: [3, "Black won", "danger"]
, draw: [4, "Draw", "warning"]
}

export const invertLetters = fen => {
	const tempLetter = 'T';
	var fenInvert = fen;
	for (var letter of 'pnrqk'){
		const upper = letter.toUpperCase()
		fenInvert = fenInvert.replace(new RegExp(letter, 'g'), tempLetter)
		fenInvert = fenInvert.replace(new RegExp(upper, 'g'), letter)
		fenInvert = fenInvert.replace(new RegExp(tempLetter, 'g'), upper)
	}
	return fenInvert;
}

export const invertFen = fen => {

  const parts = fen.split(' ');
  const positionPart = parts[0];
  const colorPart = parts[1];

	if (colorPart == 'w') {
		return fen;
	}

  const castlePart = parts[2];

	const fenInvertLetters = invertLetters(positionPart)
	const fenSplit = fenInvertLetters.split('/');

	const positionPartInvert = fenSplit.reverse().join('/')
	const castlePartInvert = invertLetters(castlePart);

  return positionPartInvert + ' w ' + castlePartInvert + ' ' + parts.slice(3).join(' ');
}


export const fillFen = fen => {
  var fenFill = fen;
  for (var i=1; i<=8; i++){
    fenFill = fenFill.replace(new RegExp('' + i, 'g'), 'E'.repeat(i))
  }
  return fenFill.replace(new RegExp('/', 'g'), '')
}

const allPieces = 'pPnNbBrRqQkK';
const castlingValues = 'kKqQ'

export const getFeatures = fen => {
  const fenFilled = fillFen(fen);
  var val;
  var features = []
  for (var val of fenFilled){
    for (var piece of allPieces){
      features.push(1.0 * (val == piece))
    }
  }
  return features;
}

export const getCastleFeatures = castleString => {
  var features = []
  for (var s of castlingValues){
    features.push(castleString.includes(s) * 1.0)
  }
  return features;
}

/* Getting all features used for the prediction model
 * In case `isWhite==True`, we invert the `fen`, because
 * the model is only defined with white to move.
 */
export const getAllFeatures = (fen, elo) => {
  if (fen == undefined) {
    return []
  }
  const fenWhite = invertFen(fen);

  const parts = fenWhite.split(' ');

  const positionPart = parts[0];
  const castlePart = parts[2];

  const featuresPosition = getFeatures(positionPart);
  const featuresCastle = getCastleFeatures(castlePart);
    
  const featuresOther = [elo / 3000];

  return featuresPosition.concat(featuresCastle).concat(featuresOther)
}

//export const getPrediction = features => 1;

export async function getPrediction(features) {
  const model = await tf.loadLayersModel('https://chessinsights.org/analysis/sharpness_js/model.json');
	const data = tf.tensor2d([features], [1, features.length]);
  const pred = model.predict(data);
	return pred
}
