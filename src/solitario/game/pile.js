// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Class to represent a pile of cards.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.Pile');

goog.require('goog.style');
goog.require('solitario.game.utils');


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
   * Relative (ems) position of the Pile in the viewport.
   * @type {goog.math.Coordinate}
   * @private
   */
  this.position_ = solitario.game.utils.toRelativeUnits(
      this.getAbsolutePosition_());

    /**
   * Pile of cards stacked in this tableu.
   * @type {Array.<solitario.game.Card>}
   * @private
   */
  this.pile_;
};


/**
 * Gets the computed value of the css absolute position (in pixels).
 *
 * @return {goog.math.Coordinate} Absolute position of the pile in the viewport.
 * @private
 */
solitario.game.Pile.prototype.getAbsolutePosition_ = function() {
  return goog.style.getClientPosition(this.element_);
};
