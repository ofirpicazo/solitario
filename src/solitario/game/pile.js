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
   * Pile of cards stacked in this tableu.
   * @type {Array.<solitario.game.Card>}
   * @protected
   */
  this.pile_ = [];
};


/**
 * The z-index difference between each card in the Pile.
 * @type {number}
 */
solitario.game.Pile.INTERCARD_ZINDEX = 10;


/**
 * Gets the relative (ems) position of the Pile in the viewport.
 *
 * @return {goog.math.Coordinate} Relative position of the pile in the viewport.
 * @protected
 */
solitario.game.Pile.prototype.getPosition_ = function() {
  return solitario.game.utils.toRelativeUnits(
      goog.style.getClientPosition(this.element_));
};


/**
 * Gets the current z-index of the pile element.
 *
 * @return {number} z-index of the card element.
 * @protected
 */
solitario.game.Pile.prototype.getZIndex_ = function() {
  return parseInt(goog.style.getComputedZIndex(this.element_));
};

/**
 * Pushes a new card in the pile.
 *
 * @param {solitario.game.Card} card The card to be pushed.
 */
solitario.game.Pile.prototype.push = function(card) {
  this.pile_.push(card);
};


/**
 * Pops a new card from the pile.
 *
 * @return {solitario.game.Card} The card popped from the pile.
 */
solitario.game.Pile.prototype.pop = function() {
  return this.pile_.pop();
};
