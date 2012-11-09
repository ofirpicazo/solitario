// Copyright 2012 Ofir Picazo. All Rights Reserved

goog.provide('solitario.init');

goog.require('goog.dom');
goog.require('goog.dom.BufferedViewportSizeMonitor');
goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.events');

/**
 * Start point for the application.
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
   * Viewport monitor to adjust for size changes.
   *
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
  var pixelSize = (this.viewportMonitor_.getSize().width / 85) + 'px';
  goog.dom.getDocument().body.style.fontSize = pixelSize;
};

goog.exportSymbol('solitario.init', solitario.init);