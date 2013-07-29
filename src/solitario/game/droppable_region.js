// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Class to represent a droppable region on the board.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.DroppableRegion');

goog.require('solitario.game.Card');


/**
 * Class to represent a region on the board where cards or groups of cards can
 * be dropped at. Contains a rectangle to determine the position and a
 * reference to the pile it belongs to.
 *
 * @param {!goog.math.Rect} rect The rectangular region this object consists of.
 * @param {!solitario.game.Pile} pile The pile this region belongs to.
 * @constructor
 */
solitario.game.DroppableRegion = function(rect, pile) {
  /**
   * The pile this objects belongs to.
   * @type {solitario.game.Pile}
   */
  this.pile = pile;

  /**
   * Rectangular region
   * @type {goog.math.Rect}
   */
  this.rect = rect;
};
