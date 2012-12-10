// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Provides common functions used across the game.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.utils');

goog.require('goog.dom');
goog.require('goog.math.Coordinate');


/**
 * Converts the units passed from absolute (px) to relative (em), according to
 * the current proportion in the viewport. If no unit is specified in the
 * argument then it be consider to be. The second argument is required if the
 * first argument is a string or number and is ignored if the first argument
 * is a coordinate.
 * When passing a coordinate, x is considered left, and y is considered top.
 *
 * @param {string|number|goog.math.Coordinate} arg1 Left position or coordinate.
 * @param {string|number=} opt_arg2 Top position.
 *
 * @return {number|goog.math.Coordinate} A single number if only one argument
 *     was passed, or a coordinate if two were passed.
 */
solitario.game.utils.toRelativeUnits = function(arg1, opt_arg2) {
  var leftPx, topPx, leftEm, topEm;
  var relativeFontSize = parseFloat(goog.dom.getDocument().body.style.fontSize);

  if (arg1 instanceof goog.math.Coordinate) {
    leftPx = arg1.x;
    topPx = arg1.y;
  } else {
    leftPx = arg1;
    topPx = opt_arg2;
  }

  leftEm = Math.round(leftPx / relativeFontSize);
  topEm = Math.round(topPx / relativeFontSize);

  return new goog.math.Coordinate(leftEm, topEm);
};


/**
 * Helper function to create a string to be set into a em-value style
 * property of an element.
 *
 * @param {string|number} value The style value to be used. If a number,
 *     'em' will be appended, otherwise the value will be applied directly.
 *
 * @return {string} The string value for the property.
 */
solitario.game.utils.getEmStyleValue = function(value) {
  if (typeof value == 'number') {
    value = value + 'em';
  }

  return value;
};


/**
 * Returns a random integer between two values, inclusive.
 *
 * @param {number} min Lower limit of the range.
 * @param {number} max Upper limit of the range.
 *
 * @return {number} Random integer between the given range.
 */
solitario.game.utils.getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
