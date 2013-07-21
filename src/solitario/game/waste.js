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
 * Adds a new card on top of the waste.
 *
 * @param {solitario.game.Card} card Card to be pushed.
 * @override
 */
solitario.game.Waste.prototype.push = function(card) {
  // Remove listener for previous top card.
  var topCard = this.getTopCard_();
  if (topCard) {
    topCard.isDraggable = false;
  }

  solitario.game.Waste.superClass_.push.call(this, card);
  // Reveal all cards added to the waste.
  card.reveal();
  card.isDraggable = true;
};
