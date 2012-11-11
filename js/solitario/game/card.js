// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Playing card object.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.Card');

goog.require('goog.dom.dataset');


/**
 * Class to represent a card in the game.
 *
 * @param {Element} el DOM element with the card contents.
 * @constructor
 */
solitario.game.Card = function(el) {
  /**
   * DOM element with the card contents.
   * @type {Element}
   * @private
   */
  this.element_ = el;

  /**
   * Number of this card, includes also non-digits (A, J, Q, K).
   * @type {string}
   * @private
   */
  this.number_ = goog.dom.dataset.get(
      el, solitario.game.Card.DataAttrs_.NUMBER);

  /**
   * Suit this card belongs to (club, diamond, heart, spade).
   * @type {string}
   * @private
   */
  this.suit_ = goog.dom.dataset.get(el, solitario.game.Card.DataAttrs_.SUIT);

  /**
   * Color of the card depending on the chosen suit.
   * Values are 'red' or 'black'.
   * @type {string}
   * @private
   */
  this.color_ = (this.suit_ === 'heart' ||
                 this.suit_ === 'diamond') ? 'red' : 'black';
};


/**
 * Card data attributes.
 * @enum {string}
 * @const
 * @private
 */
solitario.game.Card.DataAttrs_ = {
  NUMBER: 'number',
  SUIT: 'suit'
};


/**
 * Obtains the current z-index of this card.
 *
 * @return {Number} The z-index as an integer.
 */
solitario.game.Card.prototype.getZIndex = function() {
  return parseInt(this.element_.style.zIndex);
};


/**
 * Modifies the z-index of this card.
 *
 * @param {Number} zIndex The z-index as an integer.
 */
solitario.game.Card.prototype.setZIndex = function(zIndex) {
  this.element_.style.zIndex = zIndex + '';  // explicit string cast.
};


solitario.game.Card.prototype.isDraggable = function() {

};


solitario.game.Card.prototype.isDroppable = function() {

};


solitario.game.Card.prototype.isRevealed = function() {

};