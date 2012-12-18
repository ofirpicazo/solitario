// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Constants used across the game.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.constants');


/**
 * Custom events used in the game.
 * @enum {string}
 * @const
 */
solitario.game.constants.Events = {
  STOCK_TAKEN: 'stockTaken'
};


/**
 * Maximum ZIndex level, things set to this value will always be visible.
 *
 * @type {number}
 */
solitario.game.constants.MAX_ZINDEX = 1000;
