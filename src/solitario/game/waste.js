// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Waste for cards in the game.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.Waste');

goog.require('solitario.game.Card');
goog.require('solitario.game.Pile');



/**
 * Class to represent the waste for cards in the game.
 *
 * @param {!Element} el DOM element representing the waste.
 * @constructor
 * @extends {solitario.game.Pile}
 */
solitario.game.Waste = function(el) {
  goog.base(this, el);
};
goog.inherits(solitario.game.Waste, solitario.game.Pile);


/**
 * Dispatches an event indicating a card was taken from the waste.
 *
 * @param {goog.event.Event} evt The event dispatched.
 * @private
 */
solitario.game.Waste.prototype.dispatchWasteTakenEvent_ = function(evt) {
  var wasteTakenEvent = new goog.events.Event(
      solitario.game.constants.Events.WASTE_TAKEN, this);
  goog.events.dispatchEvent(this, wasteTakenEvent);
};


/**
 * Pops a card from the Waste.
 *
 * @return {?solitario.game.Card} The card popped from the waste.
 * @override
 */
solitario.game.Waste.prototype.pop = function() {
  var poppedCard = solitario.game.Waste.superClass_.pop.call(this);
  this.dispatchWasteTakenEvent_();
  return poppedCard;
};


/**
 * Adds a new card on top of the waste.
 *
 * @param {solitario.game.Card} card Card to be pushed.
 * @override
 */
solitario.game.Waste.prototype.push = function(card) {
  solitario.game.Waste.superClass_.push.call(this, card);
  // Reveal all cards added to the waste.
  card.reveal();
};
