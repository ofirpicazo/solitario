// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Provides common functions used across the game.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.utils');

goog.require('goog.dom');
goog.require('goog.math.Coordinate');
goog.require('solitario.pubsub');


/**
 * Cache of the document.style.fontSize in order to avoid relayouts.
 * @type {?number}
 * @private
 */
solitario.game.utils.fontSize_ = null;


// Subscribe to PubSub messages.
solitario.pubsub.subscribe(solitario.pubsub.Topics.RESIZE_BOARD,
    function() {
      solitario.game.utils.resetFontSize_();
    });


/**
 * Retrieves the current font size from the document.style.
 *
 * @private
 */
solitario.game.utils.resetFontSize_ = function() {
  solitario.game.utils.fontSize_ = parseFloat(
      goog.dom.getDocument().body.style.fontSize);
};


/**
 * Converts the units passed from relative (em) to absolute (px), according to
 * the current proportion in the viewport. The second argument will be ignored
 * if the first argument is a coordinate.
 * When passing a coordinate, x is considered left, and y is considered top.
 *
 * @param {string|number|goog.math.Coordinate} arg1 Left position or coordinate.
 * @param {string|number=} opt_arg2 Top position.
 *
 * @return {number|goog.math.Coordinate} A single number if only one argument
 *     was passed, or a coordinate if two were passed.
 */
solitario.game.utils.toAbsoluteUnits = function(arg1, opt_arg2) {
  var leftPx, topPx, leftEm, topEm;

  if (arg1 instanceof goog.math.Coordinate) {
    leftEm = arg1.x;
    topEm = arg1.y;
  } else if (typeof opt_arg2 != 'undefined') {
    leftEm = arg1;
    topEm = opt_arg2;
  } else {
    return arg1 * solitario.game.utils.fontSize_;
  }

  leftPx = leftEm * solitario.game.utils.fontSize_;
  topPx = topEm * solitario.game.utils.fontSize_;

  return new goog.math.Coordinate(leftPx, topPx);
};


/**
 * Converts the units passed from absolute (px) to relative (em), according to
 * the current proportion in the viewport. The second argument will be ignored
 * if the first argument is a coordinate.
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

  if (arg1 instanceof goog.math.Coordinate) {
    leftPx = arg1.x;
    topPx = arg1.y;
  } else if (typeof opt_arg2 != 'undefined') {
    leftPx = arg1;
    topPx = opt_arg2;
  } else {
    return arg1 / solitario.game.utils.fontSize_;
  }

  leftEm = leftPx / solitario.game.utils.fontSize_;
  topEm = topPx / solitario.game.utils.fontSize_;

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
