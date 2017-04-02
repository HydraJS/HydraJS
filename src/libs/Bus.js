import { getDebug } from './Debug';
import { errorHandler } from './ErrorHandler';
import {
  isTypeOf, sNotDefined,
  iterateObject,copyArray,
  clone
} from './Utils';

const und = undefined;
/**
 * Private object to save the channels for communicating event driven
 * @type {Object}
 * @private
 */
let oChannels = {
  global: {}
};
/**
 * _removeSubscribers remove the subscribers to one channel and return the number of
 * subscribers that have been unsubscribed.
 * @param {Array<Object>} aSubscribers
 * @param {Object} oSubscriber
 * @return {Number}
 * @private
 */
function _removeSubscribers(aSubscribers, oSubscriber) {
  let nUnsubscribed = 0;
  if (!isTypeOf(aSubscribers, sNotDefined)) {
    let nIndex = aSubscribers.length - 1;
    for (; nIndex >= 0; nIndex--) {
      if (aSubscribers[nIndex].subscriber === oSubscriber) {
        nUnsubscribed++;
        aSubscribers.splice(nIndex, 1);
      }
    }
  }
  return nUnsubscribed;
}
/**
 * Loops per all the events to remove subscribers.
 * @param {Object} oEventsCallbacks
 * @param {String} sChannelId
 * @param {Object} oSubscriber
 * @return {Number}
 * @private
 */
function _removeSubscribersPerEvent(oEventsCallbacks, sChannelId, oSubscriber) {
  let nUnsubscribed = 0;
  iterateObject(oEventsCallbacks, function (oItem, sEvent) {
    const aEventsParts = sEvent.split(':');
    let sChannel = sChannelId;
    let sEventType = sEvent;
    if (aEventsParts[0] === 'global') {
      sChannel = aEventsParts[0];
      sEventType = aEventsParts[1];
    }
    nUnsubscribed += _removeSubscribers(oChannels[sChannel][sEventType], oSubscriber);
  });
  return nUnsubscribed;
}
/**
 * _addSubscribers add all the events of one channel from the subscriber
 * @param {Object} oEventsCallbacks
 * @param {String} sChannelId
 * @param {Object} oSubscriber
 * @private
 */
function _addSubscribers(oEventsCallbacks, sChannelId, oSubscriber) {
  iterateObject(oEventsCallbacks, function (oItem, sEvent) {
    subscribeTo(sChannelId, sEvent, oItem, oSubscriber);
  });
}
/**
 * _getChannelEvents return the events array in channel.
 * @param {String} sChannelId
 * @param {String} sEvent
 * @return {Object}
 * @private
 */
function _getChannelEvents(sChannelId, sEvent) {
  if (oChannels[sChannelId] === und) {
    oChannels[sChannelId] = {};
  }
  if (oChannels[sChannelId][sEvent] === und) {
    oChannels[sChannelId][sEvent] = [];
  }
  return oChannels[sChannelId][sEvent];
}

/**
 * subscribersByEvent return all the subscribers of the event in the channel.
 * @param {Object} oChannel
 * @param {String} sEventName
 * @return {Array<Object>}
 * @private
 */
function subscribersByEvent(oChannel, sEventName) {
  let aSubscribers = [];
  if (!isTypeOf(oChannel, sNotDefined)) {
    iterateObject(oChannel, function (oItem, sKey) {
      if (sKey === sEventName) {
        aSubscribers = oItem;
      }
    });
  }
  return aSubscribers;
}
/**
 * Sets the preprocessor of data before send the data to handlers.
 * @param {Function} fpCallback
 */
function preprocessorPublishData(fpCallback) {
  preprocessorsPublishData = function (oData) {
    return fpCallback(oData, clone);
  };
}
/**
 * Method to add a single callback in one channel an in one event.
 * @param {String} sChannelId
 * @param {String} sEventType
 * @param {Function} fpHandler
 * @param {Object} oSubscriber
 */
function subscribeTo(sChannelId, sEventType, fpHandler, oSubscriber) {
  const aChannelEvents = _getChannelEvents(sChannelId, sEventType);
  aChannelEvents.push({
    subscriber: oSubscriber,
    handler: fpHandler
  });
}
/**
 * subscribers return the array of subscribers to one channel and event.
 * @param {String} sChannelId
 * @param {String} sEventName
 * @return {Array<Object>}
 */
function subscribers(sChannelId, sEventName) {
  return subscribersByEvent(oChannels[sChannelId], sEventName);
}
/**
 * Method to unsubscribe a subscriber from a channel and event type.
 * It iterates in reverse order to avoid messing with array length when removing items.
 * @param {String} sChannelId
 * @param {String} sEventType
 * @param {Object} oSubscriber
 */
function unsubscribeFrom(sChannelId, sEventType, oSubscriber) {
  const aChannelEvents = _getChannelEvents(sChannelId, sEventType);
  for (let nEvent = aChannelEvents.length - 1; nEvent >= 0; nEvent--) {
    const oItem = aChannelEvents[nEvent];
    if (oItem.subscriber === oSubscriber) {
      aChannelEvents.splice(nEvent, 1);
    }
  }
}
/**
 * subscribe method gets the oEventsCallbacks object with all the handlers and add these handlers to the channel.
 * @param {Object} oSubscriber
 * @return {Boolean}
 */
function subscribe(oSubscriber) {
  const oEventsCallbacks = oSubscriber.events;
  if (!oSubscriber || oEventsCallbacks === und) {
    return false;
  }
  iterateObject(oEventsCallbacks, function (oItem, sChannelId) {
    if (oChannels[sChannelId] === und) {
      oChannels[sChannelId] = {};
    }
    _addSubscribers(oItem, sChannelId, oSubscriber);
  });

  return true;
}
/**
 * unsubscribe gets the oEventsCallbacks methods and removes the handlers of the channel.
 * @param {Object} oSubscriber
 * @return {Boolean}
 */
function unsubscribe(oSubscriber) {
  let nUnsubscribed = 0;
  const oEventsCallbacks = oSubscriber.events;
  if (!oSubscriber || oEventsCallbacks === und) {
    return false;
  }
  iterateObject(oEventsCallbacks, function (oItem, sChannelId) {
    if (oChannels[sChannelId] === und) {
      oChannels[sChannelId] = {};
    }
    nUnsubscribed = _removeSubscribersPerEvent(oItem, sChannelId, oSubscriber);
  });

  return nUnsubscribed > 0;
}
/**
 * Method to execute handlers
 * @param {Object} oHandlerObject
 * @param {Object} oData
 * @param {String} sChannelId
 * @param {String} sEvent
 */
function _executeHandler(oHandlerObject, oData, sChannelId, sEvent) {
  oHandlerObject.handler.call(oHandlerObject.subscriber, oData);
  if (getDebug()) {
    const ErrorHandler = errorHandler();
    ErrorHandler.log(sChannelId, sEvent, oHandlerObject);
  }
}
/**
 * Makes changes in oData before passing it to handler.
 * @param {Object} oData
 * @returns {*}
 */
function preprocessorsPublishData(oData) {
  return oData;
}
/**
 * Reset channels
 */
function reset() {
  oChannels = {
    global: {}
  };
}
/**
 * Publish the event in one channel.
 * @param {String} sChannelId
 * @param {String} sEvent
 * @param {String} oData
 * @return {Boolean}
 */
function publish(sChannelId, sEvent, oData) {
  const aSubscribers = copyArray(this.subscribers(sChannelId, sEvent));
  let oSubscriber;
  const nLenSubscribers = aSubscribers.length;
  if (nLenSubscribers === 0) {
    return false;
  }
  oData = preprocessorsPublishData(oData);
  while (!!(oSubscriber = aSubscribers.shift())) {
    _executeHandler(oSubscriber, oData, sChannelId, sEvent);
  }
  return true;
}
/**
 * To be used about extension, it will return a deep copy of the Channels object to avoid modifying the original
 * object.
 * @type {Function}
 * @return {Object}
 * @static
 */
function getCopyChannels() {
  return clone(oChannels);
}
/**
 * Bus is the object that must be used to manage the notifications by channels
 * @name Bus
 */
export default {
  subscribers,
  unsubscribeFrom,
  subscribeTo,
  subscribe,
  unsubscribe,
  publish,
  preprocessorPublishData,
  reset,
  getCopyChannels,
  __type__: 'bus'
};
