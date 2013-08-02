// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Solitaire game logic.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.Game');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('solitario.game.Card');
goog.require('solitario.game.Foundation');
goog.require('solitario.game.Stock');
goog.require('solitario.game.Tableu');
goog.require('solitario.game.Waste');
goog.require('solitario.game.constants');


/**
 * Game logic controller.
 *
 * @constructor
 * @extends {goog.events.EventTarget}
 */
solitario.game.Game = function() {
  // Calls the superclass constructor.
  goog.base(this);

  /**
   * Array of card objects for the game.
   * @type {Array.<solitario.game.Card>}
   * @private
   */
  this.cards_ = [];

  /**
   * Target pile to be used on a card's dragend event.
   * @type {?solitario.game.Pile}
   * @private
   */
  this.dropPile_ = null;

  /**
   * Array of foundations, ordered from left to right.
   * @type {Array.<solitario.game.Foundation>}
   * @private
   */
  this.foundations_ = [];

  /**
   * Pile to represent the stock.
   * @type {solitario.game.Stock}
   * @private
   */
  this.stock_;

  /**
   * Array of tableux, ordered from left to right.
   * @type {Array.<solitario.game.Tableu>}
   * @private
   */
  this.tableux_ = [];

  /**
   * Pile to represent the waste.
   * @type {solitario.game.Waste}
   * @private
   */
  this.waste_;

  /**
   * Flag to indicate whether the game has been started.
   * Defaults to false.
   *
   * @type {Boolean}
   */
  this.is_started = false;

  // Initialize the elements of the game.
  this.init_();
};
goog.inherits(solitario.game.Game, goog.events.EventTarget);


/**
 * CSS class names for elements of the game.
 * @enum {string}
 * @const
 * @private
 */
solitario.game.Game.ClassNames_ = {
  CARD: 'card',
  FOUNDATION: 'foundation',
  STOCK: 'stock',
  TABLEU: 'tableu',
  WASTE: 'waste'
};


/**
 * Initializes the elements of the game.
 *
 * @private
 */
solitario.game.Game.prototype.init_ = function() {
  // Get the card deck.
  var cardElements = goog.dom.getElementsByClass(
      solitario.game.Game.ClassNames_.CARD);
  for (var i = 0; i < cardElements.length; i++) {
    this.cards_.push(new solitario.game.Card(cardElements[i]));
  }

  // Get stock and waste.
  this.stock_ = new solitario.game.Stock(goog.dom.getElement(
      solitario.game.Game.ClassNames_.STOCK));
  this.waste_ = new solitario.game.Waste(goog.dom.getElement(
      solitario.game.Game.ClassNames_.WASTE));

  // Get foundations.
  var foundationElements = goog.dom.getElementsByClass(
      solitario.game.Game.ClassNames_.FOUNDATION);
  for (var i = 0; i < foundationElements.length; i++) {
    this.foundations_[i] = new solitario.game.Foundation(foundationElements[i]);
  }

  // Get tableux.
  var tableuElements = goog.dom.getElementsByClass(
      solitario.game.Game.ClassNames_.TABLEU);
  for (var i = 0; i < tableuElements.length; i++) {
    this.tableux_[i] = new solitario.game.Tableu(tableuElements[i]);
  }
};


/**
 * Event handler for when a card is taken from the stock.
 *
 * @param {goog.events.Event} evnt The event object passed.
 * @private
 */
solitario.game.Game.prototype.onStockTaken_ = function(evnt) {
  // Remove card from stock.
  var card = this.stock_.pop();
  // Add card to waste.
  this.waste_.push(card);
};


/**
 * Handles when a playable card starts being dragged.
 *
 * @param {goog.events.Event} evnt The event object passed.
 * @private
 */
solitario.game.Game.prototype.onCardDragStart_ = function(evnt) {
  // Calculate droppable regions for all the piles.
  var piles = goog.array.concat(this.foundations_, this.tableux_);
  for (var i = 0; i < piles.length; i++) {
    piles[i].calculateDroppableRegion();
  }
  var card = /** @type {game.solitario.Card} */ (evnt.target);
  card.slant();
};


/**
 * Handles when a card being dragged moves.
 *
 * @param {goog.events.Event} evnt The event object passed.
 * @private
 */
solitario.game.Game.prototype.onCardDragMove_ = function(evnt) {
  // Reset the drop target pile.
  if (this.dropPile_) {
    this.dropPile_.disableDroppableIndicator();
    this.dropPile_ = null;
  }

  var card = evnt.target;
  var cardRect = card.getRect();
  var intersection = null;
  var largestAreaIntersected = 0;
  var piles = goog.array.concat(this.foundations_, this.tableux_);

  // Find drop target pile.
  for (var i = 0; i < piles.length; i++) {
    intersection = goog.math.Rect.intersection(cardRect,
        piles[i].getDroppableRegion());
    if (intersection && (!this.dropPile_ ||
        intersection.getSize().area() > largestAreaIntersected)) {
      this.dropPile_ = piles[i];
      largestAreaIntersected = intersection.getSize().area();
    }
  }

  if (this.dropPile_) {
    this.dropPile_.enableDroppableIndicator();
  }
};


/**
 * Handles when a playable card ends being dragged.
 *
 * @param {goog.events.Event} evnt The event object passed.
 * @private
 */
solitario.game.Game.prototype.onCardDragEnd_ = function(evnt) {
  var card = /** @type {game.solitario.Card} */ (evnt.target);
  card.straighten();

  // A drop target was found, move the card here.
  if (this.dropPile_) {
    // TODO(ofir): Implement receiving drop.
    this.dropPile_.disableDroppableIndicator();
    this.dropPile_ = null;
  } else {
    card.returnToPile();
  }
};



/**
 * Shuffles the cards in random order.
 * @private
 */
solitario.game.Game.prototype.shuffleCards_ = function() {
  for (var i = this.cards_.length - 1; i >= 0; i--) {
    var randomPosition = solitario.game.utils.getRandomInt(0, i);
    var tmp = this.cards_[i];
    this.cards_[i] = this.cards_[randomPosition];
    this.cards_[randomPosition] = tmp;
  }
};


/**
 * Starts a new game reinitializing all the elements.
 */
solitario.game.Game.prototype.start = function() {
  // Shuffles the cards.
  this.shuffleCards_();

  // Sets up listeners for cards' events.
  for (var i = 0; i < this.cards_.length; i++) {
    goog.events.listen(this.cards_[i],
        solitario.game.constants.Events.DRAG_START, this.onCardDragStart_,
        false, this);
    goog.events.listen(this.cards_[i],
        solitario.game.constants.Events.DRAG_MOVE, this.onCardDragMove_,
        false, this);
    goog.events.listen(this.cards_[i],
        solitario.game.constants.Events.DRAG_END, this.onCardDragEnd_,
        false, this);
  }

  // Sets cards for tableux.
  var numCardsForTableu = 0;
  var startIndex, endIndex = 0;
  var numTableuxInitialized = 0;
  goog.array.forEach(this.tableux_, function(tableu, index) {
    numCardsForTableu = index + 1;
    startIndex = endIndex;
    endIndex += numCardsForTableu;

    // Trigger a READY event when all tableux are ready.
    goog.events.listen(tableu, solitario.game.constants.Events.READY,
        function(evnt) {
          numTableuxInitialized++;
          if (numTableuxInitialized == this.tableux_.length) {
            // All tableux are ready, dispatch ready event.
            var readyEvent = new goog.events.Event(
                solitario.game.constants.Events.READY, this);
            goog.events.dispatchEvent(this, readyEvent);
          }
        }, false, this);

    var tableuCards = this.cards_.slice(startIndex, endIndex);
    tableu.initialize(tableuCards);
  }, this);

  // Sets cards for stock
  var cardsForStock = this.cards_.slice(endIndex);
  this.stock_.initialize(cardsForStock);

  // Sets up listeners for game events.
  goog.events.listen(this.stock_, solitario.game.constants.Events.STOCK_TAKEN,
                     this.onStockTaken_, false, this);
};
