// Copyright 2012 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Entry point for the Solitario app.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.App');
goog.provide('solitario.init');

goog.require('goog.dom');
goog.require('goog.dom.BufferedViewportSizeMonitor');
goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.json');
goog.require('goog.storage.mechanism.HTML5LocalStorage');
goog.require('solitario.game.Game');
goog.require('solitario.pubsub');


/**
 * Entry point of the application.
 */
solitario.init = function() {
  solitario.App.getInstance();
};



/**
 * Singleton class for the Solitario app.
 *
 * @constructor
 */
solitario.App = function() {
  /**
   * The current game loaded in the app.
   * @type {solitario.game.Game}
   * @private
   */
  this.game_ = null;

  /**
   * Button to start a new game.
   * @type {Element}
   * @private
   */
  this.newGameButton_ = goog.dom.getElement(
      solitario.App.DomIds_.NEW_GAME_BUTTON);

  /**
   * Storage mechanism for using HTML5 local storage to save game state.
   * @type {goog.storage.mechanism.HTML5LocalStorage}
   * @private
   */
  this.storage_ = new goog.storage.mechanism.HTML5LocalStorage();

  /**
   * DOM element to display the score in.
   * @type {Element}
   * @private
   */
  this.scoreElement_ = goog.dom.getElement(solitario.App.DomIds_.SCORE);

  /**
   * Viewport monitor to adjust for size changes.
   * @type {goog.dom.ViewportSizeMonitor}
   * @private
   */
  this.viewportMonitor_ = new goog.dom.BufferedViewportSizeMonitor(
      new goog.dom.ViewportSizeMonitor(), 50);

  // Initialize event listeners, pubsub subscribers and the game.
  this.init_();
};
goog.addSingletonGetter(solitario.App);


/**
 * CSS class names for elements of the app.
 * @enum {string}
 * @const
 * @private
 */
solitario.App.ClassNames_ = {
  ROTATED: 'rotated'
};


/**
 * DOM ids for elements of the app.
 * @enum {string}
 * @const
 * @private
 */
solitario.App.DomIds_ = {
  NEW_GAME_BUTTON: 'new-game-btn',
  SCORE: 'score-value'
};


/**
 * HTML5 local storage key for saved games.
 * @type {string}
 * @const
 * @private
 */
solitario.App.SAVED_GAME_STORAGE_KEY_ = 'savedGame';


/**
 * Saves the game state when something changes.
 * @private
 */
solitario.App.prototype.gameStateChanged_ = function() {
  // Save state after all animations have finished.
  goog.Timer.callOnce(function() {
    this.storage_.set(solitario.App.SAVED_GAME_STORAGE_KEY_,
        this.game_.serialize());
  }, solitario.game.constants.CARD_ANIMATION_DURATION, this);
};


/**
 * Setup event listeners, pubsub subscribers and run some initialization logic.
 * @private
 */
solitario.App.prototype.init_ = function() {
  // Setup event listeners for UI elements and viewport changes.
  goog.events.listen(this.newGameButton_, goog.events.EventType.CLICK,
      this.startNewGame_, false, this);
  goog.events.listen(this.viewportMonitor_, goog.events.EventType.RESIZE,
      this.resizeBoard_, false, this);

  // Subscribe to pubsub notifications.
  solitario.pubsub.subscribe(solitario.pubsub.Topics.GAME_STATE_CHANGED,
      this.gameStateChanged_, this);
  solitario.pubsub.subscribe(solitario.pubsub.Topics.SCORE_UPDATED,
      this.updateScore_, this);

  // Trigger initial viewport calculation.
  this.resizeBoard_();

  // Load saved game or create a new one.
  this.loadGame_();
};


/**
 * Load saved game or create new one if none exists.
 * @private
 */
solitario.App.prototype.loadGame_ = function() {
  var savedGame = this.storage_.get(solitario.App.SAVED_GAME_STORAGE_KEY_);
  if (savedGame) {
    this.game_ = new solitario.game.Game();
    this.game_.loadSavedGame(savedGame);
  } else {
    this.startNewGame_();
  }
};


/**
 * Handler to change the size of the base font to accomodate
 * viewport resizing.
 *
 * @param {goog.events.Event} e Viewport resize event.
 * @private
 */
solitario.App.prototype.resizeBoard_ = function(e) {
  var viewportSize = this.viewportMonitor_.getSize();
  var widthPixelSize = (viewportSize.width / 85).toFixed(1);
  var heightPixelSize = (viewportSize.height / 65).toFixed(1);
  var pixelSize = Math.min(widthPixelSize, heightPixelSize) + 'px';
  goog.dom.getDocument().body.style.fontSize = pixelSize;

  // Notify subscribers that the board was resized.
  solitario.pubsub.publish(solitario.pubsub.Topics.RESIZE_BOARD);
};


/**
 * Resets game saved state and starts a new game.
 * @private
 */
solitario.App.prototype.startNewGame_ = function() {
  if (this.game_) {
    this.game_.end();
  }
  this.game_ = new solitario.game.Game();
  this.game_.startNewGame();
};


/**
 * Updates the displayed game score.
 *
 * @param {number} score The new value for the score.
 * @private
 */
solitario.App.prototype.updateScore_ = function(score) {
  goog.dom.classes.toggle(this.scoreElement_,
      solitario.App.ClassNames_.ROTATED);
  goog.dom.setTextContent(this.scoreElement_, score);
};


goog.exportSymbol('solitario.init', solitario.init);
