import {
  isTypeOf, sNotDefined,
  iterateObject, isFunction,
  nullFunc, copyArray, simpleMerge,
  sFunctionType, generateUniqueKey,
  getSimpleFunction, getObjectLength,
  isInstanceOf, isArray
} from './Utils';
import Bus from './Bus';
import { resetVars, setVars, getVars } from './Vars';
import { getModules, resetModules } from './Modules';
import { getDebug } from './Debug';
import { getPromise } from './Promise';
import { resolveDependencies, createMapping, getMappingMaps } from './DependencyInjector';
import { errorHandler } from './ErrorHandler';
import FakeModule from './FakeModule';

const __super__ = {};
const instances = {};
const __type__ = 'module';
const oModifyInit = {};
/**
 * type is a property to be able to know the class type.
 * @type {String}
 */
const type = 'Module';
/**
 * Return the message to show when a module is not registered
 * @param {String} sModuleId
 * @param {Boolean} [bThrow]
 * @return {String}
 * @private
 */
function fpThrowErrorModuleNotRegistered(sModuleId, bThrow) {
  var sMessage = 'The module ' + sModuleId + ' is not registered in the system';
  if (bThrow) {
    throw new Error(sMessage);
  }
  return sMessage;
}

export function extendModifyInit(oVar) {
  simpleMerge(oModifyInit, oVar);
}
/**
 * Add common properties and methods to avoid repeating code in modules
 * @param {String} sModuleId
 * @param {Array} aDependencies
 * @param {Function} fpCallback
 * @private
 */
function addPropertiesAndMethodsToModule(sModuleId, aDependencies, fpCallback) {
  var oPromise;

  function success(mapping) {
    const oModules = getModules();
    var oModule, fpInitProxy;
    oModule = oModules[sModuleId].creator.apply(oModules[sModuleId], [].slice.call(arguments, 1));
    oModule.__children__ = [];
    oModule.dependencies = aDependencies || [].slice.call(arguments, 1);
    oModule.resolvedDependencies = mapping;
    oModule.__module_id__ = sModuleId;
    fpInitProxy = oModule.init || nullFunc;
    // Provide compatibility with old versions of Hydra.js
    oModule.__action__ = oModule.__sandbox__ = Bus;
    oModule.events = oModule.events || {};
    oModule.init = function () {
      var aArgs = copyArray(arguments).concat(getVars());
      if (oModule.__children__.length === 0) {  // Only subscribe last element of inheritance.
        Bus.subscribe(oModule);
      }
      return fpInitProxy.apply(this, aArgs);
    };
    oModule.handleAction = function (oNotifier) {
      var fpCallback = this.events[oNotifier.type];
      if (isTypeOf(fpCallback, sNotDefined)) {
        return;
      }
      fpCallback.call(this, oNotifier);
    };
    // Provide compatibility with old Hydra versions which used to use "destroy" as onDestroy hook.
    oModule.onDestroy = oModule.onDestroy || oModule.destroy || function () {
      };
    oModule.destroy = function () {
      this.onDestroy();
      Bus.unsubscribe(oModule);
      delete oModules[sModuleId].instances[oModule.__instance_id__];
    };
    fpCallback(oModule);
  }

  oPromise = resolveDependencies(sModuleId, aDependencies);
  oPromise.then(function () {
    success.apply(success, arguments);
  });
}
/**
 * Checks if module was already successfully started
 * @member Module.prototype
 * @param {String} sModuleId Name of the module
 * @param {String} [sInstanceId] Id of the instance
 * @return {Boolean}
 */
export function isModuleStarted(sModuleId, sInstanceId) {
  const oModules = getModules();
  var bStarted = false,
    bModuleDefined = isTypeOf(oModules[sModuleId], sNotDefined);
  if (isTypeOf(sInstanceId, sNotDefined)) {
    bStarted = ( !bModuleDefined && getObjectLength(oModules[sModuleId].instances) > 0 );
  } else {
    bStarted = ( !bModuleDefined && !isTypeOf(oModules[sModuleId].instances[sInstanceId], sNotDefined) );
  }
  return bStarted;
}
/**
 * getInstance is the method that will create the module instance and wrap the method if needed.
 * @param {String} sModuleId
 * @param {Array} [aDependencies]
 * @param {Function} fpCallback
 * @private
 */
function getInstance(sModuleId, aDependencies, fpCallback) {
  const oModules = getModules();
  if (isTypeOf(oModules[sModuleId], sNotDefined)) {
    fpThrowErrorModuleNotRegistered(sModuleId, true);
  }
  addPropertiesAndMethodsToModule(sModuleId, aDependencies, function (oInstance) {
    if (!getDebug()) {
      iterateObject(oInstance, function (oItem, sName) {
        if (isFunction(oItem)) {
          wrapMethod(oInstance, sName, sModuleId, oInstance[sName]);
        }
      });
    }
    fpCallback(oInstance);
  });
}
/**
 * wrapMethod is a method to wrap the original method to avoid failing code.
 * This will be only called if bDebug flag is set to false.
 * @param {Object} oInstance
 * @param {String} sName
 * @param {String} sModuleId
 * @param {Function} fpMethod
 * @private
 */
function wrapMethod(oInstance, sName, sModuleId, fpMethod) {
  oInstance[sName] = ( function (sName, fpMethod) {
    return function () {
      var aArgs = copyArray(arguments);
      try {
        return fpMethod.apply(this, aArgs);
      }
      catch (erError) {
        const ErrorHandler = errorHandler();
        ErrorHandler.error(sModuleId, sName, erError);
        return false;
      }
    };
  }(sName, fpMethod));
}

/**
 * register is the method that will add the new module to the oModules object.
 * sModuleId will be the key where it will be stored.
 * @param {String} sModuleId
 * @param {Array} aDependencies
 * @param {Function | *} fpCreator
 * @return {Object}
 */
function register(sModuleId, aDependencies, fpCreator) {
  const oModules = getModules();
  if (isFunction(aDependencies)) {
    fpCreator = aDependencies;
    aDependencies = [ '$$_bus', '$$_module', '$$_log', 'gl_Hydra' ];
  }
  oModules[sModuleId] = new FakeModule(sModuleId, fpCreator);

  oModules[sModuleId].dependencies = aDependencies;
  return oModules[sModuleId];
}
/**
 * Method to set an instance of a module
 * @param {String} sModuleId
 * @param {String} sIdInstance
 * @param {Module} oInstance
 * @return {Module}
 */
function setInstance(sModuleId, sIdInstance, oInstance) {
  const oModules = getModules();
  var oModule = oModules[sModuleId];
  if (!oModule) {
    fpThrowErrorModuleNotRegistered(sModuleId, true);
  }
  oModule.instances[sIdInstance] = oInstance;
  return oModule;
}
/**
 * start more than one module at the same time.
 * @param {Object} oInstance
 * @param {Array<String>} aModulesIds
 * @param {String} sIdInstance
 * @param {Object} oData
 * @param {Boolean} bSingle
 * @private
 */
function _multiModuleStart(oInstance, aModulesIds, sIdInstance, oData, bSingle) {
  var aInstancesIds, aData, aSingle, nIndex, nLenModules, sModuleId;
  if (isArray(sIdInstance)) {
    aInstancesIds = copyArray(sIdInstance);
  }
  if (isArray(oData)) {
    aData = copyArray(oData);
  }
  if (isArray(bSingle)) {
    aSingle = copyArray(bSingle);
  }
  for (nIndex = 0, nLenModules = aModulesIds.length; nIndex < nLenModules; nIndex++) {
    sModuleId = aModulesIds[nIndex];
    sIdInstance = aInstancesIds && aInstancesIds[nIndex] || generateUniqueKey();
    oData = aData && aData[nIndex] || oData;
    bSingle = aSingle && aSingle[nIndex] || bSingle;
    startSingleModule(oInstance, sModuleId, sIdInstance, oData, bSingle);
  }
}
/**
 * Method to modify the init method to use it for extend.
 * @param {Object} oInstance
 * @param {Object} oData
 * @param {Boolean} bSingle
 * @private
 */
function beforeInit(oInstance, oData, bSingle) {
  iterateObject(oModifyInit, function (oMember) {
    if (oMember && isTypeOf(oMember, sFunctionType)) {
      oMember(oInstance, oData, bSingle);
    }
  });
}
/**
 * startSingleModule is the method that will initialize the module.
 * When start is called the module instance will be created and the init method is called.
 * If bSingle is true and the module is started the module will be stopped before instance it again.
 * This avoid execute the same listeners more than one time.
 * @param {Object} oWrapper
 * @param {String} sModuleId
 * @param {String} sIdInstance
 * @param {Object} oData
 * @param {Boolean} bSingle
 * @private
 */
function startSingleModule(oWrapper, sModuleId, sIdInstance, oData, bSingle) {
  const oModules = getModules();
  var oModule;
  oModule = oModules[sModuleId];
  if ( (bSingle && isModuleStarted(sModuleId)) || isModuleStarted(sModuleId, sIdInstance)) {
    oWrapper.stop(sModuleId, sIdInstance);
  }
  if (!isTypeOf(oModule, sNotDefined)) {
    createInstance(sModuleId, undefined, function (oInstance) {
      oModule.instances[sIdInstance] = oInstance;
      oInstance.__instance_id__ = sIdInstance;

      beforeInit(oInstance, oData, bSingle);

      if (!isTypeOf(oData, sNotDefined)) {
        oInstance.init(oData);
      } else {
        oInstance.init();
      }
    });
  } else {
    const ErrorHandler = errorHandler();
    ErrorHandler.error(new Error(), fpThrowErrorModuleNotRegistered(sModuleId));
  }
}

/**
 * Start only one module.
 * @param {Object} oInstance
 * @param {String} sModuleId
 * @param {String} sIdInstance
 * @param {Object} oData
 * @param {Boolean|*} bSingle
 * @private
 */
function _singleModuleStart(oInstance, sModuleId, sIdInstance, oData, bSingle) {
  if (!isTypeOf(sIdInstance, 'string')) {
    bSingle = oData;
    oData = sIdInstance;
    sIdInstance = generateUniqueKey();
  }

  startSingleModule(oInstance, sModuleId, sIdInstance, oData, bSingle);
}
/**
 * start is the method that initialize the module/s
 * If you use array instead of arrays you can start more than one module even adding the instance,
 * the data and if it must be executed as single module start.
 * @param {String|Array} oModuleId
 * @param {String|Array} [oIdInstance]
 * @param {Object|Array} [oData]
 * @param {Boolean|Array} [oSingle]
 */
function start(oModuleId, oIdInstance, oData, oSingle) {
  var bStartMultipleModules = isArray(oModuleId);

  if (bStartMultipleModules) {
    _multiModuleStart(this, copyArray(oModuleId), oIdInstance, oData, oSingle);
  } else {
    _singleModuleStart(this, oModuleId, oIdInstance, oData, oSingle);
  }
}
/**
 * createInstance is the method that will create the module instance and wrap the method if needed.
 * @param {String} sModuleId
 * @param {Array|undefined} [aDependencies]
 * @param {Function} fpCallback
 * @private
 */
function createInstance(sModuleId, aDependencies, fpCallback) {
  const oModules = getModules();
  if (isTypeOf(oModules[sModuleId], sNotDefined)) {
    fpThrowErrorModuleNotRegistered(sModuleId, true);
  }
  addPropertiesAndMethodsToModule(sModuleId, aDependencies, function (oInstance) {
    if (!getDebug()) {
      iterateObject(oInstance, function (oItem, sName) {
        if (isFunction(oItem)) {
          wrapMethod(oInstance, sName, sModuleId, oInstance[sName]);
        }
      });
    }
    fpCallback(oInstance);
  });
}
/**
 * Sets properties and methods from a template object.
 * @param {Object} oMethodsObject
 * @param {Object} oPropertiesObject
 * @returns {Function}
 */
function getCallbackToSetObjectFromTemplate(oMethodsObject, oPropertiesObject) {
  return function (oValue, sKey) {
    if (typeof oValue === 'function') {
      oMethodsObject[sKey] = getSimpleFunction(oValue);
    } else if (isArray(oValue)) {
      oPropertiesObject[sKey] = copyArray(oValue);
    } else if (typeof oValue === 'object' && oValue !== null ) {
      oPropertiesObject[sKey] = simpleMerge({}, oValue);
    } else if (isInstanceOf(oValue, Date)) {
      oPropertiesObject[sKey] = new Date();
      oPropertiesObject[sKey].setTime(oValue.getTime());
    } else {
      oPropertiesObject[sKey] = oValue;
    }
  };
}

/**
 * Method to extend modules using inheritance or decoration pattern
 * @param {String} sBaseModule
 * @param {String|Function} sModuleDecorated
 * @param {Array|Function} aDependencies
 * @param {Function} fpDecorator
 * @return {Promise}
 */
function extend(sBaseModule, sModuleDecorated, aDependencies, fpDecorator) {
  const oModules = getModules();
  var oModule = oModules[sBaseModule], oDecorated, oPromise;
  oPromise = getPromise();
  if (!oModule) {
    const ErrorHandler = errorHandler();
    ErrorHandler.log(fpThrowErrorModuleNotRegistered(sBaseModule));
    oPromise.resolve(null);
    return oPromise;
  }

  createInstance(sBaseModule, aDependencies, function (oInstance) {
    var oPromise2, aNoDependencies = [ '$$_bus', '$$_module', '$$_log', 'gl_Hydra' ];

    if (isTypeOf(sModuleDecorated, sFunctionType)) {
      fpDecorator = sModuleDecorated;
      sModuleDecorated = sBaseModule;
      aDependencies = aNoDependencies;
    }
    if (isTypeOf(aDependencies, sFunctionType)) {
      fpDecorator = aDependencies;
      aDependencies = aNoDependencies;
    }
    oPromise2 = resolveDependencies(sModuleDecorated, aDependencies);
    oPromise2.then(function () {
      const oModules = getModules();
      var oParentProperties = {},
        oParentMethods = {},
        Parent,
        Child;
      oModules[sModuleDecorated] = new FakeModule(sModuleDecorated, function () {
        var aDepends = [].slice.call(arguments);
        aDepends.push(oInstance);
        // If we extend the module with the different name, we
        // create proxy class for the original methods.

        oDecorated = fpDecorator.apply(fpDecorator, aDepends);

        if (isTypeOf(sBaseModule, 'string') && isTypeOf(sModuleDecorated, 'string')) {
          oInstance.__children__.push(oDecorated);
        }

        iterateObject(oInstance, getCallbackToSetObjectFromTemplate(oParentMethods, oParentProperties));

        Parent = function () {
          var self = this;
          iterateObject(oParentProperties, function (oValue, sKey) {
            self[sKey] = oValue;
          });
        };
        Parent.prototype = oParentMethods;

        Child = function () {
          var self = this, _super = oParentMethods;
          Parent.apply(self, arguments);

          _super.parentModule = sBaseModule;
          iterateObject(oDecorated, getCallbackToSetObjectFromTemplate(self, self));
          this.uber = _super;

          if (oInstance.uber) {
            _super.uber = {};
            iterateObject(oInstance.uber, function (oValue, sKey) {
              var fpCallback = getSimpleFunction(oValue, self);
              if (!self.uber[sKey]) {
                self.uber[sKey] = fpCallback;
              }
              // If the son does not have the method but the parent has then the son should have it too.
              _super.uber[sKey] = fpCallback;
            });
          }

          this.__children__ = [];
          this.__super__ = {
            __call__: function (sKey, aArgs) {
              return oInstance[sKey].apply(self, aArgs);
            }
          };
        };
        Child.prototype = new Parent();

        return new Child();
      });
      oModules[sModuleDecorated].dependencies = aDependencies;
      oPromise.resolve(oModules[sModuleDecorated]);
    });
  });
  return oPromise;
}
/**
 * Alias decorate to extend modules.
 * @return {Promise}
 */
function decorate() {
  return this.extend.apply(this, arguments);
}
/**
 * startAll is the method that will initialize all the registered modules.
 * @member Module.prototype
 */
function startAll() {
  const oModules = getModules();
  iterateObject(oModules, function (_oModule, sModuleId) {
    if (!isTypeOf(_oModule, sNotDefined)) {
      start(sModuleId, generateUniqueKey());
    }
  });
}
/**
 * stop is the method that will finish the module if it was registered and started.
 * When stop is called the module will call the destroy method and will nullify the instance.
 * @param {String} sModuleId
 * @param {String} [sInstanceId]
 * @return {Boolean}
 */
function stop(sModuleId, sInstanceId) {
  const oModules = getModules();
  var oModule;
  oModule = oModules[sModuleId];
  if (isTypeOf(oModule, sNotDefined)) {
    return false;
  }
  if (!isTypeOf(sInstanceId, sNotDefined)) {
    _singleModuleStop(oModule, sInstanceId);
  } else {
    _multiModuleStop(oModule);
  }
  return true;
}
/**
 * stop more than one module at the same time.
 * @param {Object} oModule
 * @private
 */
function _multiModuleStop(oModule) {
  iterateObject(oModule.instances, function (oInstance) {
    if (!isTypeOf(oModule, sNotDefined) && !isTypeOf(oInstance, sNotDefined)) {
      oInstance.destroy();
    }
  });
  oModule.instances = {};
}
/**
 * Stop only one module.
 * @param {Object} oModule
 * @param {String} sInstanceId
 * @private
 */
function _singleModuleStop(oModule, sInstanceId) {
  var oInstance = oModule.instances[sInstanceId];
  if (!isTypeOf(oModule, sNotDefined) && !isTypeOf(oInstance, sNotDefined)) {
    oInstance.destroy();
    delete oModule.instances[sInstanceId];
  }
}
/**
 * stopAll is the method that will finish all the registered and started modules.
 */
function stopAll() {
  const oModules = getModules();
  iterateObject(oModules, function (_oModule, sModuleId) {
    if (!isTypeOf(_oModule, sNotDefined)) {
      _stopOneByOne(_oModule, sModuleId);
    }
  });
}
/**
 * Loops over instances of modules to stop them.
 * @param {Object} oModule
 * @param {String} sModuleId
 * @private
 */
function _stopOneByOne(oModule, sModuleId) {
  iterateObject(oModule.instances, function (oItem, sInstanceId) {
    stop(sModuleId, sInstanceId);
  });
}
/**
 * remove is the method that will remove the full module from the oModules object
 * @param {String} sModuleId
 * @return {*}
 */
function remove(sModuleId) {
  const oModules = getModules();
  var oModule = oModules[sModuleId];
  if (isTypeOf(oModule, sNotDefined)) {
    return null;
  }
  if (!isTypeOf(oModule, sNotDefined)) {
    try {
      return Module;
    }
    finally {
      _delete(sModuleId);
      createMapping(getMappingMaps(), 'hm_', oModules);
    }
  }
  return null;
}
/**
 * _delete is a wrapper method that will call the native delete javascript function
 * It's important to test the full code.
 * @param {String} sModuleId
 * @return {Boolean}
 */
function _delete(sModuleId) {
  const oModules = getModules();
  if (!isTypeOf(oModules[sModuleId], sNotDefined)) {
    delete oModules[sModuleId];
    return true;
  }
  return false;
}
/**
 * Stop all the running modules and cleans all the stored modules.
 */
function reset() {
  stopAll();
  resetModules();
  createMapping(getMappingMaps(), 'hm_', getModules());
}

/**
 * Class to manage the modules.
 * @constructor
 * @class Module
 * @name Module
 * @private
 */
const Module = {
  __super__,
  instances,
  __type__,
  type,
  getInstance,
  setInstance,
  setVars,
  resetVars,
  getVars,
  extend,
  decorate,
  isModuleStarted,
  register,
  start,
  startAll,
  stop,
  stopAll,
  remove,
  reset
};

export default Module;
