// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Foundation object, fill one per suit to complete the game.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.Foundation');

goog.require('goog.dom.dataset');
goog.require('solitario.game.Card');
goog.require('solitario.game.Pile');



/**
 * Class to represent a foundation in the game.
 *
 * @param {!Element} el DOM element representing the foundation.
 * @constructor
 * @extends {solitario.game.Pile}
 */
solitario.game.Foundation = function(el) {
  goog.base(this, el);

  /**
   * Type of pile, workaround to avoid using instanceof.
   * @type {solitario.game.constants.PileTypes}
   */
  this.pileType = solitario.game.constants.PileTypes.FOUNDATION;

  /**
   * Suit this foundation contains.
   * @type {?solitario.game.constants.SUIT}
   */
  this.suit = null;
};
goog.inherits(solitario.game.Foundation, solitario.game.Pile);


/**
 * Return true if this foundation can accept the passed card given the game
 * rules.
 *
 * @param {solitario.game.Card} card The card to be evaluated.
 * @return {boolean} true if the card can be pushed to the tableu, false if not.
 * @override
 */
solitario.game.Foundation.prototype.canAcceptCard = function(card) {
  // If the super class says no, we cannot say yes.
  if (!solitario.game.Foundation.superClass_.canAcceptCard.call(this, card)) {
    return false;
  }

  // Check that card is a Ace when the foundation is empty, otherwise it must be
  // the next card for the suit of the pile.
  if (this.isEmpty()) {
    return (card.number == solitario.game.constants.CardNumber.ACE);
  } else {
    var topCard = this.getTopCard();
    return (card.suit == this.suit && (card.value - topCard.value == 1));
  }
};


/**
 * Returns whether this foundation has been completed with all the cards of its
 * suit.
 *
 * @return {boolean} true if completed, false otherwise.
 */
solitario.game.Foundation.prototype.isCompleted = function() {
  var topCard = this.getTopCard();
  return (topCard &&
      topCard.number == solitario.game.constants.CardNumber.KING);
};


/**
 * Pop a card off of the foundation.
 *
 * @return {?solitario.game.Card} The card popped from the pile.
 * @override
 */
solitario.game.Foundation.prototype.pop = function() {
  var card = solitario.game.Foundation.superClass_.pop.call(this);

  if (this.isEmpty()) {
    this.suit = null;
  }

  return card;
};


/**
 * Adds a new card to the foundation. Sets the foundation's suit if it's not yet
 * set.
 *
 * @param {solitario.game.Card} card Card to be pushed.
 * @override
 */
solitario.game.Foundation.prototype.push = function(card) {
  solitario.game.Foundation.superClass_.push.call(this, card);

  if (!this.suit) {
    this.suit = card.suit;
  }

  if (this.isCompleted()) {
    var completedEvent = new goog.events.Event(
        solitario.game.constants.Events.FOUNDATION_COMPLETED, this);
    goog.events.dispatchEvent(this, completedEvent);
  }
};
