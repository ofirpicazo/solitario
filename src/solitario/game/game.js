// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Solitaire game logic.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.Game');

goog.require('goog.Timer');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('solitario.game.Card');
goog.require('solitario.game.Foundation');
goog.require('solitario.game.Stock');
goog.require('solitario.game.Tableu');
goog.require('solitario.game.Waste');
goog.require('solitario.game.constants');
goog.require('solitario.game.storage.GameForStorage');
goog.require('solitario.pubsub');



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

  /**
   * Numeric score of the running game.
   * @type {number}
   */
  this.score = 0;
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
 * Calculates the points awarded for moving a card from its current pile to a
 * new pile.
 *
 * @param {solitario.game.Card} card The card to be moved to a new pile
 * @param {solitario.game.Pile} newPile The receiving pile.
 * @return {number} A signed int indicated the points awarded for the move, or
 *     zero if no score was awarded.
 * @private
 */
solitario.game.Game.prototype.calculateCardMovingPoints_ = function(card,
    newPile) {
  var oldPileType = card.pile.pileType;
  var newPileType = newPile.pileType;
  var points = 0;

  if (oldPileType == solitario.game.constants.PileTypes.WASTE &&
      newPileType == solitario.game.constants.PileTypes.TABLEU) {
    points = solitario.game.constants.Scoring.WASTE_TO_TABLEU;
  } else if (oldPileType == solitario.game.constants.PileTypes.WASTE &&
             newPileType == solitario.game.constants.PileTypes.FOUNDATION) {
    points = solitario.game.constants.Scoring.WASTE_TO_FOUNDATION;
  } else if (oldPileType == solitario.game.constants.PileTypes.TABLEU &&
             newPileType == solitario.game.constants.PileTypes.FOUNDATION) {
    points = solitario.game.constants.Scoring.TABLEU_TO_FOUNDATION;
  } else if (oldPileType == solitario.game.constants.PileTypes.FOUNDATION &&
             newPileType == solitario.game.constants.PileTypes.TABLEU) {
    points = solitario.game.constants.Scoring.FOUNDATION_TO_TABLEU;
  }

  return points;
};


/**
 * Initializes DOM elements of the game.
 *
 * @private
 */
solitario.game.Game.prototype.initListeners_ = function() {
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
    goog.events.listen(this.cards_[i],
        solitario.game.constants.Events.BUILD, this.onBuild_,
        false, this);
  }

  // Sets up listeners for tableu events.
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
    goog.events.listen(this.tableux_[i],
        solitario.game.constants.Events.TABLEU_REVEAL,
        this.onTableuReveal_, false, this);
  }

  // Sets up listeners for game events.
  goog.events.listen(this.stock_, solitario.game.constants.Events.RESTOCK,
                     this.onRestock_, false, this);
  goog.events.listen(this.stock_, solitario.game.constants.Events.STOCK_TAKEN,
                     this.onStockTaken_, false, this);
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
};


/**
 * Moves a card from the waste back to the stock.
 *
 * @private
 */
solitario.game.Game.prototype.moveCardFromWasteToStock_ = function() {
  // Remove card from the waste.
  var card = this.waste_.pop();
  if (card) {
    // Set the card above everything else.
    card.setZIndex(solitario.game.constants.MAX_ZINDEX);
    // Add card to waste.
    this.stock_.push(card);
  }
};


/**
 * Handles when a playable card is sent to the foundations automatically by
 * double clicking on it.
 *
 * @param {goog.events.Event} evnt The event object passed.
 * @private
 */
solitario.game.Game.prototype.onBuild_ = function(evnt) {
  var card = /** @type {game.solitario.Card} */ (evnt.target);
  var selectedFoundation = null;

  for (var i = 0; i < this.foundations_.length; i++) {
    if (this.foundations_[i].canAcceptCard(card)) {
      selectedFoundation = this.foundations_[i];
      break;
    }
  }

  if (selectedFoundation) {
    var points = this.calculateCardMovingPoints_(card, selectedFoundation);
    this.updateScore_(points);

    card.setZIndex(solitario.game.constants.MAX_ZINDEX);
    card.detachFromPile();
    selectedFoundation.push(card);

    // The game state changed, update subscribers.
    solitario.pubsub.publish(solitario.pubsub.Topics.GAME_STATE_CHANGED);
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

  // A drop target was found, move the card here.
  if (this.dropPile_) {
    var points = this.calculateCardMovingPoints_(card, this.dropPile_);
    this.updateScore_(points);
    this.dropPile_.hideDroppableIndicator();

    card.detachFromPile();
    this.dropPile_.push(card);

    // The game state changed, update subscribers.
    solitario.pubsub.publish(solitario.pubsub.Topics.GAME_STATE_CHANGED);
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
    // Skip if the card cannot be accepted.
    if (!piles[i].canAcceptCard(card))
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

    // The game state changed, update subscribers.
    solitario.pubsub.publish(solitario.pubsub.Topics.GAME_STATE_CHANGED);
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
    // Skip if the group cannot be accepted.
    if (!this.tableux_[i].canAcceptCard(cardGroup.topCard))
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
 * Event handler triggered when the user clicks on an empty stock.
 *
 * @param {goog.events.Event} evnt The event object passed.
 * @private
 */
solitario.game.Game.prototype.onRestock_ = function(evnt) {
  if (!this.waste_.isEmpty()) {
    // Updates the game score negatively, doing a restock is a bad move :(
    this.updateScore_(solitario.game.constants.Scoring.RESTOCK);

    // Sends back all the cards in the waste to the stock.
    var delay = 0;
    for (var i = this.waste_.pile.length - 1; i >= 0; i--) {
      goog.Timer.callOnce(this.moveCardFromWasteToStock_, delay, this);
      delay += 50;
    }

    // The game state changed, update subscribers after all cards are back in
    // the stock.
    goog.Timer.callOnce(function() {
      solitario.pubsub.publish(solitario.pubsub.Topics.GAME_STATE_CHANGED);
    }, delay + solitario.game.constants.CARD_ANIMATION_DURATION);
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
  solitario.pubsub.publish(solitario.pubsub.Topics.GAME_STATE_CHANGED);
};


/**
 * Event handler for when a card is revealed in a tableu.
 *
 * @param {goog.events.Event} evnt The event objects passed.
 * @private
 */
solitario.game.Game.prototype.onTableuReveal_ = function(evnt) {
  // This action awards some score points.
  this.updateScore_(solitario.game.constants.Scoring.TABLEU_REVEAL);
};


/**
 * Resets the score to the initial value for a new game.
 * @private
 */
solitario.game.Game.prototype.resetScore_ = function() {
  this.score = 0;
  // Notify subscribers that the score was updated.
  solitario.pubsub.publish(solitario.pubsub.Topics.SCORE_UPDATED, this.score);
};


/**
 * Shuffles the cards in random order.
 *
 * @private
 */
solitario.game.Game.prototype.shuffleCards_ = function() {
  for (var i = this.cards_.length - 1; i >= 0; i--) {
    var randomPosition = solitario.game.utils.getRandomInt(0,
        this.cards_.length - 1);
    var tmp = this.cards_[i];
    this.cards_[i] = this.cards_[randomPosition];
    this.cards_[randomPosition] = tmp;
  }
};


/**
 * Updates the score value by adding/subtracting the points passed.
 *
 * @param {number} points A signed integer indicating the number of points to be
 *     added or subtracted to the current score value.
 * @private
 */
solitario.game.Game.prototype.updateScore_ = function(points) {
  // Only update it if the score is other than zero.
  if (points != 0) {
    var newScore = this.score + points;
    this.score = (newScore < 0) ? 0 : newScore;

    // Notify subscribers that the score was updated.
    solitario.pubsub.publish(solitario.pubsub.Topics.SCORE_UPDATED, this.score);
  }
};


/**
 * Sets the status of a game based on a serialized GameForStorage object.
 *
 * @param {string} serializedGame A JSON serialized GameForStorage object.
 */
solitario.game.Game.prototype.loadSavedGame = function(serializedGame) {
  var game = /* @type {solitario.game.storage.GameForStorage} */
      (goog.json.parse(serializedGame));

  // Restore stock.
  var stockCards = [];
  for (var i = 0; i < game.stock.cards.length; i++) {
    var card = new solitario.game.Card(goog.dom.getElement(
        game.stock.cards[i].id));
    // All cards in the stock should be covered.
    card.cover();
    stockCards.push(card);
  }
  this.stock_ = new solitario.game.Stock(goog.dom.getElement(game.stock.id));
  this.stock_.initialize(stockCards);
  goog.array.extend(this.cards_, stockCards);

  // Restore waste.
  var wasteCards = [];
  for (var i = 0; i < game.waste.cards.length; i++) {
    var card = new solitario.game.Card(goog.dom.getElement(
        game.waste.cards[i].id));
    // All cards in the waste are revealed.
    card.reveal();
    wasteCards.push(card);
  }
  this.waste_ = new solitario.game.Waste(goog.dom.getElement(game.waste.id));
  this.waste_.initialize(wasteCards);
  goog.array.extend(this.cards_, wasteCards);

  // Restore foundations.
  for (var i = 0; i < game.foundations.length; i++) {
    var storedFoundation = game.foundations[i];
    var foundationCards = [];
    for (var j = 0; j < storedFoundation.cards.length; j++) {
      var card = new solitario.game.Card(goog.dom.getElement(
          storedFoundation.cards[j].id));
      storedFoundation.cards[j].revealed ? card.reveal() : card.cover();
      foundationCards.push(card);
    }
    var foundation = new solitario.game.Foundation(goog.dom.getElement(
        storedFoundation.id));
    foundation.initialize(foundationCards);
    this.foundations_.push(foundation);
    goog.array.extend(this.cards_, foundationCards);
  }

  // Restore tableux.
  for (var i = 0; i < game.tableux.length; i++) {
    var storedTableu = game.tableux[i];
    var tableuCards = [];
    for (var j = 0; j < storedTableu.cards.length; j++) {
      var card = new solitario.game.Card(goog.dom.getElement(
          storedTableu.cards[j].id));
      storedTableu.cards[j].revealed ? card.reveal() : card.cover();
      tableuCards.push(card);
    }
    var tableu = new solitario.game.Tableu(goog.dom.getElement(
        storedTableu.id));
    // Use Pile's initialize to avoid animations.
    solitario.game.Tableu.superClass_.initialize.call(tableu, tableuCards);
    this.tableux_.push(tableu);
    goog.array.extend(this.cards_, tableuCards);
  }

  // Set the score
  this.updateScore_(game.score);

  // Initialize event listeners for game elements.
  this.initListeners_();

  this.is_started = true;
};


/**
 * Returns a string representation of the current game state.
 *
 * @return {string} A JSON string representing the current game state.
 */
solitario.game.Game.prototype.serialize = function() {
  // Get foundations
  var foundations = [];
  for (var i = 0; i < this.foundations_.length; i++) {
    foundations.push(this.foundations_[i].forStorage());
  }

  // Get tableux
  var tableux = [];
  for (var i = 0; i < this.tableux_.length; i++) {
    tableux.push(this.tableux_[i].forStorage());
  }

  var game = new solitario.game.storage.GameForStorage(this.score,
      this.stock_.forStorage(), this.waste_.forStorage(), foundations, tableux);
  return goog.json.serialize(game);
};


/**
 * Starts a new game reinitializing all the elements.
 */
solitario.game.Game.prototype.startNewGame = function() {
  this.cards_ = [];
  this.foundations_ = [];
  this.tableux_ = [];

  this.resetScore_();

  // Setup the card deck.
  var cardElements = goog.dom.getElementsByClass(
      solitario.game.Game.ClassNames_.CARD);
  for (var i = cardElements.length - 1; i >= 0; i--) {
    goog.events.removeAll(cardElements[i]);
    this.cards_.push(new solitario.game.Card(cardElements[i]));
  }

  // Shuffle the cards.
  this.shuffleCards_();

  // Setup tableux.
  var startIndex, endIndex = 0;
  var numTableuxInitialized = 0;
  var tableuElements = goog.dom.getElementsByClass(
      solitario.game.Game.ClassNames_.TABLEU);
  for (var i = 0; i < tableuElements.length; i++) {
    this.tableux_[i] = new solitario.game.Tableu(tableuElements[i]);
    startIndex = endIndex;
    endIndex += i + 1;
    var tableuCards = this.cards_.slice(startIndex, endIndex);
    this.tableux_[i].initialize(tableuCards);

    // Trigger a READY event when all tableux are ready.
    goog.events.listen(this.tableux_[i], solitario.game.constants.Events.READY,
        function(evnt) {
          numTableuxInitialized++;
          if (numTableuxInitialized == this.tableux_.length) {
            // All tableux are ready, dispatch ready event.
            var readyEvent = new goog.events.Event(
                solitario.game.constants.Events.READY, this);
            goog.events.dispatchEvent(this, readyEvent);
            // The game state changed, update subscribers.
            solitario.pubsub.publish(
                solitario.pubsub.Topics.GAME_STATE_CHANGED);
          }
        }, false, this);
  }

  // Setup stock.
  this.stock_ = new solitario.game.Stock(goog.dom.getElement(
      solitario.game.Game.ClassNames_.STOCK));
  var cardsForStock = this.cards_.slice(endIndex);
  this.stock_.initialize(cardsForStock);

  // Setup waste.
  this.waste_ = new solitario.game.Waste(goog.dom.getElement(
      solitario.game.Game.ClassNames_.WASTE));

  // Setup foundations.
  var foundationElements = goog.dom.getElementsByClass(
      solitario.game.Game.ClassNames_.FOUNDATION);
  for (var i = foundationElements.length - 1; i >= 0; i--) {
    this.foundations_[i] = new solitario.game.Foundation(foundationElements[i]);
  }

  // Initialize event listeners for game elements.
  this.initListeners_();

  this.is_started = true;
};
