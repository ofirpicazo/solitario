// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Stock of cards in the game.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.Stock');

goog.require('goog.events.EventType');
goog.require('solitario.game.Card');
goog.require('solitario.game.constants');
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

  /**
   * Unique key to identify the listener for the top card click event.
   * @type {number}
   * @private
   */
  this.topCardClickListenerKey_;
};
goog.inherits(solitario.game.Stock, solitario.game.Pile);


/**
 * Initializes the Stock with the given array of cards, the last card will
 * be revealed.
 *
 * @param {Array.<solitario.game.Card>} cards Cards to be stacked in the stock.
 */
solitario.game.Stock.prototype.initialize = function(cards) {
  // Push all cards to the pile.
  goog.array.forEach(cards, function(card) {
    this.push(card);
  }, this);

  // Adds listener to the top-most card.
  var topCard = this.getTopCard_();
  this.topCardClickListenerKey_ = topCard.addEventListener(
      goog.events.EventType.CLICK,
      goog.bind(this.dispatchStockTakenEvent_, this));

  // Slant the second and third last cards to create stack effect.
  //this.pile_[1].slantLeft();
  //this.pile_[2].slantRight();
};


solitario.game.Stock.prototype.dispatchStockTakenEvent_ = function(evt) {
  var stockTakenEvent = new goog.events.Event(
      solitario.game.constants.Events.STOCK_TAKEN, this);
  goog.events.dispatchEvent(this, stockTakenEvent);
};


/**
 * Removes the top-most card from the stock.
 *
 * @return {solitario.game.Card} The card removed from the stock.
 * @override
 */
solitario.game.Stock.prototype.pop = function() {
  var card = solitario.game.Stock.superClass_.pop.call(this);
  // Removes listener from the popped card.
  card.removeEventListenersByType(goog.events.EventType.CLICK);
  // Adds listener to the top-most card.
  var topCard = this.getTopCard_();
  if (topCard) {
    topCard.addEventListener(goog.events.EventType.CLICK,
        goog.bind(this.dispatchStockTakenEvent_, this));
  }
  return card;
};
