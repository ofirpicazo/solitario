// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Tableu of cards object.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.Tableu');

goog.require('goog.array');
goog.require('solitario.game.Card');
goog.require('solitario.game.Droppable');
goog.require('solitario.game.Pile');
goog.require('solitario.game.utils');


/**
 * Class to represent a tableu in the game.
 *
 * @param {!Element} el DOM element representing the tableu.
 * @constructor
 * @extends {solitario.game.Pile}
 * @implements {solitario.game.Droppable}
 */
solitario.game.Tableu = function(el) {
  goog.base(this, el);
};
goog.inherits(solitario.game.Tableu, solitario.game.Pile);


/**
 * The relative distance (ems) between each card in the Tableu.
 * @type {number}
 * @private
 */
solitario.game.Tableu.INTERCARD_DISTANCE_ = 0.8;


/**
 * Initializes the Tableu with the given array of cards, the last card will
 * be revealed.
 *
 * @param {Array.<solitario.game.Card>} cards Cards to be stacked in the tableu.
 */
solitario.game.Tableu.prototype.initialize = function(cards) {
  // TODO(ofir): Move card positioning to overriden push() method.
  var currentPosition = this.getPosition_();
  var currentZindex = this.getZIndex_();

  // Set position and z-index for each card.
  goog.array.forEach(cards, function(card) {
    this.push(card);
    card.setPosition(currentPosition);
    card.setZIndex(currentZindex);
    currentPosition.y += solitario.game.Tableu.INTERCARD_DISTANCE_;
    currentZindex += solitario.game.Pile.INTERCARD_ZINDEX;
  }, this);

  // Reveal the card at the top.
  // TODO(ofir): Improve this.
  this.pile_[this.pile_.length - 1].reveal();
};


/** @inheritDoc */
solitario.game.Tableu.prototype.isDroppable = function(droppedObj) {

};
