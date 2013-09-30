// Copyright 2013 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Lightweight version of a playing card.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.storage.CardForStorage');



/**
 * Lightweight representation of a Card.
 *
 * @param {string} id Id associated with this card.
 * @param {boolean} revealed Whether this card is revelead or not.
 * @constructor
 */
solitario.game.storage.CardForStorage = function(id, revealed) {
  /**
   * Unique identifier for this card.
   * @type {string}
   */
  this.id = id;

  /**
   * Flag to indicate whether this card is revealed or not.
   * @type {boolean}
   */
  this.revealed = revealed;
};
