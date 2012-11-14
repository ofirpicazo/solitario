// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Playing card object.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.Card');

goog.require('goog.dom.dataset');
goog.require('goog.style');


/**
 * Class to represent a card in the game.
 *
 * @param {!Element} el DOM element with the card contents.
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
   * Unique identifier for this card.
   * @type {string}
   */
  this.id = this.element_.id;

  /**
   * Number of this card, includes also non-digits (A, J, Q, K).
   * @type {string}
   */
  this.number = goog.dom.dataset.get(
      this.element_, solitario.game.Card.DataAttrs_.NUMBER);

  /**
   * Suit this card belongs to (club, diamond, heart, spade).
   * @type {string}
   */
  this.suit = goog.dom.dataset.get(
      this.element_, solitario.game.Card.DataAttrs_.SUIT);

  /**
   * Color of the card depending on the chosen suit.
   * Values are 'red' or 'black'.
   * @type {string}
   */
  this.color = (this.suit === 'heart' ||
                this.suit === 'diamond') ? 'red' : 'black';
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


/**
 * Sets the absolute position of the card in the viewport.
 *
 * @param {goog.math.Coordinate} position Absolute position to set the card to.
 */
solitario.game.Card.prototype.setPosition = function(position) {
  goog.style.setPosition(this.element_, position);
};
