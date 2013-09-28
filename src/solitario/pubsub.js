// Copyright 2013 Ofir Picazo. All Rights Reserved.

/**
 * @fileoverview Global pubsub instance used for notifications. Implemented as
 * a singleton.
 *
 * @author ofirpicazo@gmail.com (Ofir Picazo)
 */

goog.provide('solitario.pubsub');

goog.require('goog.pubsub.PubSub');


/**
 * Global singleton instance of the pubsub object. Used across modules through
 * publish() and subscribe().
 * @type {goog.pubsub.PubSub}
 * @private
 */
solitario.pubsub.instance_ = new goog.pubsub.PubSub();


/**
 * All topics used by this pubsub system.
 * @enum {string}
 * @const
 */
solitario.pubsub.Topics = {
  GAME_STATE_CHANGED: 'gameStateChanged',
  RESIZE_BOARD: 'resizeBoard',
  SCORE_UPDATED: 'scoreUpdated'
};


/**
 * Publishes a message to a topic. This is only a proxy for
 * goog.pubsub.PubSub.publish.
 *
 * @param {string} topic Topic to publish to.
 * @param {...*} var_args Arguments that are applied to each subscription
 *     function.
 * @return {boolean} Whether any subscriptions were called.
 */
solitario.pubsub.publish = function(topic, var_args) {
  return solitario.pubsub.instance_.publish(topic, var_args);
};


/**
 * Subscribes a function to a topic. This is only a proxy for
 * goog.pubsub.PubSub.subscribe.
 *
 * @param {string} topic Topic to subscribe to.
 * @param {Function} fn Function to be invoked when a message is published to
 *     the given topic.
 * @param {Object=} opt_context Object in whose context the function is to be
 *     called (the global scope if none).
 * @return {number} Subscription key.
 */
solitario.pubsub.subscribe = function(topic, fn, opt_context) {
  return solitario.pubsub.instance_.subscribe(topic, fn, opt_context);
};
