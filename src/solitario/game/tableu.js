// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Tableu of cards object.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.Tableu');

goog.require('goog.array');
goog.require('solitario.game.Card');
goog.require('solitario.game.Pile');
goog.require('solitario.game.utils');


/**
 * Class to represent a tableu in the game.
 *
 * @param {!Element} el DOM element representing the tableu.
 * @constructor
 * @extends {solitario.game.Pile}
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
  for (var i = cards.length - 1; i >= 0; i--) {
    this.push(cards[i]);
  }
  // Reveal the top card when the transitions are finished.
  goog.events.listenOnce(cards[0], goog.events.EventType.TRANSITIONEND,
      function(evnt) {
        cards[0].reveal();
        var readyEvent = new goog.events.Event(
            solitario.game.constants.Events.READY, this);
        goog.events.dispatchEvent(this, readyEvent);
      }, false, this);
};


/**
 * Adds a new card to the tableu.
 *
 * @param {solitario.game.Card} card Card to be pushed.
 * @override
 */
solitario.game.Tableu.prototype.push = function(card) {
  solitario.game.Tableu.superClass_.push.call(this, card);
  // Fan down the card.
  var cardPosition = this.getPosition_();
  cardPosition.y += (this.pile_.length - 1) *
      solitario.game.Tableu.INTERCARD_DISTANCE_;
  card.setPosition(cardPosition);
  card.positionInPile = cardPosition;
};
