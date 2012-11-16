// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Interface to mark objects as droppable.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.Droppable');


/**
 * Droppable interface.
 *
 * @interface
 */
solitario.game.Droppable = function() {};


/**
 * Method to check if an element can accept another to be dropped on.
 *
 * @param {!Object} droppedObj Object to be dropped.
 *
 * @return {Boolean} Whether or not the droppedObj can be dropped over this obj.
 */
solitario.game.Droppable.prototype.isDroppable = function(droppedObj) {};
