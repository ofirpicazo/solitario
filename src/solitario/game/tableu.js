// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Tableu of cards object.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.Tableu');

goog.require('goog.array');
goog.require('solitario.game.Card');
goog.require('solitario.game.CardGroup');
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
 * The relative distance (ems) between each hidden card in the Tableu.
 * @type {number}
 * @private
 */
solitario.game.Tableu.INTERCARD_DISTANCE_HIDDEN_ = 0.8;


/**
 * The relative distance (ems) between each revealed card in the Tableu.
 * @type {number}
 * @private
 */
solitario.game.Tableu.INTERCARD_DISTANCE_REVEALED_ = 2;


/**
 * Returns a CardGroup from the given card, inclusive.
 *
 * @param {solitario.game.Card} card Card from which the group should be
 *     constructed from.
 *
 * @return {solitario.game.CardGroup} A group whose top card is the given one.
 */
solitario.game.Tableu.prototype.getGroupFrom = function(card) {
  var listOfCards = [];
  var cardFound = false;
  for (var i = 0; i < this.pile.length; i++) {
    if (this.pile[i].id == card.id) {
      cardFound = true;
    }
    // Build list of cards from the point where we found the given card.
    if (cardFound) {
      listOfCards.push(this.pile[i]);
    }
  }
  if (!cardFound) {
    throw new Error('Specified card not found in Tableu!');
  }
  return new solitario.game.CardGroup(listOfCards);
};


/**
 * Initializes the Tableu with the given array of cards, the last card will
 * be revealed.
 *
 * @param {Array.<solitario.game.Card>} cards Cards to be stacked in the tableu.
 */
solitario.game.Tableu.prototype.initialize = function(cards) {
  // Reveal the top card when its the transition is finished.
  goog.events.listenOnce(cards[0], goog.events.EventType.TRANSITIONEND,
      function(evnt) {
        cards[0].reveal();
        var readyEvent = new goog.events.Event(
            solitario.game.constants.Events.READY, this);
        goog.events.dispatchEvent(this, readyEvent);
      }, false, this);

  // Creates a delay for pushing each card to the tableu, in order to create
  // a progressive effect.
  var delay = 300;
  for (var i = cards.length - 1; i >= 0; i--) {
    window.setTimeout(goog.bind(this.push, this), delay, cards[i]);
    delay += 80;
  }
};


/**
 * Pops a card from the Tableu.
 *
 * @return {?solitario.game.Card} The card popped from the tableu.
 * @override
 */
solitario.game.Tableu.prototype.pop = function() {
  var poppedCard = solitario.game.Tableu.superClass_.pop.call(this);
  // Reveal the new top card if there is one.
  var topCard = this.getTopCard();
  if (topCard) {
    topCard.reveal();
    // If the previous card was a grouper, disable it.
    topCard.disableGrouper();
  }
  return poppedCard;
};


/**
 * Adds a new card to the tableu.
 *
 * @param {solitario.game.Card} card Card to be pushed.
 * @override
 */
solitario.game.Tableu.prototype.push = function(card) {
  // The position of the pushed card is relative to the previous card's position
  // and status (revealed/hidden).
  var previousCard = this.getTopCard();

  solitario.game.Tableu.superClass_.push.call(this, card);

  if (previousCard) {
    var intercardDistance = solitario.game.Tableu.INTERCARD_DISTANCE_HIDDEN_;

    if (previousCard.isRevealed()) {
      intercardDistance = solitario.game.Tableu.INTERCARD_DISTANCE_REVEALED_;
      // The previous revealed card can lead groups now.
      previousCard.enableGrouper();
    }

    // Fan down the card.
    var cardPosition = previousCard.positionInPile.clone();
    cardPosition.y += intercardDistance;
    card.setPosition(cardPosition);
    card.positionInPile = cardPosition;
  }
};
