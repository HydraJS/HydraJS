if (typeof require !== 'undefined') {
  var Hydra = require('../../src/Hydra');
}
Hydra.module.register("single-module", function () {
  'use strict';
  return {
    isFirstExecution: null,
    init: function () {
      var self = this;
      this.isFirstExecution = true;
      this.init = function () {
        self.isFirstExecution = false;
      };
    }
  };
});