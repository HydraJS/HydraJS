/**
 * Wrapper of Object.prototype.toString to detect type of object in cross browsing mode.
 * @param {Object} oObject
 * @return {String}
 * @private
 */
function toString(oObject) {
  return Object.prototype.toString.call(oObject);
}
/**
 * Use jQuery detection
 * @param {Object} oObj
 * @return {Boolean}
 * @private
 */
function isJqueryObject(oObj) {
  var isJquery = false,
    $ = getRoot().jQuery;
  if ($) {
    isJquery = isInstanceOf(oObj, $);
  }
  return isJquery;
}
/**
 * Use Event detection and if it fails it degrades to use duck typing detection to
 * test if the supplied object is an Event
 * @param {Object} oObj
 * @return {Boolean}
 * @private
 */
function isEvent(oObj) {
  try {
    return isInstanceOf(oObj, Event);
  } catch (erError) {
    // Duck typing detection (If it sounds like a duck and it moves like a duck, it's a duck)
    if (oObj.altKey !== und && ( oObj.srcElement || oObj.target )) {
      return true;
    }
  }
  return false;
}
/**
 * isArray is a function to know if the object passed as parameter is an Array object.
 * @param {*} aArray
 * @return {Boolean}
 * @private
 */
export function isArray(aArray) {
  return toString(aArray) === '[object Array]';
}
/**
 * Return a copy of the object.
 * @param {Object} oObject
 * @return {Object}
 * @private
 */
export function clone(oObject) {
  var oCopy;
  /*
   Handle null, undefined, DOM element, Event and jQuery objects,
   and all the objects that are instances of a constructor different from Object.
   */
  if (null == oObject ||      // Is null or undefined
    !isTypeOf(oObject, 'object') ||  // Is not an object (primitive)
    oObject.constructor.toString().indexOf('Object()') === -1 ||  // Is an instance
    isEvent(oObject) ||   // Is an event
    isJqueryObject(oObject) ||  // Is a jQuery object
    ( oObject.nodeType && oObject.nodeType === 1 )) { // Is a DOM element
    return oObject;
  }

  // Handle Date
  if (isInstanceOf(oObject, Date)) {
    oCopy = new Date();
    oCopy.setTime(oObject.getTime());
    return oCopy;
  }

  // Handle Array
  if (isInstanceOf(oObject, Array)) {
    oCopy = copyArray(oObject);
    return oCopy;
  }

  // Handle Object
  if (isInstanceOf(oObject, Object)) {
    oCopy = {};
    iterateObject(oObject, function (oItem, sKey) {
      oCopy[sKey] = clone(oItem);
    });
    return oCopy;
  }

  throw new Error('Unable to copy object!');
}
/**
 * Check if is the type indicated
 * @param {Object} oMix
 * @param {String} sType
 * @return {Boolean}
 */
export function isTypeOf(oMix, sType) {
  return typeof oMix === sType;
}
/**
 * Cache 'undefined' string to test typeof
 * @type {String}
 */
export const sNotDefined = 'undefined';
/**
 * Return a copy of an Array or convert a LikeArray object to Array
 * @param {Object|Array} oLikeArray
 * @private
 */
export function copyArray(oLikeArray) {
  return [].slice.call(oLikeArray, 0);
}
/**
 * Returns global or window object
 * @returns {boolean|Window|*|getRoot}
 */
export function getRoot() {
  var root = ((typeof self === 'object' && self.self === self && self) ||
  (typeof global === 'object' && global.global === global && global) ||
  this);
  if (root.document) {
    root.document.__type__ = 'doc';
  }
  if (root.console) {
    root.console.__type__ = 'log';
  }
  return root;
}
/**
 * isFunction is a function to know if the object passed as parameter is a Function object.
 * @param {*} fpCallback
 * @return {Boolean}
 * @private
 */
export function isFunction(fpCallback) {
  return toString(fpCallback) === '[object Function]';
}
/**
 * Helper to iterate over objects using for-in approach
 * @param {Object} oObject
 * @param {Function} fpProcess
 * @private
 */
export function iterateObject(oObject, fpProcess) {
  var sKey;

  for (sKey in oObject) {
    if (oObject.hasOwnProperty(sKey)) {
      fpProcess(oObject[sKey], sKey);
    }
  }
}
/**
 * nullFunc
 * An empty function to be used as default is no supplied callbacks.
 * @private
 */
export function nullFunc() {}
/**
 * Do a simple merge of two objects overwriting the target properties with source properties
 * @param {Object} oTarget
 * @param {Object} oSource
 * @private
 */
export function simpleMerge(oTarget, oSource) {
  iterateObject(oSource, function (oItem, sKey) {
    oTarget[sKey] = oSource[sKey];
  });
  return oTarget;
}
/**
 * Function type string
 * @type {String}
 * @private
 */
export const sFunctionType = 'function';
/**
 * Do a simple merge of two objects overwriting the target properties with source properties
 * @param {Object} oTarget
 * @param {Object} oSource
 * @private
 */
export function simpleMerge(oTarget, oSource) {
  iterateObject(oSource, function (oItem, sKey) {
    oTarget[sKey] = oSource[sKey];
  });
  return oTarget;
}
/**
 * Wrapper of instanceof to reduce final size
 * @param {Object} oInstance
 * @param {Object} oConstructor
 * @return {Boolean}
 * @private
 */
export function isInstanceOf(oInstance, oConstructor) {
  return oInstance instanceof oConstructor;
}
/**
 * Return the length of properties of one object
 * @param {Object} oObj
 * @return {Number}
 * @private
 */
export function getObjectLength(oObj) {
  return getKeys(oObj).length;
}
/**
 * Return the length of properties of one object
 * @param {Object} oObj
 * @return {Number}
 * @private
 */
function getObjectLength(oObj) {
  return getKeys(oObj).length;
}
/**
 * Return the function to execute simple callbacks in extended modules.
 * @param {Function} oCallback
 * @param {Object} [oContext]
 * @returns {Function}
 */
export function getSimpleFunction(oCallback, oContext) {
  return function () {
    return oCallback.apply(oContext || this, arguments);
  };
}
/**
 * Used to generate an unique key for instance ids that are not supplied by the user.
 * @return {String}
 * @private
 */
export function generateUniqueKey() {
  var oMath = Math, sFirstToken = +new Date() + '',
    sSecondToken = oMath.floor(oMath.random() * ( 999999 - 1 + 1 )) + 1;
  return sFirstToken + '_' + sSecondToken;
}
