// Copyright 2013 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Lightweight version of a pile of cards.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.storage.PileForStorage');



/**
 * Lightweight representation of a Pile.
 *
 * @param {string} id Id associated with this pile.
 * @param {solitario.game.constants.PileTypes} type Type of pile.
 * @param {Array.<solitario.game.storage.CardForStorage>} cards List of cards
 *     contained in this pile.
 * @constructor
 */
solitario.game.storage.PileForStorage = function(id, type, cards) {
  /**
   * Unique identifier for this pile.
   * @type {string}
   */
  this.id = id;

  /**
   * Type of pile.
   * @type {solitario.game.constants.PileTypes}
   */
  this.type = type;

  /**
   * List of cards contained in this pile.
   * @type {Array.<solitario.game.storage.CardForStorage>}
   */
  this.cards = cards;
};
