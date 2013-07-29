// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Constants used across the game.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.constants');


/**
 * Constants for card sizes.
 * @enum {number}
 * @const
 */
solitario.game.constants.Card = {
  HEIGHT: 14,
  WIDTH: 10
};


/**
 * Custom events used in the game.
 * @enum {string}
 * @const
 */
solitario.game.constants.Events = {
  DRAG_END: 'dragEnd',
  DRAG_MOVE: 'dragMove',
  DRAG_START: 'dragStart',
  READY: 'ready',
  STOCK_TAKEN: 'stockTaken'
};


/**
 * Constant for distance threshold, in pixels, an element has to be moved to
 * initiate a drag operation.
 * @type {number}
 */
solitario.game.constants.INIT_DRAG_DISTANCE_THRESHOLD = 5;


/**
 * Maximum ZIndex level, things set to this value will always be visible.
 *
 * @type {number}
 */
solitario.game.constants.MAX_ZINDEX = 1000;
