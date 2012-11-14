// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Class to represent a pile of cards.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.Pile');

goog.require('goog.style');


/**
 * Class to represent a pile of cards.
 *
 * @param {!Element} el DOM element to represent the pile.
 * @constructor
 */
solitario.game.Pile = function(el) {
  /**
   * DOM element with the card contents.
   * @type {Element}
   * @private
   */
  this.element_ = el;

    /**
   * Pile of cards stacked in this tableu.
   * @type {Array.<solitario.game.Card>}
   * @private
   */
  this.pile_;
};


/**
 * Gets the computed value of the css position.
 *
 * @return {goog.math.Coordinate} Absolute position of the pile in the viewport.
 */
solitario.game.Pile.prototype.getPosition = function() {
  return goog.style.getClientPosition(this.element_);
};