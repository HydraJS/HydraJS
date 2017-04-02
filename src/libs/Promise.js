import {nullFunc} from './Utils';
/**
 * Returns the promise callback by type
 * @param {Object}oContext
 * @param {String} sType
 * @return {Function}
 * @private
 */
function getPromiseCallbacks(oContext, sType) {
  return function () {
    var aCompleted, nLenPromises, oDeferred, aPromises, nPromise, oPromise, aResults = [];
    oContext.bCompleted = true;
    oContext.sType = sType;
    oContext.oResult = arguments;
    while (oContext.aPending[0]) {
      oContext.aPending.shift()[sType].apply(oContext, arguments);
    }
    oDeferred = oContext.oDeferred;
    if(oDeferred){
      aCompleted = [];
      aPromises = oDeferred.aPromises;
      nLenPromises = aPromises.length;
      aResults = [];
      for(nPromise = 0; nPromise < nLenPromises; nPromise++){
        oPromise = aPromises[nPromise];
        aCompleted.push(Number(oPromise.bCompleted));
        aResults.push( oPromise.oResult );
      }
      if(aCompleted.join('').indexOf('0') === -1){
        oDeferred[sType].apply(oDeferred, aResults);
      }
    }
  };
}

/**
 * Promise is a class that must/can be used to defer execution of one or some callbacks when one
 * condition (normally some asynchronous callbacks that are depending one of other)
 * @class Promise
 * @param {Function} fpCallback
 * @constructor
 * @name Promise
 */
export default function Promise(fpCallback) {
  // Pending callbacks
  this.oDeferred = null;
  this.aResults = [];
  this.aPromises = [];
  this.aPending = [];
  this.bCompleted = false;
  this.sType = '';
  this.oResult = null;
  fpCallback = fpCallback || nullFunc;  // Made to be compatible with previous versions not ES6 compliant.

  // Must be called when something finished successfully
  this.resolve = getPromiseCallbacks(this, 'resolve');
  // Must be called when something fails
  this.reject = getPromiseCallbacks(this, 'reject');
  fpCallback(this.resolve, this.reject);
}

Promise.prototype = {

  /**
   * Adds new callbacks to execute when the promise has been completed
   * @member Promise.prototype
   * @param {Function} fpSuccess
   * @param {Function} fpFailure
   * @return {Promise} Promise instance
   */
  then: function (fpSuccess, fpFailure) {
    var oResult = this.oResult;
    if (this.bCompleted) {
      if (this.sType === 'resolve') {
        fpSuccess.apply(fpSuccess, oResult);
      } else {
        fpFailure.apply(fpFailure, oResult);
      }
    } else {
      this.aPending.push({ resolve: fpSuccess, reject: fpFailure});
    }
    return this;
  },

  /**
   * Adds a new callback to be executed when the promise is resolved.
   * @member Promise.prototype
   * @param {Function} fpSuccess
   */
  done: function (fpSuccess) {
    return this.then(fpSuccess, nullFunc);
  },

  /**
   * Adds a new callback to be executed when the promise is rejected.
   * @member Promise.prototype
   * @param {Function} fpFailure
   */
  fail: function (fpFailure) {
    return this.then(nullFunc, fpFailure);
  },

  /**
   * Sugar function to create a new Deferred object.
   * When expects Promise objects to be added to the Deferred object [Promise1, Promise2,...PromiseN]
   * If one of the arguments is not a Promise When assume that we want to complete the Deferred object
   */
  all: function () {
    return When.apply(When, arguments);
  },
  /**
   * Adds a new callback to be executed when the promise is rejected.
   * According with the new
   * @member Promise.prototype
   * @param {Function} fpFailure
   */
  'catch': function (fpFailure) {
    return this.fail(fpFailure);
  },
  /**
   * Adds a new promise to be used as a Deferred object.
   * @param oPromise
   * @returns {*}
   */
  add: function (oPromise) {
    oPromise.oDeferred = this;
    this.aPromises.push(oPromise);
    return this;
  }
};
/**
 * Returns the callback to be executed when needed.
 * @param {Number} nIndex
 * @param {String} sType
 * @param {Object} oData
 * @param {Number} nLenArgs
 * @param {Promise} oPromise
 * @param {Array} aSolutions
 * @return {Function}
 * @private
 */
export function getThenCallbacks(nIndex, sType, oData, nLenArgs, oPromise, aSolutions) {
  return function (oObj) {
    oData.nLenPromisesResolved++;
    aSolutions[nIndex] = oObj;
    if (nLenArgs === oData.nLenPromisesResolved) {
      oPromise[sType].apply(oPromise, aSolutions);
    }
  };
}
/**
 * Returns an instance of Promise
 * @param {Function} [fpCallback]
 * @returns {Promise}
 * @private
 */
export function getPromise(fpCallback) {
  return new Promise(fpCallback);
}
