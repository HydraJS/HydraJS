import bus from './Bus';
import { setDebug, getDebug } from './Debug';
import { errorHandler, setErrorHandler } from './ErrorHandler'
import Promise from './Promise';
import when from './When';
import {getCopyModules} from './Modules';
import module, {extendModifyInit} from './Module';
import { setNamespace } from './Namespace';
import { isTypeOf, clone, sNotDefined, simpleMerge} from './Utils';
import { resolveDependencies, getMappingMaps, createMapping } from './DependencyInjector.js';

const und = undefined;
const version = '{{ version }}';
const Deferred = Promise;
const __type__ = 'api';
const getCopyChannels = bus.getCopyChannels;

function extend(sIdExtension, oExtension) {
  if (isTypeOf(this[sIdExtension], sNotDefined)) {
    this[sIdExtension] = oExtension;
  } else {
    this[sIdExtension] = simpleMerge(this[sIdExtension], oExtension);
  }
}
function noConflict(sOldName, oNewContext, sNewName) {
  if (!isTypeOf(this[sOldName], sNotDefined)) {
    oNewContext[sNewName] = this[sOldName];
    return true;
  }
  return false;
}
function addExtensionBeforeInit(oVar) {
  extendModifyInit(oVar);
}
function addMapping(sPrefix, oMapping, fpResolveDI) {
  const oMappingMaps = getMappingMaps();
  var oMap = oMappingMaps[sPrefix];
  if (oMap === und) {
    createMapping(oMappingMaps, sPrefix, oMapping, fpResolveDI);
  } else {
    simpleMerge(oMappingMaps[sPrefix].__map__, oMapping);
  }
}
function addAsyncMapping(sPrefix, oMapping, fpCallback) {
  this.addMapping(sPrefix, oMapping, function(sDependency) {
    return fpCallback.call(oMapping, sDependency);
  });
}

export function getApi() {
  return {
    /**
     * Version number of Hydra.
     * @type {String}
     */
    version,
    /**
     * bus is a singleton instance of the bus to subscribe and publish content in channels.
     * @type {Object}
     */
    bus,
    /**
     * Returns the actual ErrorHandler
     * @type {Function}
     * @static
     */
    errorHandler,
    /**
     * Sets and overwrites the ErrorHandler object to log errors and messages
     * @type {Function}
     * @static
     */
    setErrorHandler,
    /**
     * Returns the constructor of Promise object
     * @type {Promise}
     * @static
     */
    Promise,
    /**
     * Returns the constructor of Deferred object
     * @type {Promise}
     * @static
     */
    Deferred,
    /**
     * Sugar method to generate Deferred objects in a simple way
     * @type {Function}
     * @static
     */
    when,
    /**
     * Return a singleton of Module
     * @type {Object}
     * @static
     */
    module,
    /**
     * Change the debug mode to on/off
     * @type {Function}
     * @static
     */
    setDebug,
    /**
     * Get the debug status
     * @type {Function}
     * @static
     */
    getDebug,
    /**
     * Extends Hydra object with new functionality
     * @param {String} sIdExtension
     * @param {Object} oExtension
     * @static
     */
    extend,
    /**
     * Resolve dependencies of modules
     * @static
     */
    resolveDependencies,
    /**
     * Adds an alias to parts of Hydra
     * @param {String} sOldName
     * @param {Object} oNewContext
     * @param {String} sNewName
     * @return {Boolean}
     * @static
     */
    noConflict,
    /**
     * Merges an object to oModifyInit that will be executed before executing the init.
     * {
   *    'property_in_module_to_check': function(Module){} // Callback to execute if the property exist
   * }
     * @type {Function}
     * @param {Object} oVar
     * @static
     */
    addExtensionBeforeInit,
    /**
     * To be used about extension, it will return a deep copy of the Modules object to avoid modifying the original
     * object.
     * @type {Function}
     * @return {Object}
     * @static
     */
    getCopyModules,
    /**
     * To be used about extension, it will return a deep copy of the Channels object to avoid modifying the original
     * object.
     * @type {Function}
     * @return {Object}
     * @static
     */
    getCopyChannels,
    /**
     * Sets the global namespace
     * @param {Object} _namespace
     * @type {Function}
     * @static
     */
    setNamespace,
    /**
     * Adds a new mapping to be used by the dependency injection system.
     * @param {String} sPrefix
     * @param {Object} oMapping
     * @param {Function} [fpResolveDI]
     * @static
     */
    addMapping,
    /**
     * Adds an async mapping to be used by the dependency injection system.
     * @param {String} sPrefix
     * @param {Object} oMapping
     * @param {Function} fpCallback -> This callback should return a promise.
     * @static
     */
    addAsyncMapping,
    __type__
  };
}

export {
  /**
   * Version number of Hydra.
   * @type {String}
   */
  version,
  /**
   * bus is a singleton instance of the bus to subscribe and publish content in channels.
   * @type {Object}
   */
  bus,
  /**
   * Returns the actual ErrorHandler
   * @type {Function}
   * @static
   */
  errorHandler,
  /**
   * Sets and overwrites the ErrorHandler object to log errors and messages
   * @type {Function}
   * @static
   */
  setErrorHandler,
  /**
   * Returns the constructor of Promise object
   * @type {Promise}
   * @static
   */
  Promise,
  /**
   * Returns the constructor of Deferred object
   * @type {Promise}
   * @static
   */
  Deferred,
  /**
   * Sugar method to generate Deferred objects in a simple way
   * @type {Function}
   * @static
   */
  when,
  /**
   * Return a singleton of Module
   * @type {Object}
   * @static
   */
  module,
  /**
   * Change the debug mode to on/off
   * @type {Function}
   * @static
   */
  setDebug,
  /**
   * Get the debug status
   * @type {Function}
   * @static
   */
  getDebug,
  /**
   * Extends Hydra object with new functionality
   * @param {String} sIdExtension
   * @param {Object} oExtension
   * @static
   */
  extend,
  /**
   * Resolve dependencies of modules
   * @static
   */
  resolveDependencies,
  /**
   * Adds an alias to parts of Hydra
   * @param {String} sOldName
   * @param {Object} oNewContext
   * @param {String} sNewName
   * @return {Boolean}
   * @static
   */
  noConflict,
  /**
   * Merges an object to oModifyInit that will be executed before executing the init.
   * {
   *    'property_in_module_to_check': function(Module){} // Callback to execute if the property exist
   * }
   * @type {Function}
   * @param {Object} oVar
   * @static
   */
  addExtensionBeforeInit,
  /**
   * To be used about extension, it will return a deep copy of the Modules object to avoid modifying the original
   * object.
   * @type {Function}
   * @return {Object}
   * @static
   */
  getCopyModules,
  /**
   * To be used about extension, it will return a deep copy of the Channels object to avoid modifying the original
   * object.
   * @type {Function}
   * @return {Object}
   * @static
   */
  getCopyChannels,
  /**
   * Sets the global namespace
   * @param {Object} _namespace
   * @type {Function}
   * @static
   */
  setNamespace,
  /**
   * Adds a new mapping to be used by the dependency injection system.
   * @param {String} sPrefix
   * @param {Object} oMapping
   * @param {Function} [fpResolveDI]
   * @static
   */
  addMapping,
  /**
   * Adds an async mapping to be used by the dependency injection system.
   * @param {String} sPrefix
   * @param {Object} oMapping
   * @param {Function} fpCallback -> This callback should return a promise.
   * @static
   */
  addAsyncMapping,
  __type__
};
