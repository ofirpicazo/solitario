// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Tests for the utils.js module.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.utils_test');

goog.require('goog.dom');
goog.require('goog.math.Coordinate');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');
goog.require('solitario.game.utils');

goog.setTestOnly('Tests for utils module');

/** @type {goog.testing.PropertyReplacer} */
var stubs;

setUp = function() {
  stubs = new goog.testing.PropertyReplacer();
  stubs.replace(goog.dom, 'getDocument', function() {
    return { 'body': { 'style': { 'fontSize': '16.9px' } } };
  });
};

/**
 * Tests the conversion from px to em using a goog.math.Coordinate object.
 */
testToRelativeUnitsUsingCoordinate = function() {
  var absoluteCoordinate = new goog.math.Coordinate(625.2999877929688,
                                                    304.1833190917969);
  var relativeCoordinate = solitario.game.utils.toRelativeUnits(
      absoluteCoordinate);
  var expectedCoordinate = new goog.math.Coordinate(37, 18);
  assertObjectEquals(expectedCoordinate, relativeCoordinate);
};

/**
 * Tests the conversion from px to em using 2 arguments (top, left).
 */
testToRelativeUnitsUsingArgs = function() {

};
