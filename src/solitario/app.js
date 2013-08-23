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
goog.require('goog.events');
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
  this.game_ = new solitario.game.Game();

  /**
   * Viewport monitor to adjust for size changes.
   * @type {goog.dom.ViewportSizeMonitor}
   * @private
   */
  this.viewportMonitor_ = new goog.dom.BufferedViewportSizeMonitor(
      new goog.dom.ViewportSizeMonitor(), 50);

  // Listen for viewport changes.
  goog.events.listen(this.viewportMonitor_, goog.events.EventType.RESIZE,
                     this.resizeBoard_, false, this);
  // Trigger initial viewport calculation.
  this.resizeBoard_();

  this.game_.start();
};
goog.addSingletonGetter(solitario.App);


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


goog.exportSymbol('solitario.init', solitario.init);
