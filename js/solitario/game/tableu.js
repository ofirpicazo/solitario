// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Tableu of cards object.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.Tableu');

goog.require('solitario.game.Card');
goog.require('solitario.game.Droppable');
goog.require('solitario.game.Pile');


/**
 * Class to represent a tableu in the game.
 *
 * @param {!Element} el DOM element representing the tableu.
 * @constructor
 * @extends {solitario.game.Pile}
 * @implements {solitario.game.Droppable}
 */
solitario.game.Tableu = function(el) {
  goog.base(this, el);
};
goog.inherits(solitario.game.Tableu, solitario.game.Pile);


/** @inheritDoc */
solitario.game.Tableu.prototype.isDroppable = function(droppedObj) {

};
