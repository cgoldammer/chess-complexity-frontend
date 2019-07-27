import React, { Component } from "react";
import { Button } from 'react-bootstrap';
import { List } from 'immutable';

import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });
import { shallow, mount, render } from 'enzyme';

import { invertFen, startingFen, fillFen, getFeatures, getCastleFeatures, getAllFeatures, GameClient, invertLetters} from './helpers.jsx'


describe('When reading fen', () => {
  test('The fen is filled correctly', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
    const filled = fillFen(fen);
    expect(filled.length).toEqual(64);
  });
  test('The castling features are correct', () => {
    expect(getCastleFeatures('kKqQ')).toEqual([1, 1, 1, 1]);
    expect(getCastleFeatures('')).toEqual([0, 0, 0, 0]);
  });
  test('The posiition features are extracted correctly', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
    const features = getFeatures(fen);

    const numberPieces = 12;
    expect(features.length).toEqual(64 * numberPieces);
  });
  test('The full features are extracted correctly', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

    const features = getAllFeatures(fen, 2000, true);

    const numFeatures = 773;
    expect(features.length).toEqual(numFeatures);
  });
	test('Inverting letters is correct', () => {
    const string = 'nRK '
		const expected = 'Nrk '
    expect(invertLetters(string)).toEqual(expected);
	});
	test('Inverting positions is correct', () => {
    const fen = 'k7/8/K7/8/8/8/8/8 b Kq - 0 1'
		const expected = '8/8/8/8/8/k7/8/K7 w kQ - 0 1'
    expect(invertFen(fen)).toEqual(expected);
	});
	test('Inverting positions is correct', () => {
    const fen = 'rnbqkb1r/pppp1ppp/4pn2/8/1PP5/2N5/P2PPPPP/R1BQKBNR b KQkq - 2 3';
		const expected = 'r1bqkbnr/p2ppppp/2n5/1pp5/8/4PN2/PPPP1PPP/RNBQKB1R w kqKQ - 2 3';
    expect(invertFen(fen)).toEqual(expected);
	});
});
