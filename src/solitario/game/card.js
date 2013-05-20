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
   * Needed to calculate grab point for dragging.
   * @type {goog.math.Coordinate}
   * @private
   */
  this.mouseDownPosition_;


  /**
   * A map of event type to a list of event listener keys for that type
   *
   * @type {Object.<string, Array>}
   */
  this.eventListenerKeys_ = {};

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

  // Initialize listeners.
  this.addEventListener(goog.events.EventType.MOUSEDOWN, this.mouseDown_);
};


/**
 * Class names used in the card object.
 * @enum {string}
 * @const
 * @private
 */
solitario.game.Card.ClassNames_ = {
  NO_ANIMATION: 'no-animation',
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

  goog.dom.classes.add(this.element_,
      solitario.game.Card.ClassNames_.NO_ANIMATION);
  this.addEventListener(goog.events.EventType.MOUSEUP, this.mouseUp_);
  goog.events.listen(goog.dom.getDocument(), goog.events.EventType.MOUSEMOVE,
                     this.mouseMove_, false, this);
  goog.events.listen(goog.dom.getDocument(), goog.events.EventType.MOUSEOUT,
                     this.mouseMove_, false, this);

  var currentPosition = this.getAbsolutePosition();
  this.mouseDownPosition_ = new goog.math.Coordinate(
      event.clientX - currentPosition.x,
      event.clientY - currentPosition.y);
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
  var x = event.clientX - this.mouseDownPosition_.x;
  var y = event.clientY - this.mouseDownPosition_.y;
  var newLocation = new goog.math.Coordinate(
      (x < 0) ? 0 : x,
      (y < 0) ? 0 : y);
  this.setAbsolutePosition(newLocation);
};


/**
 * Event handler for mouse up. Removes mouse move, mouse out and mouse up event
 * handlers.
 *
 * @param {goog.events.BrowserEvent} event Mouse up event.
 * @private
 */
solitario.game.Card.prototype.mouseUp_ = function(event) {
  goog.events.unlisten(goog.dom.getDocument(), goog.events.EventType.MOUSEMOVE,
                       this.mouseMove_, false, this);
  goog.events.unlisten(goog.dom.getDocument(), goog.events.EventType.MOUSEOUT,
                       this.mouseMove_, false, this);
  this.removeEventListenersByType(goog.events.EventType.MOUSEUP);
  goog.dom.classes.remove(this.element_,
      solitario.game.Card.ClassNames_.NO_ANIMATION);
  this.mouseDownPosition_ = null;
};


/**
 * Adds a listener function for the specified event type.
 *
 * @param {string} type Event type.
 * @param {Function} listener Callback method.
 * @return {number} Unique key for the listener
 */
solitario.game.Card.prototype.addEventListener = function(type, listener) {
  var key = goog.events.listen(this.element_, type, goog.bind(listener, this));
  this.eventListenerKeys_[type] = this.eventListenerKeys_[type] || [];
  this.eventListenerKeys_[type].push(key);
};


/**
 * Gets the absolute position of the card in the viewport, in px.
 *
 * @return {goog.math.Coordinate} The bbsolute position of the card.
 */
solitario.game.Card.prototype.getAbsolutePosition = function() {
  return goog.style.getPosition(this.element_);
};


/**
 * Obtains the current z-index of this card.
 *
 * @return {number} The z-index as an integer.
 */
solitario.game.Card.prototype.getZIndex = function() {
  return parseInt(this.element_.style.zIndex);
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
 * Removes all listener functions for the specified event type.
 *
 * @param {number} type The type of event to remove listeners for.
 */
solitario.game.Card.prototype.removeEventListenersByType = function(type) {
  if (!this.eventListenerKeys_[type]) {
    return;
  }
  for (var i = 0; i < this.eventListenerKeys_[type].length; i++) {
    goog.events.unlistenByKey(this.eventListenerKeys_[type][i]);
  };
};


/**
 * Reveals the card.
 */
solitario.game.Card.prototype.reveal = function() {
  goog.dom.classes.add(this.element_, solitario.game.Card.ClassNames_.REVEALED);
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
 * Sets the absolute position of the card in the viewport, in px.
 *
 * @param {goog.math.Coordinate} position Absolute position to set the card to.
 */
solitario.game.Card.prototype.setAbsolutePosition = function(position) {
  goog.style.setPosition(this.element_, position.x, position.y);
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
