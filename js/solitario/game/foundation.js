// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Foundation object, fill one per suit to complete the game.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.Foundation');

goog.require('goog.dom.dataset');
goog.require('solitario.game.Card');
goog.require('solitario.game.Droppable');
goog.require('solitario.game.Pile');


/**
 * Class to represent a foundation in the game.
 *
 * @param {!Element} el DOM element representing the foundation.
 * @constructor
 * @extends {solitario.game.Pile}
 * @implements {solitario.game.Droppable}
 */
solitario.game.Foundation = function(el) {
  goog.base(this, el);

  /**
   * Suit this foundation contains.
   * @type {string}
   * @private
   */
  this.suit_ = goog.dom.dataset.get(
      el, solitario.game.Foundation.DataAttrs_.SUIT);
};
goog.inherits(solitario.game.Foundation, solitario.game.Pile);


/**
 * Foundation data attributes.
 * @enum {string}
 * @const
 * @private
 */
solitario.game.Foundation.DataAttrs_ = {
  SUIT: 'suit'
};


/** @inheritDoc */
solitario.game.Foundation.prototype.isDroppable = function(droppedObj) {

};
