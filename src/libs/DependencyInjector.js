import { getRoot, isTypeOf, copyArray, isArray } from './Utils';
import { getPromise } from './Promise';
import { getCopyModules, getModules } from './Modules';
import When from './When';
import { getVars } from './Vars';
import Bus from './Bus';
import { getNamespace } from './Namespace';
import Module from './Module';
import { errorHandler } from './ErrorHandler';
import { getApi } from './Hydra';

const root = getRoot();
let und;
const oMapping = {
  'bus': Bus,
  'module': Module,
  'log': errorHandler(),
  'api': getApi(),
  'global': root,
  'doc': root.document || null
};
/**
 * Mapping of prefixes by object to check to resolve dependencies.
 * @type {Object}
 * @private
 */
const oMappingMaps = { ___order___: [] };
/**
 * Helper function to create the mapping
 * @param {Object} oMapping
 * @param {String} sId
 * @param {Object} oMap
 * @param {Function} [fpResolveDI]
 * @private
 */
export function createMapping(oMapping, sId, oMap, fpResolveDI) {
  oMapping.___order___.push(sId);
  oMapping[sId] = {
    __map__: oMap
  };
  if (!fpResolveDI) {
    fpResolveDI = getResolveDICallback(oMapping[sId]);
  }
  oMapping[sId].__resolveDI__ = fpResolveDI;
}
/**
 * Return oMappingMaps
 * @returns {Object}
 */
export function getMappingMaps() {
  return oMappingMaps;
}

/**
 * Create or get a namespace by a namespace defined as string
 * @param {String}sNamespace
 * @return {Object}
 * @private
 */
function resolveNamespace(sNamespace) {
  var oObj = root,
    aElements = sNamespace.split('.'),
    sElement;
  while (!!( sElement = aElements.shift() )) {
    oObj = oObj[sElement] !== und ? oObj[sElement] : oObj[sElement] = {};
  }
  return oObj;
}
/**
 * Resolve dependency injection by default.
 * @param {Object} oMapping
 * @return {Function}
 * @private
 */
function getResolveDICallback(oMapping) {
  return function (sDependency) {
    var oPromise = getPromise();
    if (!oMapping.__map__[sDependency]) {
      return false;
    }
    oPromise.resolve(oMapping.__map__[sDependency]);
    return oPromise;
  };
}

/**
  * Traverse all the mapping systems to get a match.
  * @param {String} sDependency
  * @return {Boolean|Promise}
  * @private
  */
function getDependencyThroughAllMaps(sDependency) {
  var oMap,
    oDependency,
    nIndexOrder,
    nLenOrder,
    aOrderDependency = oMappingMaps.___order___;

  createMapping(oMappingMaps, '__', root, function (sDependency) {
    var oDependency,
      oPromise = getPromise();
    oDependency = resolveNamespace(sDependency);
    oPromise.resolve(oDependency);
    return oPromise;
  });

  for (nIndexOrder = 0, nLenOrder = aOrderDependency.length; nIndexOrder < nLenOrder; nIndexOrder++) {
    oMap = oMappingMaps[aOrderDependency[nIndexOrder]];
    oDependency = oMap.__resolveDI__(sDependency);
    if (oDependency) {
      delete oMappingMaps['__'];
      return oDependency;
    }
  }
  delete oMappingMaps['__'];
  return false;
}

/**
  * Inject dependencies creating modules
  * Look for dependencies in:
  * Hydra mappings
  * oVars
  * oModules
  * namespace
  * root
  * @param {String} sModuleId
  * @param {Array} aDependencies
  */
export function resolveDependencies(sModuleId, aDependencies) {
  const oMappingMaps = getMappingMaps();
  var sDependency,
    sPrefix,
    oModules,
    oMod,
    aPromises = [],
    nDependencies = 0,
    oMap,
    aExtraDependencies,
    oDependency,
    oPromise,
    oResult = {
      mapping: [],
      dependencies: []
    };

  oModules = getCopyModules();
  oMod = oModules[sModuleId];
  if (!oMod) {
    oMod = {};
  }
  if (!oMod.dependencies) {
    oMod.dependencies = ['$$_bus', '$$_module', '$$_log', 'gl_Hydra'];
  }
  aExtraDependencies = oMod.dependencies;
  if (!isArray(aExtraDependencies) && typeof aExtraDependencies === 'object') {
    aExtraDependencies = getKeys(aExtraDependencies);
  }

  aDependencies = (isArray(aDependencies) ? aDependencies : ( aExtraDependencies || [])).concat();

  while (!!(sDependency = aDependencies.shift())) {

    if (isTypeOf(sDependency, 'string')) {
      if (sDependency.indexOf('_') === 2) {
        sPrefix = sDependency.substr(0, 3);
      } else if (sDependency.indexOf('$') === 0) {
        sPrefix = sDependency.substr(0, 1);
      } else {
        sPrefix = '';
      }
      oMap = oMappingMaps[ sPrefix ] || oMappingMaps['gl_'];
      sDependency = sDependency.replace(sPrefix, '');
      oDependency = oMap.__map__[sDependency];
      if (!oDependency) {
        oDependency = getDependencyThroughAllMaps(sDependency);
      } else {
        oDependency = oMap.__resolveDI__(sDependency);
      }

      oResult.mapping.push(sDependency);
    } else {
      oDependency = getPromise();
      oDependency.resolve(sDependency);
      oResult.mapping.push(sDependency.__type__ || oMod.dependencies[nDependencies]);
    }
    aPromises.push(oDependency);
  }
  oPromise = getPromise();

  When.apply(When, aPromises).then(function () {
    oPromise.resolve.apply(oPromise, [oResult.mapping].concat(copyArray(arguments)));
  });
  return oPromise;
}

createMapping(oMappingMaps, '$$_', oMapping);
createMapping(oMappingMaps, '$', oMapping);
createMapping(oMappingMaps, 'pr_', getVars());
createMapping(oMappingMaps, 'hm_', getModules());
createMapping(oMappingMaps, 'ns_', getNamespace() || root);
createMapping(oMappingMaps, 'gl_', root);

