// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Class to represent a pile of cards.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.Pile');

goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.style');
goog.require('solitario.game.constants');
goog.require('solitario.game.utils');


/**
 * Class to represent a pile of cards.
 *
 * @param {!Element} el DOM element to represent the pile.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
solitario.game.Pile = function(el) {
  // Call superclass constructor.
  goog.base(this);

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
goog.inherits(solitario.game.Pile, goog.events.EventTarget);


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
      goog.style.getPosition(this.element_));
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
 * Returns the top-most card without removing it from the pile, unlike pop().
 *
 * @return {?solitario.game.Card} The card on top of the pile.
 * @protected
 */
solitario.game.Pile.prototype.getTopCard_ = function() {
  return this.pile_[this.pile_.length - 1] || null;
};


/**
 * Handles when a playable card ends being dragged.
 *
 * @param {goog.events.Event} evnt The event object passed.
 * @private
 */
solitario.game.Pile.prototype.handleCardDragEnd_ = function(evnt) {
  var card = evnt.target;
  // Return the card to the original position in the pile, as it wasn't popped
  // after end drag ended.
  card.returnToPile();
};


/**
 * Pushes a new card in the pile and sets its position to the corresponding
 * place in the pile.
 *
 * @param {solitario.game.Card} card The card to be pushed.
 */
solitario.game.Pile.prototype.push = function(card) {
  this.pile_.push(card);
  // Set the card on top of everything.
  card.setZIndex(solitario.game.constants.MAX_ZINDEX);
  // Position card at 0,0 relative to the pile.
  var position = this.getPosition_();
  card.setPosition(position);
  card.positionInPile = position;

  // Trigger final zindex update at end of position change (after 300ms) to
  // allow time for animations to finish.
  var cardZIndex = this.getZIndex_() +
                   (this.pile_.length * solitario.game.Pile.INTERCARD_ZINDEX);
  window.setTimeout(function() {
    card.setZIndex(cardZIndex);
  }, 300);

  // Add listeners for card dragging.
  goog.events.listen(card, solitario.game.constants.Events.DRAG_END,
                     this.handleCardDragEnd_);
};


/**
 * Pops a new card from the pile.
 *
 * @return {solitario.game.Card} The card popped from the pile.
 */
solitario.game.Pile.prototype.pop = function() {
  var card = this.pile_.pop();
  // Remove listeners from the card.
  goog.events.unlisten(card, solitario.game.constants.Events.DRAG_END,
                       this.handleCardDragEnd_);
  return card;
};
