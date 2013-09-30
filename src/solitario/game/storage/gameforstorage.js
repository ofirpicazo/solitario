// Copyright 2013 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Lightweight representation of a game, intended for storage.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.storage.GameForStorage');



/**
 * Lightweight representation of a game..
 *
 * @param {number} score The value for the current game score.
 * @param {solitario.game.storage.PileForStorage} stock Pile representing the
 *     stock.
 * @param {solitario.game.storage.PileForStorage} waste Pile representing the
 *     waste.
 * @param {Array.<solitario.game.storage.PileForStorage>} foundations List of
 *     piles representing the foundations.
 * @param {Array.<solitario.game.storage.PileForStorage>} tableux List of piles
 *     representing the tableux.
 * @constructor
 */
solitario.game.storage.GameForStorage = function(score, stock, waste,
    foundations, tableux) {
  /**
   * Current score of the game.
   * @type {number}
   */
  this.score = score;

  /**
   * Pile representing the stock.
   * @type {solitario.game.storage.PileForStorage}
   */
  this.stock = stock;

  /**
   * Pile representing the waste.
   * @type {solitario.game.storage.PileForStorage}
   */
  this.waste = waste;

  /**
   * List of piles representing the foundations.
   * @type {Array.<solitario.game.storage.PileForStorage>}
   */
  this.foundations = foundations;

  /**
   * List of piles representing the foundations.
   * @type {Array.<solitario.game.storage.PileForStorage>}
   */
  this.tableux = tableux;
};
