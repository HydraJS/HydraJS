import {getRoot,} from './Utils';
const root = getRoot();
/**
 * Simple object to abstract the error handler, the most basic is to be the console object
 * @type {Object|*}
 * @private
 */
let ErrorHandler = root.console || {
    log: function () {
    },
    error: function () {
    },
    __type__: 'log'
  };
/**
 * Returns the actual ErrorHandler
 * @member Hydra
 * @type {Function}
 * @static
 */
export function errorHandler () {
  return ErrorHandler;
}
/**
 * Sets and overwrites the ErrorHandler object to log errors and messages
 * @member Hydra
 * @type {Function}
 * @static
 */
export function setErrorHandler(oErrorHandler) {
  ErrorHandler = oErrorHandler;
  ErrorHandler.__type__ = 'log';
}
