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
goog.require('goog.style');
goog.require('solitario.game.constants');
goog.require('solitario.game.utils');


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
   * Recorded position of the place where the mouse down event occured.
   * Needed to calculate threshold for triggering dragging.
   * @type {goog.math.Coordinate}
   * @private
   */
  this.mouseDownPosition_;

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
  this.color = (this.suit === solitario.game.Card.Suits_.HEART ||
                this.suit === solitario.game.Card.Suits_.DIAMOND) ?
                'red' : 'black';

  /**
   * Enables or disables dragging behaviour on this card.
   * Defaults to false.
   * @type {Boolean}
   */
  this.isDraggable = false;
};


/**
 * Class names used in the card object.
 * @enum {string}
 * @const
 * @private
 */
solitario.game.Card.ClassNames_ = {
  REVEALED: 'revealed',
  SLANT_LEFT: 'slanted-left',
  SLANT_RIGHT: 'slanted-right'
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
 * @param {goog.events.BrowserEvent} event Mouse down event.
 * @private
 */
solitario.game.Card.prototype.mouseDown_ = function(event) {
  if (!event.isMouseActionButton() || !this.isDraggable) {
    return;
  }

  goog.events.listen(this.element_, goog.events.EventType.MOUSEMOVE,
                     this.mouseMove_, false, this);
  goog.events.listen(this.element_, goog.events.EventType.MOUSEOUT,
                     this.mouseMove_, false, this);
  goog.events.listen(this.element_, goog.events.EventType.MOUSEUP,
                     this.mouseUp_, false, this);

  this.mouseDownPosition_ = new goog.math.Coordinate(
      event.clientX, event.clientY);

  event.preventDefault();
};


/**
 * Event handler for mouse move. Starts drag operation if moved more than the
 * threshold value.
 *
 * @param {goog.events.BrowserEvent} event Mouse move or mouse out event.
 * @private
 */
solitario.game.Card.prototype.mouseMove_ = function(event) {
  var distance = Math.abs(event.clientX - this.mouseDownPosition_.x) +
      Math.abs(event.clientY - this.mouseDownPosition_.y);
  // Fire dragStart event if the drag distance exceeds the threshold or if the
  // mouse leave the dragged element.
  var distanceAboveThreshold =
      distance > solitario.game.constants.INIT_DRAG_DISTANCE_THRESHOLD;
  var mouseOutOnDragElement = event.type == goog.events.EventType.MOUSEOUT &&
      event.target == this.element_;
  if (distanceAboveThreshold || mouseOutOnDragElement) {
    goog.events.unlisten(currentDragElement, goog.events.EventType.MOUSEMOVE,
                         this.mouseMove_, false, this);
    goog.events.unlisten(currentDragElement, goog.events.EventType.MOUSEOUT,
                         this.mouseMove_, false, this);
    goog.events.unlisten(currentDragElement, goog.events.EventType.MOUSEUP,
                         this.mouseUp_, false, this);

    this.startDrag_(event, this);
  }
};


/**
 * Event handler for mouse up. Removes mouse move, mouse out and mouse up event
 * handlers.
 *
 * @param {goog.events.BrowserEvent} event Mouse up event.
 * @private
 */
solitario.game.Card.prototype.mouseUp_ = function(event) {
  goog.events.unlisten(this.element_, goog.events.EventType.MOUSEMOVE,
                       this.mouseMove_, false, this);
  goog.events.unlisten(this.element_, goog.events.EventType.MOUSEOUT,
                       this.mouseMove_, false, this);
  goog.events.unlisten(this.element_, goog.events.EventType.MOUSEUP,
                       this.mouseUp_, false, this);
  this.mouseDownPosition_ = null;
};


/**
 * Event handler that's used to start drag.
 *
 * @param {goog.events.BrowserEvent} event Mouse move event.
 * @private
 */
solitario.game.Card.prototype.startDrag_ = function(event) {
  // Dispatch DRAGSTART event
  var dragStartEvent = new goog.events.Event(
      solitario.game.constants.Events.DRAG_START, this);
  goog.events.dispatchEvent(this, dragStartEvent);

  // Get the source element and create a drag element for it.
  var el = item.getCurrentDragElement();
  this.dragEl_ = this.createDragElement(el);
  var doc = goog.dom.getOwnerDocument(el);
  doc.body.appendChild(this.dragEl_);

  this.dragger_ = this.createDraggerFor(el, this.dragEl_, event);
  this.dragger_.setScrollTarget(this.scrollTarget_);

  goog.events.listen(this.dragger_, goog.fx.Dragger.EventType.DRAG,
                     this.moveDrag_, false, this);

  goog.events.listen(this.dragger_, goog.fx.Dragger.EventType.END,
                     this.endDrag, false, this);

  // IE may issue a 'selectstart' event when dragging over an iframe even when
  // default mousemove behavior is suppressed. If the default selectstart
  // behavior is not suppressed, elements dragged over will show as selected.
  goog.events.listen(doc.body, goog.events.EventType.SELECTSTART,
                     this.suppressSelect_);

  this.recalculateDragTargets();
  this.recalculateScrollableContainers();
  this.activeTarget_ = null;
  this.initScrollableContainerListeners_();
  this.dragger_.startDrag(event);

  event.preventDefault();
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
 * Modifies the z-index of this card.
 *
 * @param {number} zIndex The z-index as an integer.
 */
solitario.game.Card.prototype.setZIndex = function(zIndex) {
  this.element_.style.zIndex = zIndex + '';  // explicit string cast.
};


/** @inheritDoc */
solitario.game.Card.prototype.isDroppable = function() {

};


/**
 * Returns whether or not the card is revealed.
 *
 * @return {boolean} True if revealed.
 */
solitario.game.Card.prototype.isRevealed = function() {
  return goog.dom.classes.has(
      this.element_, solitario.game.Card.ClassNames_.REVEALED);
};


/**
 * Reveals the card.
 */
solitario.game.Card.prototype.reveal = function() {
  goog.dom.classes.add(this.element_, solitario.game.Card.ClassNames_.REVEALED);
};


/**
 * Rotates the card slightly to the left.
 */
solitario.game.Card.prototype.slantLeft = function() {
  goog.dom.classes.add(this.element_,
                       solitario.game.Card.ClassNames_.SLANT_LEFT);
};


/**
 * Rotates the card slightly to the right.
 */
solitario.game.Card.prototype.slantRight = function() {
  goog.dom.classes.add(this.element_,
                       solitario.game.Card.ClassNames_.SLANT_RIGHT);
};


/**
 * Sets the relative position of the card in the viewport, in ems.
 *
 * @param {goog.math.Coordinate} position Relative position to set the card to.
 */
solitario.game.Card.prototype.setPosition = function(position) {
  var leftEms = solitario.game.utils.getEmStyleValue(position.x);
  var topEms = solitario.game.utils.getEmStyleValue(position.y);
  goog.style.setPosition(this.element_, leftEms, topEms);
};

/**
 * Adds a listener function for the specified event type.
 *
 * @param {string} type Event type.
 * @param {Function} listener Callback method.
 * @return {number} Unique key for the listener
 */
solitario.game.Card.prototype.addEventListener = function(type, listener) {
  return goog.events.listen(this.element_, type, goog.bind(listener, this));
};


/**
 * Removes a listener function for the specified key.
 *
 * @param {number} key The key returned by addEventListener() for this event
 *     listener.
 * @return {boolean} Indicating whether the listener was there to remove.
 */
solitario.game.Card.prototype.removeEventListenerByKey =
    function(key) {
  return goog.events.unlistenByKey(key);
};
