// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Stock of cards in the game.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.Stock');

goog.require('solitario.game.Card');
goog.require('solitario.game.Pile');


/**
 * Class to represent the stock of cards in the game.
 *
 * @param {!Element} el DOM element representing the stock.
 * @constructor
 * @extends {solitario.game.Pile}
 */
solitario.game.Stock = function(el) {
  goog.base(this, el);
};
goog.inherits(solitario.game.Stock, solitario.game.Pile);


/**
 * Initializes the Stock with the given array of cards, the last card will
 * be revealed.
 *
 * @param {Array.<solitario.game.Card>} cards Cards to be stacked in the stock.
 */
solitario.game.Stock.prototype.initialize = function(cards) {
  var stockPosition = this.getPosition_();
  var currentZindex = this.getZIndex_();

  // Set position and z-index for each card.
  goog.array.forEach(cards, function(card) {
    this.push(card);
    card.setPosition(stockPosition);
    card.setZIndex(currentZindex);
    currentZindex += solitario.game.Pile.INTERCARD_ZINDEX;
  }, this);

  // Slant the second and third last cards to create stack effect.
  this.pile_[1].slantLeft();
  this.pile_[2].slantRight();
};
