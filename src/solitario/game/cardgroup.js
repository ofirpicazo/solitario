// Copyright 2013 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Class to represent a group of fanned down cards.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.CardGroup');

goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('solitario.game.constants');
goog.require('solitario.game.utils');



/**
 * Class to represent a group of fanned down cards.
 *
 * @param {Array.<solitario.game.Card>} group List of cards that form the group.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
solitario.game.CardGroup = function(group) {
  // Call superclass constructor.
  goog.base(this);

  /**
   * List of cards that conform the group.
   * @type {Array.<solitario.game.Card>}
   */
  this.cards = group;

  /**
   * Recorded position of the place where the mouse down event occured.
   * Needed to calculate grab point for dragging.
   * @type {?goog.math.Coordinate}
   * @private
   */
  this.mouseDownPosition_ = null;

  /**
   * Drag a drop handle, always the first card of the group.
   * @type {solitario.game.Card}
   * @private
   */
  this.topCard_ = this.cards[0];

  /**
   * Absolute size from top to bottom card of this group in pixels.
   * @type {goog.math.Size}
   * @private
   */
  this.size_ = this.getAbsoluteSize_();

  /**
   * Tableu that this card group belongs to.
   * @type {solitario.game.Tableu}
   */
  this.tableu = this.topCard_.pile;

  this.initialize_();
};
goog.inherits(solitario.game.CardGroup, goog.events.EventTarget);


/**
 * Returns the absolute size of the card group in pixels.
 * Calculating this is expensive, so we cache its value.
 *
 * @return {goog.math.Size} The size of the group.
 * @private
 */
solitario.game.CardGroup.prototype.getAbsoluteSize_ = function() {
  if (!this.size_) {
    var cardSize = this.topCard_.getAbsoluteSize();
    var absoluteIntercardDistance = solitario.game.utils.toAbsoluteUnits(
        solitario.game.constants.TABLEU_INTERCARD_DISTANCE_REVEALED);
    var tableuHeight = cardSize.height + ((this.cards.length - 1) *
        absoluteIntercardDistance);
    this.size_ = new goog.math.Size(cardSize.width, tableuHeight);
  }

  return this.size_;
};


/**
 * Setup listeners for drag and drop actions and sets up necessary css classes.
 *
 * @private
 */
solitario.game.CardGroup.prototype.initialize_ = function() {
  if (!this.topCard_.getMouseDownPosition()) {
    throw new Error('The grouper card did not have a mouse down position!');
  }

  this.mouseDownPosition_ = this.topCard_.getMouseDownPosition();

  for (var i = 0; i < this.cards.length; i++) {
    this.cards[i].disableAnimation();
    this.cards[i].showDraggingIndicator();
    // Send the whole group to the top keeping relative positions.
    this.cards[i].setZIndex(solitario.game.constants.MAX_ZINDEX -
        this.cards.length + i);
  }

  this.topCard_.addEventListener(goog.events.EventType.MOUSEUP,
      goog.bind(this.mouseUp_, this));
  goog.events.listen(goog.dom.getDocument(), goog.events.EventType.MOUSEUP,
                     this.mouseUp_, false, this);
  goog.events.listen(goog.dom.getDocument(), goog.events.EventType.MOUSEMOVE,
                     this.mouseMove_, false, this);
};


/**
 * Event handler for mouse move. Moves the entire group keeping cards on their
 * relative position to each other.
 *
 * @param {goog.events.BrowserEvent} evnt Mouse move or mouse out event.
 * @private
 */
solitario.game.CardGroup.prototype.mouseMove_ = function(evnt) {
  var x = evnt.clientX - this.mouseDownPosition_.x;
  var y = evnt.clientY - this.mouseDownPosition_.y;
  var newLocation = new goog.math.Coordinate(
      (x < 0) ? 0 : x,
      (y < 0) ? 0 : y);
  this.setAbsolutePosition_(newLocation);

  var dragMoveEvent = new goog.events.Event(
      solitario.game.constants.Events.GROUP_DRAG_MOVE, this);
  goog.events.dispatchEvent(this, dragMoveEvent);
};


/**
 * Event handler for mouse up. Removes mouse move, mouse out and mouse up event
 * handlers.
 *
 * @param {goog.events.BrowserEvent} evnt Mouse up event.
 * @private
 */
solitario.game.CardGroup.prototype.mouseUp_ = function(evnt) {
  this.topCard_.removeEventListenersByType(goog.events.EventType.MOUSEUP);
  goog.events.unlisten(goog.dom.getDocument(), goog.events.EventType.MOUSEUP,
                       this.mouseUp_, false, this);
  goog.events.unlisten(goog.dom.getDocument(), goog.events.EventType.MOUSEMOVE,
                       this.mouseMove_, false, this);

  this.mouseDownPosition_ = null;

  for (var i = this.cards.length - 1; i >= 0; i--) {
    this.cards[i].enableAnimation();
    this.cards[i].hideDraggingIndicator();
  }

  var dragEndEvent = new goog.events.Event(
      solitario.game.constants.Events.GROUP_DRAG_END, this);
  goog.events.dispatchEvent(this, dragEndEvent);
};


/**
 * Moves the entire group to a different position, keeping the cards on their
 * relative positions.
 *
 * @param {goog.math.Coordinate} position Absolute position to set the group to.
 * @private
 */
solitario.game.CardGroup.prototype.setAbsolutePosition_ = function(position) {
  var absoluteIntercardDistance = solitario.game.utils.toAbsoluteUnits(
      solitario.game.constants.TABLEU_INTERCARD_DISTANCE_REVEALED);

  this.topCard_.setAbsolutePosition(position);
  for (var i = 1; i < this.cards.length; i++) {
    position.y += absoluteIntercardDistance;
    this.cards[i].setAbsolutePosition(position);
  }
};


/**
 * Detaches the entire group from its holding pile.
 */
solitario.game.CardGroup.prototype.detachFromPile = function() {
  for (var i = this.cards.length - 1; i >= 0; i--) {
    this.cards[i].detachFromPile();
  }
};


/**
 * Returns the rectangular region this group is currently occupying.
 *
 * @return {goog.math.Rect} The rectangular region.
 */
solitario.game.CardGroup.prototype.getRect = function() {
  var topCardRect = this.topCard_.getRect();
  var tableuSize = this.getAbsoluteSize_();

  return new goog.math.Rect(topCardRect.left, topCardRect.top, tableuSize.width,
      tableuSize.height);
};


/**
 * Return all the cards in the group to their original position in the tableu.
 */
solitario.game.CardGroup.prototype.returnToPile = function() {
  for (var i = this.cards.length - 1; i >= 0; i--) {
    window.setTimeout(goog.bind(this.cards[i].returnToPile, this.cards[i]),
        i * solitario.game.constants.CARD_GROUP_DROP_ANIMATION_DURATION);
  }
};
