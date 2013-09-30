// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Class to represent a pile of cards.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.Pile');

goog.require('goog.Timer');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.style');
goog.require('solitario.game.constants');
goog.require('solitario.game.storage.CardForStorage');
goog.require('solitario.game.storage.PileForStorage');
goog.require('solitario.game.utils');
goog.require('solitario.pubsub');



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
   * Cache of the absolute position of this.element_ in order to avoid repaints.
   * @type {?goog.math.Coordinate}
   * @private
   */
  this.absolutePosition_ = null;

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
   * Unique identifier for this pile.
   * @type {string}
   */
  this.id = this.element_.id;

  /**
   * Type of pile, override in subclases.
   * @type {solitario.game.constants.PileTypes}
   */
  this.pileType = null;

  /**
   * Pile of cards stacked in this tableu.
   * @type {Array.<solitario.game.Card>}
   * @protected
   */
  this.pile = [];

  // Subscribe to PubSub messages.
  solitario.pubsub.subscribe(solitario.pubsub.Topics.RESIZE_BOARD,
      this.invalidatePositionCache_, this);
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
  if (!this.absolutePosition_) {
    this.absolutePosition_ = goog.style.getPosition(this.element_);
  }
  return this.absolutePosition_;
};


/**
 * Resets the cache created for the absolute position of this pile.
 *
 * @private
 */
solitario.game.Pile.prototype.invalidatePositionCache_ = function() {
  this.absolutePosition_ = null;
};


/**
 * Calculates the region where cards can be dropped on to this pile.
 */
solitario.game.Pile.prototype.calculateDroppableRegion = function() {
  var position = this.getAbsolutePosition_();
  var size = this.getAbsoluteSize();

  this.droppableRegion_ = new goog.math.Rect(position.x, position.y, size.width,
      size.height);
};


/**
 * Return true if this pile can accept the passed card given the game rules.
 *
 * @param {solitario.game.Card} card The card to be evaluated.
 * @return {boolean} true if the card can be pushed to the pile, false if not.
 */
solitario.game.Pile.prototype.canAcceptCard = function(card) {
  // Don't accept if the card is from the same pile.
  return (card.pile != this);
};


/**
 * Returns a lightweight representation of the pile intended for storage.
 *
 * @return {Object} A lightweight object representing the pile.
 */
solitario.game.Pile.prototype.forStorage = function() {
  var cards = [];
  for (var i = 0; i < this.pile.length; i++) {
    cards.push(new solitario.game.storage.CardForStorage(this.pile[i].id,
        this.pile[i].isRevealed()));
  }

  return new solitario.game.storage.PileForStorage(this.id, this.pileType,
      cards);
};


/**
 * Returns the absolute size of the pile, in pixels.
 *
 * @return {goog.math.Size} The size of the pile.
 * @protected
 */
solitario.game.Pile.prototype.getAbsoluteSize = function() {
  // toAbsoluteUnits returns a goog.math.Coordinate, so we need to convert it
  // to a goog.math.Size.
  var coordinate = solitario.game.utils.toAbsoluteUnits(
      solitario.game.constants.Card.WIDTH,
      solitario.game.constants.Card.HEIGHT);
  return new goog.math.Size(coordinate.x, coordinate.y);
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
 * Gets the relative (ems) position of the Pile in the viewport.
 *
 * @return {goog.math.Coordinate} Relative position of the pile in the viewport.
 * @protected
 */
solitario.game.Pile.prototype.getPosition = function() {
  return solitario.game.utils.toRelativeUnits(this.getAbsolutePosition_());
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
 * Gets the current z-index of the pile element.
 *
 * @return {number} z-index of the card element.
 * @protected
 */
solitario.game.Pile.prototype.getZIndex = function() {
  return parseInt(goog.style.getComputedZIndex(this.element_));
};


/**
 * Disables the visual clue indicating the droppable region of the pile can
 * receive a drop.
 */
solitario.game.Pile.prototype.hideDroppableIndicator = function() {
  // If the pile has cards, remove indicator from every card, otherwise use
  // the pile itself.
  if (this.isEmpty()) {
    goog.dom.classes.remove(this.element_,
        solitario.game.Pile.ClassNames_.DROP_TARGET);
  } else {
    for (var i = this.pile.length - 1; i >= 0; i--) {
      this.pile[i].hideDroppableIndicator();
    }
  }
};


/**
 * Returns whether the pile has cards or not.
 *
 * @return {boolean} True if the pile has no cards, false if it does.
 */
solitario.game.Pile.prototype.isEmpty = function() {
  return (this.pile.length > 0) ? false : true;
};


/**
 * Pops a new card from the pile.
 *
 * @return {?solitario.game.Card} The card popped from the pile.
 */
solitario.game.Pile.prototype.pop = function() {
  var card = this.pile.pop();
  card.pile = null;
  card.positionInPile = null;
  card.zIndexInPile = null;
  return card;
};


/**
 * Pushes a new card in the pile and sets its position to the corresponding
 * place in the pile.
 *
 * @param {solitario.game.Card} card The card to be pushed.
 */
solitario.game.Pile.prototype.push = function(card) {
  this.pile.push(card);
  card.pile = this;
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

  // Fallback for setting the card z-index, because sometimes the browser fails
  // to trigger the TRANSITIONEND event.
  // TODO(ofirp): Figure out why!
  goog.Timer.callOnce(function(evnt) {
    card.setZIndex(cardZIndex);
    card.zIndexInPile = cardZIndex;
  }, solitario.game.constants.CARD_ANIMATION_DURATION, this);
};


/**
 * Enables the visual clue indicating the droppable region of the pile can
 * receive a drop.
 */
solitario.game.Pile.prototype.showDroppableIndicator = function() {
  // If the pile has cards, add the indicator to every card, otherwise use
  // the pile itself.
  if (this.isEmpty()) {
    goog.dom.classes.add(this.element_,
        solitario.game.Pile.ClassNames_.DROP_TARGET);
  } else {
    for (var i = this.pile.length - 1; i >= 0; i--) {
      this.pile[i].showDroppableIndicator();
    }
  }
};
