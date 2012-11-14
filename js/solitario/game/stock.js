// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Stock of cards in the game.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.Stock');

goog.require('solitario.game.Card');
goog.require('solitario.game.Pile');


/**
 * Class to represent the stock of cards in the game.
 *
 * @param {!Element} el DOM element representing the stock.
 * @constructor
 * @extends {solitario.game.Pile}
 */
solitario.game.Stock = function(el) {
  goog.base(this, el);
};
goog.inherits(solitario.game.Stock, solitario.game.Pile);
