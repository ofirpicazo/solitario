// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Playing card object.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.Card');

goog.require('goog.dom.classes');
goog.require('goog.dom.dataset');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.style');
goog.require('solitario.game.constants');
goog.require('solitario.game.utils');



/**
 * Class to represent a card in the game.
 *
 * @param {!Element} el DOM element with the card contents.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
solitario.game.Card = function(el) {
  // Calls the superclass constructor.
  goog.base(this);

  /**
   * Cache of the absolute position of this.element_ in order to avoid repaints.
   * @type {?goog.math.Coordinate}
   * @private
   */
  this.absolutePosition_ = null;

  /**
   * DOM element with the card contents.
   * @type {Element}
   * @private
   */
  this.element_ = el;

  /**
   * A map of event type to a list of event listener keys for that type
   * @type {Object.<string, Array>}
   * @private
   */
  this.eventListenerKeys_ = {};

  /**
   * Recorded position of the place where the mouse down event occured.
   * Needed to calculate grab point for dragging.
   * @type {?goog.math.Coordinate}
   * @private
   */
  this.mouseDownPosition_ = null;

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
   * Reference to the pile that currently hold this card.
   * @type {?solitario.game.Pile}
   */
  this.pile = null;

  /**
   * Recorded position of the location of the card as assigned by the containing
   * pile.
   * @type {?goog.math.Coordinate}
   */
  this.positionInPile = null;

  /**
   * Recorded z-index of the card as assigned by the containing pile.
   * @type {?number}
   */
  this.zIndexInPile = null;

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
  this.color = (this.suit === solitario.game.Card.Suits_.HEART ||
      this.suit === solitario.game.Card.Suits_.DIAMOND) ? 'red' : 'black';

  /**
   * Enables or disables dragging behaviour on this card.
   * Defaults to false.
   * @type {Boolean}
   */
  this.isDraggable = false;

  // Initialize listeners.
  this.addEventListener(goog.events.EventType.MOUSEDOWN, this.mouseDown_);
  this.addEventListener(goog.events.EventType.TRANSITIONEND, function(evnt) {
    // Bubble up the transitionend event on this.element_.
    goog.events.dispatchEvent(this, evnt);
  });
};
goog.inherits(solitario.game.Card, goog.events.EventTarget);


/**
 * Class names used in the card object.
 * @enum {string}
 * @const
 * @private
 */
solitario.game.Card.ClassNames_ = {
  DROP_TARGET: 'droptarget',
  FANNED: 'fanned',
  GROUPER: 'grouper',
  REVEALED: 'revealed',
  SLANTED: 'slanted'
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
 * Constants for the card suits.
 * @enum {string}
 * @const
 * @private
 */
solitario.game.Card.Suits_ = {
  CLUB: 'club',
  DIAMOND: 'diamond',
  HEART: 'heart',
  SPADE: 'spade'
};


/**
 * Event handler for mouse down.
 *
 * @param {goog.events.BrowserEvent} evnt Mouse down event.
 * @private
 */
solitario.game.Card.prototype.mouseDown_ = function(evnt) {
  if (!evnt.isMouseActionButton() || !this.isDraggable) {
    return;
  }
  evnt.preventDefault();
  evnt.stopPropagation();

  var currentPosition = this.getAbsolutePosition();
  this.mouseDownPosition_ = new goog.math.Coordinate(
      evnt.clientX - currentPosition.x,
      evnt.clientY - currentPosition.y);

  if (this.isGrouper()) {
    var groupDragEvent = new goog.events.Event(
        solitario.game.constants.Events.GROUP_DRAG_START, this);
    goog.events.dispatchEvent(this, groupDragEvent);
    return;
  }

  this.disableAnimation();
  this.showDraggingIndicator();

  this.addEventListener(goog.events.EventType.MOUSEUP, this.mouseUp_);
  goog.events.listen(goog.dom.getDocument(), goog.events.EventType.MOUSEUP,
                     this.mouseUp_, false, this);
  goog.events.listen(goog.dom.getDocument(), goog.events.EventType.MOUSEMOVE,
                     this.mouseMove_, false, this);

  var dragStartEvent = new goog.events.Event(
      solitario.game.constants.Events.DRAG_START, this);
  goog.events.dispatchEvent(this, dragStartEvent);
};


/**
 * Event handler for mouse move. Starts drag operation if moved more than the
 * threshold value.
 *
 * @param {goog.events.BrowserEvent} evnt Mouse move or mouse out event.
 * @private
 */
solitario.game.Card.prototype.mouseMove_ = function(evnt) {
  // Set the card above everything else.
  this.setZIndex(solitario.game.constants.MAX_ZINDEX);

  var x = evnt.clientX - this.mouseDownPosition_.x;
  var y = evnt.clientY - this.mouseDownPosition_.y;
  var newLocation = new goog.math.Coordinate(
      (x < 0) ? 0 : x,
      (y < 0) ? 0 : y);
  this.setPosition(solitario.game.utils.toRelativeUnits(newLocation));

  var dragMoveEvent = new goog.events.Event(
      solitario.game.constants.Events.DRAG_MOVE, this);
  goog.events.dispatchEvent(this, dragMoveEvent);
};


/**
 * Event handler for mouse up. Removes mouse move, mouse out and mouse up event
 * handlers.
 *
 * @param {goog.events.BrowserEvent} evnt Mouse up event.
 * @private
 */
solitario.game.Card.prototype.mouseUp_ = function(evnt) {
  this.removeEventListenersByType(goog.events.EventType.MOUSEUP);
  goog.events.unlisten(goog.dom.getDocument(), goog.events.EventType.MOUSEUP,
                       this.mouseUp_, false, this);
  goog.events.unlisten(goog.dom.getDocument(), goog.events.EventType.MOUSEMOVE,
                       this.mouseMove_, false, this);

  goog.dom.classes.remove(this.element_,
      solitario.game.constants.ClassNames.DRAGGING,
      solitario.game.constants.ClassNames.NO_ANIMATION);
  this.mouseDownPosition_ = null;

  var dragEndEvent = new goog.events.Event(
      solitario.game.constants.Events.DRAG_END, this);
  goog.events.dispatchEvent(this, dragEndEvent);
};


/**
 * Adds a listener function for the specified event type.
 *
 * @param {string} type Event type.
 * @param {Function} listener Callback method.
 */
solitario.game.Card.prototype.addEventListener = function(type, listener) {
  var key = goog.events.listen(this.element_, type, listener, false, this);
  this.eventListenerKeys_[type] = this.eventListenerKeys_[type] || [];
  this.eventListenerKeys_[type].push(key);
};


/**
 * Detaches the card from its holding pile.
 */
solitario.game.Card.prototype.detachFromPile = function() {
  if (this.pile) {
    this.pile.pop();
    this.pile = null;
  }
};


/**
 * Disables the CSS3 animation settings on the card.
 */
solitario.game.Card.prototype.disableAnimation = function() {
  goog.dom.classes.add(this.element_,
      solitario.game.constants.ClassNames.NO_ANIMATION);
};


/**
 * Disables this card from forming a group of fanned cards when draged.
 */
solitario.game.Card.prototype.disableGrouper = function() {
  goog.dom.classes.remove(this.element_,
      solitario.game.Card.ClassNames_.GROUPER);
};


/**
 * Enables the CSS3 animation settings on the card.
 */
solitario.game.Card.prototype.enableAnimation = function() {
  goog.dom.classes.remove(this.element_,
      solitario.game.constants.ClassNames.NO_ANIMATION);
};


/**
 * Enables this card to form a group of fanned cards when dragged.
 */
solitario.game.Card.prototype.enableGrouper = function() {
  goog.dom.classes.add(this.element_,
      solitario.game.Card.ClassNames_.GROUPER);
};


/**
 * Gets the absolute position of the card in the viewport, in px.
 *
 * @return {goog.math.Coordinate} The absolute position of the card.
 */
solitario.game.Card.prototype.getAbsolutePosition = function() {
  if (!this.absolutePosition_) {
    this.absolutePosition_ = goog.style.getPosition(this.element_);
  }
  return this.absolutePosition_;
};


/**
 * Returns the absolute size of the card in px.
 *
 * @return {goog.math.Size} The size of the card.
 */
solitario.game.Card.prototype.getAbsoluteSize = function() {
  var absDimensions = solitario.game.utils.toAbsoluteUnits(
      solitario.game.constants.Card.WIDTH,
      solitario.game.constants.Card.HEIGHT);
  return new goog.math.Size(absDimensions.x, absDimensions.y);
};


/**
 * Returns the absolute position (in px) where the mouse was last clicked on
 * this card.
 *
 * @return {?goog.math.Coordinate} The absolute position of the mouse down
 *     event.
 */
solitario.game.Card.prototype.getMouseDownPosition = function() {
  return this.mouseDownPosition_;
};


/**
 * Gets the relative position of the card in the viewport, in ems.
 *
 * @return {goog.math.Coordinate} The relative position of the card.
 */
solitario.game.Card.prototype.getPosition = function() {
  return solitario.game.utils.toRelativeUnits(this.getAbsolutePosition());
};


/**
 * Returns the rectangular region this card is currently occupying.
 * Note that this will have the same width and height for all cards.
 *
 * @return {goog.math.Rect} The rectangular region.
 */
solitario.game.Card.prototype.getRect = function() {
  var position = this.getAbsolutePosition();
  var size = this.getAbsoluteSize();
  return new goog.math.Rect(position.x, position.y, size.width, size.height);
};


/**
 * Obtains the current z-index of this card.
 *
 * @return {number} The z-index as an integer.
 */
solitario.game.Card.prototype.getZIndex = function() {
  return parseInt(this.element_.style.zIndex);
};


/**
 * Disables the visual clue indicating the card is being dragged.
 */
solitario.game.Card.prototype.hideDraggingIndicator = function() {
  goog.dom.classes.remove(this.element_,
      solitario.game.constants.ClassNames.DRAGGING);
};


/**
 * Disables the visual clue marking the card as a droppable region.
 */
solitario.game.Card.prototype.hideDroppableIndicator = function() {
  goog.dom.classes.remove(this.element_,
      solitario.game.Card.ClassNames_.DROP_TARGET);
};


/**
 * Hides the drop shadow used when the card is fanned down.
 */
solitario.game.Card.prototype.hideFannedShadow = function() {
  goog.dom.classes.remove(this.element_,
      solitario.game.Card.ClassNames_.FANNED);
};


/**
 * Returns whether this card can form a group of fanned cards when dragged.
 *
 * @return {boolean} True if the card can from a group.
 */
solitario.game.Card.prototype.isGrouper = function() {
  return goog.dom.classes.has(this.element_,
      solitario.game.Card.ClassNames_.GROUPER);
};


/**
 * Returns whether or not the card is revealed.
 *
 * @return {boolean} True if revealed.
 */
solitario.game.Card.prototype.isRevealed = function() {
  return goog.dom.classes.has(this.element_,
      solitario.game.Card.ClassNames_.REVEALED);
};


/**
 * Removes all listener functions for the specified event type.
 *
 * @param {number} type The type of event to remove listeners for.
 */
solitario.game.Card.prototype.removeEventListenersByType = function(type) {
  if (!this.eventListenerKeys_[type]) {
    return;
  }
  for (var i = this.eventListenerKeys_[type].length - 1; i >= 0; i--) {
    goog.events.unlistenByKey(this.eventListenerKeys_[type][i]);
  }
};


/**
 * If the card belongs to a pile, return to its original position, otherwise
 * do nothing.
 */
solitario.game.Card.prototype.returnToPile = function() {
  if (this.pile) {
    this.pile.hideDroppableIndicator();
  }
  if (this.positionInPile) {
    this.setPosition(this.positionInPile);
  }
  if (this.zIndexInPile) {
    // Trigger final z-index update at end of position change to allow time for
    // animations to finish.
    goog.events.listenOnce(this.element_, goog.events.EventType.TRANSITIONEND,
        function(evnt) {
          this.setZIndex(this.zIndexInPile);
        }, false, this);
  }
};


/**
 * Reveals the card.
 */
solitario.game.Card.prototype.reveal = function() {
  goog.dom.classes.add(this.element_, solitario.game.Card.ClassNames_.REVEALED);
  // Make it draggable when the animation finishes.
  goog.events.listenOnce(this.element_, goog.events.EventType.TRANSITIONEND,
      function(evnt) {
        this.isDraggable = true;
      }, false, this);
};


/**
 * Sets the absolute position of the card in the viewport, in px.
 *
 * @param {goog.math.Coordinate} position Absolute position to set the card to.
 */
solitario.game.Card.prototype.setAbsolutePosition = function(position) {
  this.absolutePosition_ = position;
  goog.style.setPosition(this.element_, position.x, position.y);
};


/**
 * Sets the relative position of the card in the viewport, in ems.
 *
 * @param {goog.math.Coordinate} position Relative position to set the card to.
 */
solitario.game.Card.prototype.setPosition = function(position) {
  this.absolutePosition_ = null;
  var leftEms = solitario.game.utils.getEmStyleValue(position.x);
  var topEms = solitario.game.utils.getEmStyleValue(position.y);
  goog.style.setPosition(this.element_, leftEms, topEms);
};


/**
 * Modifies the z-index of this card.
 *
 * @param {number} zIndex The z-index as an integer.
 */
solitario.game.Card.prototype.setZIndex = function(zIndex) {
  this.element_.style.zIndex = zIndex + '';  // explicit string cast.
};


/**
 * Enables a visual clue indicating the card is being dragged.
 */
solitario.game.Card.prototype.showDraggingIndicator = function() {
  goog.dom.classes.add(this.element_,
      solitario.game.constants.ClassNames.DRAGGING);
};


/**
 * Enables a visual clue marking the card as a droppable region.
 */
solitario.game.Card.prototype.showDroppableIndicator = function() {
  goog.dom.classes.add(this.element_,
      solitario.game.Card.ClassNames_.DROP_TARGET);
};


/**
 * Shows the drop shadow used when the card is fanned down.
 */
solitario.game.Card.prototype.showFannedShadow = function() {
  goog.dom.classes.add(this.element_,
      solitario.game.Card.ClassNames_.FANNED);
};


/**
 * Rotates the card slightly to the right.
 */
solitario.game.Card.prototype.slant = function() {
  goog.dom.classes.add(this.element_, solitario.game.Card.ClassNames_.SLANTED);
};


/**
 * Removes any rotation on the card.
 */
solitario.game.Card.prototype.straighten = function() {
  goog.dom.classes.remove(this.element_,
      solitario.game.Card.ClassNames_.SLANTED);
};
