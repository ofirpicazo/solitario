// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Waste for cards in the game.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.Waste');

goog.require('solitario.game.Card');
goog.require('solitario.game.Pile');


/**
 * Class to represent the waste for cards in the game.
 *
 * @param {!Element} el DOM element representing the waste.
 * @constructor
 * @extends {solitario.game.Pile}
 */
solitario.game.Waste = function(el) {
  goog.base(this, el);
};
goog.inherits(solitario.game.Waste, solitario.game.Pile);
