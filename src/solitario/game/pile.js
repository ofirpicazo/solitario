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
   * Rectangular region of the pile where cards can be dropped on to.
   * This value is cached, because calculating it is expensive as it causes
   * a repaint.
   * @type {goog.math.Rect}
   * @private
   */
  this.droppableRegion_ = null;

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
  this.pile = [];
};
goog.inherits(solitario.game.Pile, goog.events.EventTarget);


/**
 * Class names used in the pile object.
 * @enum {string}
 * @const
 * @private
 */
solitario.game.Pile.ClassNames_ = {
  DROP_TARGET: 'droptarget'
};


/**
 * The z-index difference between each card in the Pile.
 * @type {number}
 */
solitario.game.Pile.INTERCARD_ZINDEX = 10;


/**
 * Gets the absolute position of the pile in the viewport, in px.
 *
 * @return {goog.math.Coordinate} The absolute position of the pile.
 * @private
 */
solitario.game.Pile.prototype.getAbsolutePosition_ = function() {
  return goog.style.getPosition(this.element_);
};


/**
 * Gets the relative (ems) position of the Pile in the viewport.
 *
 * @return {goog.math.Coordinate} Relative position of the pile in the viewport.
 * @protected
 */
solitario.game.Pile.prototype.getPosition = function() {
  return solitario.game.utils.toRelativeUnits(this.getAbsolutePosition_());
};


/**
 * Gets the current z-index of the pile element.
 *
 * @return {number} z-index of the card element.
 * @protected
 */
solitario.game.Pile.prototype.getZIndex = function() {
  return parseInt(goog.style.getComputedZIndex(this.element_));
};


/**
 * Returns the top-most card without removing it from the pile, unlike pop().
 *
 * @return {?solitario.game.Card} The card on top of the pile.
 * @protected
 */
solitario.game.Pile.prototype.getTopCard = function() {
  return this.pile[this.pile.length - 1] || null;
};


/**
 * Calculates the region where cards can be dropped on to this pile.
 */
solitario.game.Pile.prototype.calculateDroppableRegion = function() {
  var topCard = this.getTopCard();
  // If the pile has cards, use the region of the top card, otherwise calculate
  // the region of the empty pile.
  if (topCard) {
    this.droppableRegion_ = topCard.getRect();
  } else {
    var position = this.getAbsolutePosition_();
    var size = solitario.game.utils.toAbsoluteUnits(
        solitario.game.constants.Card.WIDTH,
        solitario.game.constants.Card.HEIGHT);
    this.droppableRegion_ = new goog.math.Rect(position.x, position.y, size.x,
        size.y);
  }
};


/**
 * Disables the visual clue indicating the droppable region of the pile can
 * receive a drop.
 */
solitario.game.Pile.prototype.disableDroppableIndicator = function() {
  var topCard = this.getTopCard();
  // If the pile has cards, remove indicator from the top card, otherwise use
  // the pile itself.
  if (topCard) {
    topCard.disableDroppableIndicator();
  } else {
    goog.dom.classes.remove(this.element_,
        solitario.game.Pile.ClassNames_.DROP_TARGET);
  }
};


/**
 * Enables the visual clue indicating the droppable region of the pile can
 * receive a drop.
 */
solitario.game.Pile.prototype.enableDroppableIndicator = function() {
  var topCard = this.getTopCard();
  // If the pile has cards, add the indicator top the top card, otherwise use
  // the pile itself.
  if (topCard) {
    topCard.enableDroppableIndicator();
  } else {
    goog.dom.classes.add(this.element_,
        solitario.game.Pile.ClassNames_.DROP_TARGET);
  }
};


/**
 * Returns the rectangular region where a card can be dropped on this pile.
 *
 * @return {goog.math.Rect} The rectangular droppable region of this card.
 */
solitario.game.Pile.prototype.getDroppableRegion = function() {
  return this.droppableRegion_;
};


/**
 * Pushes a new card in the pile and sets its position to the corresponding
 * place in the pile.
 *
 * @param {solitario.game.Card} card The card to be pushed.
 */
solitario.game.Pile.prototype.push = function(card) {
  this.pile.push(card);
  // Set the card on top of everything during the change of position.
  card.setZIndex(solitario.game.constants.MAX_ZINDEX);
  // Position card at 0,0 relative to the pile.
  var position = this.getPosition();
  card.setPosition(position);
  card.positionInPile = position;

  // Trigger final z-index update at end of position change to allow time for
  // animations to finish.
  var cardZIndex = this.getZIndex() + (this.pile.length *
      solitario.game.Pile.INTERCARD_ZINDEX);
  goog.events.listenOnce(card, goog.events.EventType.TRANSITIONEND,
      function(evnt) {
        card.setZIndex(cardZIndex);
        card.zIndexInPile = cardZIndex;
      }, false, this);
};


/**
 * Pops a new card from the pile.
 *
 * @return {solitario.game.Card} The card popped from the pile.
 */
solitario.game.Pile.prototype.pop = function() {
  return this.pile.pop();
};
