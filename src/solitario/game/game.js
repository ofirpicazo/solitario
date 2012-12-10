// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Solitaire game logic.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.game.Game');

goog.require('goog.dom');
goog.require('solitario.game.Card');
goog.require('solitario.game.Foundation');
goog.require('solitario.game.Stock');
goog.require('solitario.game.Tableu');
goog.require('solitario.game.Waste');


/**
 * Game logic controller.
 *
 * @constructor
 */
solitario.game.Game = function() {
  /**
   * Array of card objects for the game.
   * @type {Array.<solitario.game.Card>}
   * @private
   */
  this.cards_ = [];

  /**
   * Pile to represent the waste.
   * @type {solitario.game.Waste}
   * @private
   */
  this.waste_;

  /**
   * Pile to represent the stock.
   * @type {solitario.game.Stock}
   * @private
   */
  this.stock_;

  /**
   * Array of foundations, ordered from left to right.
   * @type {Array.<solitario.game.Foundation>}
   * @private
   */
  this.foundations_ = [];

  /**
   * Array of tableux, ordered from left to right.
   * @type {Array.<solitario.game.Tableu>}
   * @private
   */
  this.tableux_ = [];

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
  // Assign the card deck.
  var cardElements = goog.dom.getElementsByClass(
      solitario.game.Game.ClassNames_.CARD);
  for (var i = 0; i < cardElements.length; i++) {
    this.cards_.push(new solitario.game.Card(cardElements[i]));
  }

  // Assign stock and waste.
  this.stock_ = new solitario.game.Stock(goog.dom.getElement(
      solitario.game.Game.ClassNames_.STOCK));
  this.waste_ = new solitario.game.Waste(goog.dom.getElement(
      solitario.game.Game.ClassNames_.WASTE));

  // Assign foundations.
  var foundationElements = goog.dom.getElementsByClass(
      solitario.game.Game.ClassNames_.FOUNDATION);
  for (var i = 0; i < foundationElements.length; i++) {
    this.foundations_[i] = new solitario.game.Foundation(foundationElements[i]);
  }

  // Assign tableux.
  var tableuElements = goog.dom.getElementsByClass(
      solitario.game.Game.ClassNames_.TABLEU);
  for (var i = 0; i < tableuElements.length; i++) {
    this.tableux_[i] = new solitario.game.Tableu(tableuElements[i]);
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

  // Sets cards for tableux.
  var numCardsForTableu = 0;
  var startIndex, endIndex = 0;
  goog.array.forEach(this.tableux_, function(tableu, index) {
    numCardsForTableu = index + 1;
    startIndex = endIndex;
    endIndex += numCardsForTableu;

    var tableuCards = this.cards_.slice(startIndex, endIndex);
    tableu.initialize(tableuCards);
  }, this);

  // Sets cards for stock
  var cardsForStock = this.cards_.slice(endIndex);
  this.stock_.initialize(cardsForStock);
};

