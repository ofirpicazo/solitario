// Copyright 2013 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Class to represent a group of fanned down cards.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.CardGroup');

goog.require('goog.events.EventTarget');



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
};
goog.inherits(solitario.game.CardGroup, goog.events.EventTarget);
