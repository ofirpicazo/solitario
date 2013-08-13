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
  for (var i = cardElements.length - 1; i >= 0; i--) {
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
  for (var i = foundationElements.length - 1; i >= 0; i--) {
    this.foundations_[i] = new solitario.game.Foundation(foundationElements[i]);
  }

  // Get tableux.
  var tableuElements = goog.dom.getElementsByClass(
      solitario.game.Game.ClassNames_.TABLEU);
  for (var i = tableuElements.length - 1; i >= 0; i--) {
    this.tableux_[i] = new solitario.game.Tableu(tableuElements[i]);
  }
};


/**
 * Move the top card from the stock to the waste.
 *
 * @private
 */
solitario.game.Game.prototype.moveCardFromStockToWaste_ = function() {
  // Remove card from stock.
  var card = this.stock_.pop();
  if (card) {
    // Set the card above everything else.
    card.setZIndex(solitario.game.constants.MAX_ZINDEX);
    // Add card to waste.
    this.waste_.push(card);
  }
  // TODO(ofirp): Do something when the last card is pulled from the stock, such
  // as a warning to the user or display an indicator on the empty stock.
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
  if (this.dropPile_ && this.dropPile_ != card.pile) {
    this.dropPile_.hideDroppableIndicator();
    card.detachFromPile();
    this.dropPile_.push(card);
  } else {
    card.returnToPile();
  }

  this.dropPile_ = null;
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
    this.dropPile_.hideDroppableIndicator();
    this.dropPile_ = null;
  }

  var card = /** @type {solitario.game.Card} */ (evnt.target);
  var cardRect = card.getRect();
  var intersection = null;
  var largestAreaIntersected = 0;
  var piles = goog.array.concat(this.foundations_, this.tableux_);

  // Find drop target pile.
  for (var i = piles.length - 1; i >= 0; i--) {
    // Skip the source pile.
    if (card.pile == piles[i])
      continue;

    intersection = goog.math.Rect.intersection(cardRect,
        piles[i].getDroppableRegion());
    if (intersection && (!this.dropPile_ ||
        intersection.getSize().area() > largestAreaIntersected)) {
      this.dropPile_ = piles[i];
      largestAreaIntersected = intersection.getSize().area();
    }
  }

  if (this.dropPile_) {
    this.dropPile_.showDroppableIndicator();
  }
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
  for (var i = piles.length - 1; i >= 0; i--) {
    piles[i].calculateDroppableRegion();
  }
  var card = /** @type {game.solitario.Card} */ (evnt.target);
  card.slant();
};


/**
 * Handles when a group of cards is dropped.
 *
 * @param {goog.events.Event} evnt The event object passed.
 * @private
 */
solitario.game.Game.prototype.onGroupDragEnd_ = function(evnt) {
  var group = /** @type {solitario.game.CardGroup} */ (evnt.target);

  // A drop target was found, move the group here.
  if (this.dropPile_ && this.dropPile_ != group.tableu) {
    this.dropPile_.hideDroppableIndicator();
    group.detachFromPile();
    this.dropPile_.pushGroup(group);
  } else {
    group.returnToPile();
  }

  this.dropPile_ = null;
};


/**
 * Handles when a group of cards is being dragged.
 *
 * @param {goog.events.Event} evnt The event object passed.
 * @private
 */
solitario.game.Game.prototype.onGroupDragMove_ = function(evnt) {
  // Reset the drop target pile.
  if (this.dropPile_) {
    this.dropPile_.hideDroppableIndicator();
    this.dropPile_ = null;
  }

  var cardGroup = /** @type {solitario.game.CardGroup} */ (evnt.target);
  var cardGroupRect = cardGroup.getRect();
  var intersection = null;
  var largestAreaIntersected = 0;

  // Find drop target pile.
  for (var i = this.tableux_.length - 1; i >= 0; i--) {
    // Skip the source pile.
    if (cardGroup.tableu == this.tableux_[i])
      continue;

    intersection = goog.math.Rect.intersection(cardGroupRect,
        this.tableux_[i].getDroppableRegion());
    if (intersection && (!this.dropPile_ ||
        intersection.getSize().area() > largestAreaIntersected)) {
      this.dropPile_ = this.tableux_[i];
      largestAreaIntersected = intersection.getSize().area();
    }
  }

  if (this.dropPile_) {
    this.dropPile_.showDroppableIndicator();
  }
};


/**
 * Handles group of cards starts being dragged.
 *
 * @param {goog.events.Event} evnt The event object passed.
 * @private
 */
solitario.game.Game.prototype.onGroupDragStart_ = function(evnt) {
  // Calculate droppable regions for all the tableux.
  for (var i = this.tableux_.length - 1; i >= 0; i--) {
    this.tableux_[i].calculateDroppableRegion();
  }
};


/**
 * Event handler triggered when the user takes a card from the stock.
 *
 * @param {goog.events.Event} evnt The event object passed.
 * @private
 */
solitario.game.Game.prototype.onStockTaken_ = function(evnt) {
  this.moveCardFromStockToWaste_();
};


/**
 * Event handler triggered when the user takes a card from the waste.
 *
 * @param {goog.events.Event} evnt The event object passed.
 * @private
 */
solitario.game.Game.prototype.onWasteTaken_ = function(evnt) {
  if (this.waste_.isEmpty()) {
    this.moveCardFromStockToWaste_();
  }
};


/**
 * Shuffles the cards in random order.
 *
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
  for (var i = this.cards_.length - 1; i >= 0; i--) {
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

  // Sets up listeners for card group events.
  for (var i = this.tableux_.length - 1; i >= 0; i--) {
    goog.events.listen(this.tableux_[i],
        solitario.game.constants.Events.GROUP_DRAG_START,
        this.onGroupDragStart_, false, this);
    goog.events.listen(this.tableux_[i],
        solitario.game.constants.Events.GROUP_DRAG_MOVE,
        this.onGroupDragMove_, false, this);
    goog.events.listen(this.tableux_[i],
        solitario.game.constants.Events.GROUP_DRAG_END,
        this.onGroupDragEnd_, false, this);
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
  goog.events.listen(this.waste_, solitario.game.constants.Events.WASTE_TAKEN,
                     this.onWasteTaken_, false, this);
};
