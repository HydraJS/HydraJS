import { isTypeOf, sNotDefined } from './Utils';
import Module from './Module';
/**
 * Module to be stored, adds two methods to start and extend modules.
 * @param {String} sModuleId
 * @param {Function} fpCreator
 * @constructor
 * @class FakeModule
 * @name FakeModule
 * @private
 */

function FakeModule(sModuleId, fpCreator) {
  if (isTypeOf(fpCreator, sNotDefined)) {
    throw new Error('Something goes wrong!');
  }
  this.creator = fpCreator;
  this.instances = {};
  this.sModuleId = sModuleId;
}

FakeModule.prototype = {

  /**
   * Wraps the module start
   * @member FakeModule.prototype
   * @param {Object} oData
   * @return {FakeModule}
   */
  start: function (oData) {
    Module.start(this.sModuleId, oData);
    return this;
  },

  /**
   * Wraps the module extend
   * @member FakeModule.prototype
   * @param {String|Function} oSecondParameter
   * @param {Array|Function} oThirdParameter
   * @param {Function} oFourthParameter
   * @return {FakeModule}
   */
  extend: function (oSecondParameter, oThirdParameter, oFourthParameter) {
    Module.extend(this.sModuleId, oSecondParameter, oThirdParameter, oFourthParameter);
    return this;
  },

  /**
   * Wraps the module stop
   * @member FakeModule.prototype
   * @return {FakeModule}
   */
  stop: function () {
    Module.stop(this.sModuleId);
    return this;
  }
}

export default FakeModule;
