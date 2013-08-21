// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Stock of cards in the game.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.Stock');

goog.require('goog.events.EventType');
goog.require('solitario.game.Card');
goog.require('solitario.game.Pile');
goog.require('solitario.game.constants');



/**
 * Class to represent the stock of cards in the game.
 *
 * @param {!Element} el DOM element representing the stock.
 * @constructor
 * @extends {solitario.game.Pile}
 */
solitario.game.Stock = function(el) {
  goog.base(this, el);

  // Setup listener for restock event.
  goog.events.listen(this.element_, goog.events.EventType.CLICK,
                     this.dispatchRestockEvent_, false, this);
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
};


/**
 * Dispatches an event indicating the user wishes to move all cards from the
 * waste back to the stock
 *
 * @param {goog.event.Event} evnt The event dispatched.
 * @private
 */
solitario.game.Stock.prototype.dispatchRestockEvent_ = function(evnt) {
  var restockEvent = new goog.events.Event(
      solitario.game.constants.Events.RESTOCK, this);
  goog.events.dispatchEvent(this, restockEvent);
};


/**
 * Dispatches an event indicating the user has taken a card from the stock.
 *
 * @param {goog.event.Event} evnt The event dispatched.
 * @private
 */
solitario.game.Stock.prototype.dispatchStockTakenEvent_ = function(evnt) {
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
  var topCard = this.getTopCard();
  if (topCard) {
    topCard.addEventListener(goog.events.EventType.CLICK,
        goog.bind(this.dispatchStockTakenEvent_, this));
  }
  return card;
};


/**
 * Adds a new card on top of the stock.
 *
 * @param {solitario.game.Card} card Card to be pushed.
 * @override
 */
solitario.game.Stock.prototype.push = function(card) {
  // Remove click listener for previous top card.
  var topCard = this.getTopCard();
  if (topCard) {
    topCard.removeEventListenersByType(goog.events.EventType.CLICK);
  }

  solitario.game.Stock.superClass_.push.call(this, card);
  card.cover();

  // Adds stock taken listeners to top card.
  card.addEventListener(goog.events.EventType.CLICK,
      goog.bind(this.dispatchStockTakenEvent_, this));
};
