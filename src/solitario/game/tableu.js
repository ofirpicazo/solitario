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
goog.require('solitario.game.constants');
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
 * Returns a CardGroup from the given card, inclusive.
 *
 * @param {solitario.game.Card} card Card from which the group should be
 *     constructed from.
 *
 * @return {solitario.game.CardGroup} A group whose top card is the given one.
 * @private
 */
solitario.game.Tableu.prototype.getGroupFrom_ = function(card) {
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

  var cardGroup = new solitario.game.CardGroup(listOfCards);
  goog.events.listen(cardGroup, solitario.game.constants.Events.GROUP_DRAG_END,
      function(evnt) {
        goog.events.dispatchEvent(this, evnt);
      }, false, this);
  goog.events.listen(cardGroup, solitario.game.constants.Events.GROUP_DRAG_MOVE,
      function(evnt) {
        goog.events.dispatchEvent(this, evnt);
      }, false, this);
};


/**
 * Event handler for when a group of cards is dropped.
 *
 * @param {goog.events.Event} evnt The event caught.
 * @private
 */
solitario.game.Tableu.prototype.onGroupDragEnd_ = function(evnt) {
  var cardGroup = /** @type {solitario.game.CardGroup} */ (evnt.target);
  goog.events.removeAll(cardGroup);
  goog.events.dispatchEvent(this, evnt);
};


/**
 * Event handler for when a grouper card is dragged.
 *
 * @param {goog.events.Event} evnt The event caught.
 * @private
 */
solitario.game.Tableu.prototype.onGroupDragStart_ = function(evnt) {
  var card = /** @type {solitario.game.Card} */ (evnt.target);
  var cardGroup = this.getGroupFrom_(card);
  var groupDragEvent = new goog.events.Event(
      solitario.game.constants.Events.GROUP_DRAG_START, cardGroup);
  goog.events.dispatchEvent(this, groupDragEvent);
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

  // Remove listener for group events.
  goog.events.unlisten(poppedCard,
      solitario.game.constants.Events.GROUP_DRAG_START, this.onGroupDragStart_,
      false, this);

  // Reveal the new top card if there is one.
  var topCard = this.getTopCard();
  if (topCard) {
    topCard.disableGrouper();
    topCard.reveal();
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
    var intercardDistance =
        solitario.game.constants.TABLEU_INTERCARD_DISTANCE_HIDDEN;

    if (previousCard.isRevealed()) {
      intercardDistance =
          solitario.game.constants.TABLEU_INTERCARD_DISTANCE_REVEALED;
      // The previous revealed card can lead groups now.
      previousCard.enableGrouper();
    }

    // Fan down the card.
    var cardPosition = previousCard.positionInPile.clone();
    cardPosition.y += intercardDistance;
    card.setPosition(cardPosition);
    card.positionInPile = cardPosition;
  }

  // Add listener for group events.
  goog.events.listen(card, solitario.game.constants.Events.GROUP_DRAG_START,
      this.onGroupDragStart_, false, this);
};


/**
 * Adds a CardGroup to the tableu keeping ordering.
 *
 * @param {solitario.game.CardGroup} group Card group to be added to the tableu.
 */
solitario.game.Tableu.prototype.pushGroup = function(group) {
  for (var i = 0; i < group.cards.length; i++) {
    this.push(group.cards[i]);
  }
};
