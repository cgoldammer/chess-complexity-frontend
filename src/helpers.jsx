import * as tf from '@tensorflow/tfjs';

const eloScale = 3000;

export const startingFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const gameStatus = {
  starting: [0, 'New Game', 'info'],
  active: [1, 'Active Game', 'primary'],
  whiteWon: [2, 'White won', 'danger'],
  blackWon: [3, 'Black won', 'danger'],
  draw: [4, 'Draw', 'warning'],
};

const pieceLetters = 'pnbrqk';

export const invertLetters = fen => {
  const tempLetter = 'T';
  var fenInvert = fen;
  for (var letter of pieceLetters){
    const upper = letter.toUpperCase();
    fenInvert = fenInvert.replace(new RegExp(letter, 'g'), tempLetter);
    fenInvert = fenInvert.replace(new RegExp(upper, 'g'), letter);
    fenInvert = fenInvert.replace(new RegExp(tempLetter, 'g'), upper);
  }
  return fenInvert;
};

export const invertFen = fen => {

  const parts = fen.split(' ');
  const positionPart = parts[0];
  const colorPart = parts[1];

  if (colorPart == 'w') {
    return fen;
  }

  const castlePart = parts[2];

  const fenInvertLetters = invertLetters(positionPart);
  const fenSplit = fenInvertLetters.split('/');

  const positionPartInvert = fenSplit.reverse().join('/');
  const castlePartInvert = invertLetters(castlePart);

  const full = positionPartInvert + ' w ' + castlePartInvert + ' ' + parts.slice(3).join(' ');

  console.log(full);
  return full;
};

export const fillFen = fen => {
  var fenFill = fen;
  for (var i=1; i<=8; i++){
    fenFill = fenFill.replace(new RegExp('' + i, 'g'), 'E'.repeat(i));
  }
  return fenFill.replace(new RegExp('/', 'g'), '');
};

const allPieces = 'pPnNbBrRqQkK';
const castlingValues = 'kKqQ';

export const getFeatures = fen => {
  const fenFilled = fillFen(fen);
  var features = [];
  for (var val of fenFilled){
    for (var piece of allPieces){
      features.push(1.0 * (val == piece));
    }
  }
  return features;
};

export const getCastleFeatures = castleString => {
  var features = [];
  for (var s of castlingValues){
    features.push(castleString.includes(s) * 1.0);
  }
  return features;
};

/* Getting all features used for the prediction model
 * In case `isWhite==True`, we invert the `fen`, because
 * the model is only defined with white to move.
 */
export const getAllFeatures = (fen, elo) => {
  if (fen == undefined) {
    return [];
  }
  const fenWhite = invertFen(fen);

  const parts = fenWhite.split(' ');

  const positionPart = parts[0];
  const castlePart = parts[2];

  const featuresPosition = getFeatures(positionPart);
  const featuresCastle = getCastleFeatures(castlePart);
    
  const featuresOther = [elo / eloScale];

  return featuresPosition.concat(featuresCastle).concat(featuresOther);
};

//export const getPrediction = features => 1;

export async function getPrediction(features) {
  const model = await tf.loadLayersModel('https://chessinsights.org/analysis/sharpness_js/model.json');
  const data = tf.tensor2d([features], [1, features.length]);
  const pred = model.predict(data);
  return pred;
}
