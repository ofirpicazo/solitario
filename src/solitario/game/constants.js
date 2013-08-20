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
 * Possible values for the color of the cards.
 * @enum {string}
 * @const
 */
solitario.game.constants.CardColor = {
  BLACK: 'black',
  RED: 'red'
};


/**
 * Representation of the number associated to each card.
 * @enum {string}
 * @const
 */
solitario.game.constants.CardNumber = {
  ACE: 'A',
  TWO: '2',
  THREE: '3',
  FOUR: '4',
  FIVE: '5',
  SIX: '6',
  SEVEN: '7',
  EIGHT: '8',
  NINE: '9',
  TEN: '10',
  JACK: 'J',
  QUEEN: 'Q',
  KING: 'K'
};


/**
 * Numeric values for each card number.
 * @type {Object.<string, number>}
 * @const
 */
solitario.game.constants.CardValue = {
  'A': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13
};


/**
 * Duration of the delay between cards when dropping them as a group. The value
 * is in milliseconds.
 * @type {number}
 * @const
 */
solitario.game.constants.CARD_GROUP_DROP_ANIMATION_DURATION = 20;


/**
 * Class names used in the various object.
 * @enum {string}
 * @const
 */
solitario.game.constants.ClassNames = {
  DRAGGING: 'dragging',
  NO_ANIMATION: 'no-animation'
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
  GROUP_DRAG_END: 'groupDragEnd',
  GROUP_DRAG_MOVE: 'groupDragMove',
  GROUP_DRAG_START: 'groupDragStart',
  READY: 'ready',
  STOCK_TAKEN: 'stockTaken',
  WASTE_TAKEN: 'wasteTaken'
};


/**
 * Constant for distance threshold, in pixels, an element has to be moved to
 * initiate a drag operation.
 * @type {number}
 */
solitario.game.constants.INIT_DRAG_DISTANCE_THRESHOLD = 5;


/**
 * Maximum ZIndex level, things set to this value will always be visible.
 * @type {number}
 */
solitario.game.constants.MAX_ZINDEX = 1000;


/**
 * The relative distance (ems) between each hidden card in the Tableu.
 * @type {number}
 */
solitario.game.constants.TABLEU_INTERCARD_DISTANCE_HIDDEN = 0.8;


/**
 * The relative distance (ems) between each revealed card in the Tableu.
 * @type {number}
 */
solitario.game.constants.TABLEU_INTERCARD_DISTANCE_REVEALED = 2.2;
