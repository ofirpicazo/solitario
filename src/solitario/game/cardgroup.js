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
   * @private
   */
  this.group_ = group;

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
  this.topCard_ = this.group_[0];

  this.initialize_();
};
goog.inherits(solitario.game.CardGroup, goog.events.EventTarget);


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

  for (var i = 0; i < this.group_.length; i++) {
    this.group_[i].disableAnimation();
    this.group_[i].showDraggingIndicator();
  }

  this.topCard_.addEventListener(goog.events.EventType.MOUSEUP,
      goog.bind(this.mouseUp_, this));
  goog.events.listen(goog.dom.getDocument(), goog.events.EventType.MOUSEMOVE,
                     this.mouseMove_, false, this);
  goog.events.listen(goog.dom.getDocument(), goog.events.EventType.MOUSEOUT,
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
  this.setPosition_(solitario.game.utils.toRelativeUnits(newLocation));

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
  goog.events.unlisten(goog.dom.getDocument(), goog.events.EventType.MOUSEMOVE,
                       this.mouseMove_, false, this);
  goog.events.unlisten(goog.dom.getDocument(), goog.events.EventType.MOUSEOUT,
                       this.mouseMove_, false, this);
  this.topCard_.removeEventListenersByType(goog.events.EventType.MOUSEUP);

  this.mouseDownPosition_ = null;

  for (var i = 0; i < this.group_.length; i++) {
    this.group_[i].enableAnimation();
    this.group_[i].hideDraggingIndicator();
  }

  var dragEndEvent = new goog.events.Event(
      solitario.game.constants.Events.GROUP_DRAG_END, this);
  goog.events.dispatchEvent(this, dragEndEvent);
};


/**
 * Moves the entire group to a different position, keeping the cards on their
 * relative positions.
 *
 * @param {goog.math.Coordinate} position Relative position to set the group to.
 * @private
 */
solitario.game.CardGroup.prototype.setPosition_ = function(position) {
  this.topCard_.setPosition(position);
  for (var i = 1; i < this.group_.length; i++) {
    position.y += solitario.game.constants.TABLEU_INTERCARD_DISTANCE_REVEALED;
    this.group_[i].setPosition(position);
  }
};
