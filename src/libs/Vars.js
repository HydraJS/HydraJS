import {simpleMerge, isTypeOf, sNotDefined} from './Utils';
/**
 * Private variables object to be shared between modules
 * @type {Object}
 * @private
 */
var oVars = {};
/**
 * Sets an object of vars and add it's content to oVars private variable
 * @member Module.prototype
 * @param {Object} oVar
 */
export function setVars(oVar){
  if (!isTypeOf(oVars, sNotDefined)) {
    oVars = simpleMerge(oVars, oVar);
  } else {
    oVars = oVar;
  }
}
/**
 * Reset the vars object
 * @member Module.prototype
 */
export function resetVars() {
  oVars = {};
}
/**
 * Returns the private vars object by copy.
 * @return {Object} global vars.
 */
export function getVars() {
  return simpleMerge({}, oVars);
}
