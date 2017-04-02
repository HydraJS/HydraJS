(function() {
  'use strict';
  var oErrorHandler = null
    , FakeClass = function() {
  };

  function getLengthObject(obj) {
    var sKey
      , nLen = 0;
    for (sKey in obj) {
      if (obj.hasOwnProperty(sKey)) {
        nLen++;
      }
    }
    return nLen;
  }

  FakeClass.type = 'Fake';

  Hydra.setTestFramework(true);

  describe('Hydra.js', function() {

    beforeEach(function() {
      Hydra.module.reset();
    });

    afterEach(function() {
      Hydra.module.reset();
    });
    describe('Fix extension module bug on lazy pattern single module', function() {
      beforeEach(function() {
        Hydra.module.register("single-module", function() {
          return {
            isFirstExecution: null,
            init: function() {
              var self = this;
              this.isFirstExecution = true;
              this.init = function() {
                self.isFirstExecution = false;
              };
            }
          };
        });
      });
      it('should return true if module is executed once', function() {
        Hydra.module.test('single-module', function(oModule) {
          oModule.init();
          expect(oModule.isFirstExecution).toEqual(true);
        });
      });

      it('should return false if module is executed twice', function() {

        Hydra.module.test('single-module', function(oModule) {
          oModule.init();
          oModule.init();
          expect(oModule.isFirstExecution).toEqual(false);
        });

      });

    });


    describe('Fix extension module bug on lazy pattern extended module', function() {
      beforeEach(function() {
        Hydra.module.register("single-module", function() {
          return {
            isFirstExecution: null,
            init: function() {
              var self = this;
              this.isFirstExecution = true;
              this.init = function() {
                self.isFirstExecution = false;
              };
            }
          };
        });
        Hydra.module.extend("single-module", "extended-module", function() {
          return {
            isFirstExecution: null,
            init: function() {
              var self = this;
              this.isFirstExecution = true;
              this.init = function() {
                self.isFirstExecution = false;
              };
            }
          };
        });
      });
      it('should return true if module is executed once', function() {
        Hydra.module.test('extended-module', function(oModule) {
          oModule.init();
          expect(oModule.isFirstExecution).toEqual(true);
        });

      });

      it('should return false if module is executed twice', function() {
        Hydra.module.test('extended-module', function(oModule) {
          oModule.init();
          oModule.init();
          expect(oModule.isFirstExecution).toEqual(false);
        });
      });

    });


    describe('On request Hydra', function() {

      it('should return an object', function() {
        expect(Hydra).not.toBeUndefined();
      });

      it('should contain a property called errorHandler', function() {
        expect(Hydra.errorHandler).not.toBeUndefined();
        expect(typeof Hydra.errorHandler === 'function').toBeTruthy();
      });

      it('should contain a property called setErrorHandler', function() {
        expect(Hydra.setErrorHandler).not.toBeUndefined();
        expect(typeof Hydra.setErrorHandler === 'function').toBeTruthy();
      });

      it('should contain a property called module', function() {
        expect(Hydra.module).not.toBeUndefined();
        expect(typeof Hydra.module === 'object').toBeTruthy();
        expect(Hydra.module.type).toEqual("Module");
      });

    });


    describe('setErrorHandler', function() {

      it('should change the ErrorHandler class to a Fake Class', function() {
        var oResult;

        oErrorHandler = Hydra.errorHandler();
        Hydra.setErrorHandler(FakeClass);

        oResult = Hydra.errorHandler();

        expect(oResult.type).toEqual("Fake");
        Hydra.setErrorHandler(oErrorHandler);
      });

      it('should return an instance of Fake Class', function() {
        var oInstance
          , oClass;

        oErrorHandler = Hydra.errorHandler();
        Hydra.setErrorHandler(FakeClass);

        oClass = Hydra.errorHandler();
        oInstance = new (oClass);

        expect(oInstance instanceof oClass).toBeTruthy();

        Hydra.setErrorHandler(oErrorHandler);
      });

    });


    describe('Register a module', function() {

      it('should throw an error if we try to create a module without register if the ErrorHandler Class', function() {
        var sModuleId = 'test';

        expect(function() {
          Hydra.module.test(sModuleId, function() {
            Hydra.module.remove(sModuleId);
          });
        }).toThrow();
      });

      it('should return a module if we create a module registering it', function() {
        var sModuleId = 'test'
          , fpModuleCreator = function() {
          return {
            init: function() {

            },
            handleAction: function() {

            },
            destroy: function() {

            }
          }
        };

        Hydra.module.register(sModuleId, fpModuleCreator);
        Hydra.module.test(sModuleId, function(oModule) {
          expect(typeof oModule === 'object').toBeTruthy();
          Hydra.module.remove(sModuleId);
        });


      });

    });


    describe('Remove a module', function() {
      beforeEach(function() {
        Hydra.module.reset();
      });

      afterEach(function() {
        Hydra.module.reset();
      });

      it('should not remove the module test if we try to remove the module test2', function() {
        var sModuleId = 'test'
          , sModuleDontExist = 'test2'
          , sContainerId = 'test';

        Hydra.module.register('test', function() {
          return {}
        });
        expect(Object.keys(Hydra.getCopyModules()).length).toEqual(1);

        Hydra.module.remove(sModuleDontExist, sContainerId);

        expect(Object.keys(Hydra.getCopyModules()).length).toEqual(1);
      });

      it('should remove the module test if we remove it', function() {
        var sModuleId = 'test'
          , sContainerId = 'test';

        Hydra.module.register(sModuleId, function() {
          return {};
        });

        expect(Object.keys(Hydra.getCopyModules()).length).toEqual(1);

        Hydra.module.remove(sModuleId, sContainerId);

        expect(Object.keys(Hydra.getCopyModules()).length).toEqual(0);
      });

    });


    describe('Start module/s', function() {

      it('should call the init method of the module if the module is registered before start', function() {
        var sModuleId = 'test'
          , sModuleId2 = 'test2'
          , fpInitStub = sinon.stub()
          , fpInitStub2 = sinon.stub()
          , fpModuleCreator = function() {
          return {
            init: function() {
              fpInitStub();
            },
            handleAction: function() {

            },
            destroy: function() {

            }
          }
        }
          , fpModuleCreator2 = function() {
          return {
            init: function() {
              fpInitStub2();
            },
            handleAction: function() {

            },
            destroy: function() {

            }
          }
        };
        Hydra.module.register(sModuleId, fpModuleCreator);
        Hydra.module.register(sModuleId2, fpModuleCreator2);

        Hydra.module.start(sModuleId);

        expect(fpInitStub.calledOnce).toBeTruthy();

        Hydra.module.remove(sModuleId);
      });

      it('should check that all the init methods in the modules are called when using multi-module start', function() {
        var sModuleId = 'test'
          , sModuleId2 = 'test2'
          , fpInitStub = sinon.stub()
          , fpInitStub2 = sinon.stub()
          , fpModuleCreator = function() {
          return {
            init: function() {
              fpInitStub();
            },
            handleAction: function() {

            },
            destroy: function() {

            }
          }
        }
          , fpModuleCreator2 = function() {
          return {
            init: function() {
              fpInitStub2();
            },
            handleAction: function() {

            },
            destroy: function() {

            }
          }
        };
        Hydra.module.register(sModuleId, fpModuleCreator);
        Hydra.module.register(sModuleId2, fpModuleCreator2);

        Hydra.module.start([sModuleId, sModuleId2]);

        expect(fpInitStub.calledOnce).toBeTruthy();
        expect(fpInitStub2.calledOnce).toBeTruthy();

        Hydra.module.remove(sModuleId);
      });

    });

    describe('Reset modules', function() {

      it('should check that there are no modules after executing reset', function() {
        var oModules;
        Hydra.module.register('test', function() {
          return {};
        });
        oModules = Hydra.getCopyModules();
        expect(Object.keys(oModules).length).toEqual(1);

        Hydra.module.reset();

        oModules = Hydra.getCopyModules();
        expect(Object.keys(oModules).length).toEqual(0);
      });
    });

    describe('Start all modules', function() {

      it('should call the init method of the two registered modules', function() {
        var sModuleId = 'test'
          , sModuleId2 = 'test2'
          , fpInitStub = sinon.stub()
          , fpModuleCreator = function() {
          return {
            init: function() {
              fpInitStub();
            },
            handleAction: function() {

            },
            destroy: function() {

            }
          }
        };
        Hydra.module.register(sModuleId, fpModuleCreator);
        Hydra.module.register(sModuleId2, fpModuleCreator);

        Hydra.module.startAll();

        expect(fpInitStub.calledTwice).toBeTruthy();

        Hydra.module.remove(sModuleId);
      });

    });


    describe('Stop module/s', function() {

      it('should not call the destroy method if the module is registered but not started', function(done) {

        var oMod
          , sModuleId = 'test'
          , sContainerId = 'test'
          , fpDestroyStub = sinon.stub();

        Hydra.module.register(sModuleId, function() {
          return {
            init: function() {
            },
            onDestroy: fpDestroyStub
          }
        });

        Hydra.module.getModule(sModuleId, sContainerId, function(oModule) {
          oMod = oModule;
          Hydra.module.remove(sModuleId, sContainerId);
          Hydra.module.stop(sModuleId, sContainerId);
          expect(fpDestroyStub.callCount).toEqual(0);
          Hydra.module.remove(sModuleId, sContainerId);
          done();
        });

      });

      it('should call the destroy method one time if the module is registered and started', function(done) {
        var oMod
          , sModuleId = 'test'
          , sContainerId = 'test'
          , fpDestroyStub = sinon.stub();

        Hydra.module.register(sModuleId, function() {
          return {
            init: function() {
            },
            onDestroy: fpDestroyStub
          }
        });

        Hydra.module.getModule(sModuleId, sContainerId, function(oModule) {
          oMod = oModule;
          Hydra.module.stop(sModuleId, sContainerId);

          expect(fpDestroyStub.calledOnce).toBeTruthy();

          Hydra.module.remove(sModuleId, sContainerId);
          done();
        });

      });
    });


    describe('Stop all modules', function() {

      it('should call the destroy method of the two registered modules', function(done) {
        var oMod1
          , oMod2
          , sModuleId = 'test'
          , sModuleId2 = 'test2'
          , sContainerId_1 = 'test'
          , sContainerId_2 = 'test2'
          , fpDestroyStub1 = sinon.stub()
          , fpDestroyStub2 = sinon.stub();

        Hydra.module.register(sModuleId, function() {
          return {
            init: function() {
            },
            onDestroy: fpDestroyStub1
          }
        });
        Hydra.module.register(sModuleId2, function() {
          return {
            init: function() {
            },
            onDestroy: fpDestroyStub2
          }
        });

        Hydra.module.getModule(sModuleId, sContainerId_1, function(oModule1) {
          oMod1 = oModule1;
          Hydra.module.getModule(sModuleId2, sContainerId_2, function(oModule2) {
            oMod2 = oModule2;
            Hydra.module.stopAll();
            expect(fpDestroyStub1.calledOnce).toBeTruthy();
            expect(fpDestroyStub2.calledOnce).toBeTruthy();
            Hydra.module.remove(sModuleId);
            done();
          });
        });
      });
    });


    describe('Simple Extension of modules', function() {

      it('should not call the merge method until is started', function() {
        var sModuleId = 'test'
          , fpInitStub = sinon.stub()
          , fpDestroyStub = sinon.stub()
          , fpModuleCreator = function() {
          return {
            init: function() {

            },
            handleAction: function() {

            },
            destroy: function() {
              fpDestroyStub();
            }
          }
        }
          , fpModuleExtendedCreator = function() {
          return {
            init: function() {
              fpInitStub();
            },
            handleAction: function() {

            },
            destroy: function() {

            }
          }
        };

        Hydra.module.register(sModuleId, fpModuleCreator);

        Hydra.module.extend(sModuleId, fpModuleExtendedCreator);

        Hydra.module.remove(sModuleId);
      });

      it('should call the init method of the final extended module', function() {
        var sModuleId = 'test'
          , fpInitStub = sinon.stub()
          , fpDestroyStub = sinon.stub()
          , fpModuleCreator = function() {
          return {
            init: function() {

            },
            handleAction: function() {

            },
            destroy: function() {
              fpDestroyStub();
            }
          }
        }
          , fpModuleExtendedCreator = function() {
          return {
            init: function() {
              fpInitStub();
            },
            handleAction: function() {

            },
            destroy: function() {

            }
          }
        };

        Hydra.module.register(sModuleId, fpModuleCreator);

        Hydra.module.extend(sModuleId, fpModuleExtendedCreator);

        Hydra.module.start(sModuleId);

        expect(fpInitStub.calledOnce).toBeTruthy();

        Hydra.module.remove(sModuleId);
      });

      it('should call the init method of the final extended module', function() {
        var sModuleId = 'test'
          , fpInitStub = sinon.stub()
          , fpDestroyStub = sinon.stub()
          , fpModuleCreator = function() {
          return {
            init: function() {

            },
            handleAction: function() {

            },
            destroy: function() {
              fpDestroyStub();
            }
          }
        }
          , fpModuleExtendedCreator = function() {
          return {
            init: function() {
              fpInitStub();
            },
            handleAction: function() {

            },
            destroy: function() {

            }
          }
        };

        Hydra.module.register(sModuleId, fpModuleCreator);

        Hydra.module.extend(sModuleId, fpModuleExtendedCreator);

        Hydra.module.start(sModuleId);

        expect(fpDestroyStub.callCount).toEqual(0);

        Hydra.module.remove(sModuleId);
      });

    });


    describe('Complex extend', function() {

      it('should call the init method of the final extended module', function(done) {
        var sModuleId = 'test'
          , sExtendedModuleId = 'test2'
          , fpInitStub = sinon.stub()
          , oPromise
          , fpDestroyStub = sinon.stub()
          , fpModuleCreator = function() {
          return {
            init: function() {

            },
            handleAction: function() {

            },
            destroy: function() {
              fpDestroyStub();
            }
          }
        }
          , fpModuleExtendedCreator = function() {
          return {
            init: function() {
              fpInitStub();
            },
            handleAction: function() {

            },
            destroy: function() {

            }
          }
        };

        Hydra.module.register(sModuleId, fpModuleCreator);

        oPromise = Hydra.module.extend(sModuleId, sExtendedModuleId, fpModuleExtendedCreator);
        oPromise
          .then(function() {
            Hydra.module.start(sExtendedModuleId);
          })
          .then(function() {
            expect(fpInitStub.callCount).toEqual(1);

            Hydra.module.remove(sModuleId);
            Hydra.module.remove(sExtendedModuleId);
            done();
          });
      });

      it('should call the destroy method of the final extended module', function() {
        var sModuleId = 'test'
          , sExtendedModuleId = 'test2'
          , fpInitStub = sinon.stub()
          , fpDestroyStub = sinon.stub()
          , fpModuleCreator = function() {
          return {
            init: function() {

            },
            handleAction: function() {

            },
            destroy: function() {
              fpDestroyStub();
            }
          }
        }
          , fpModuleExtendedCreator = function() {
          return {
            init: function() {
              fpInitStub();
            },
            handleAction: function() {

            },
            destroy: function() {

            }
          }
        };

        Hydra.module.register(sModuleId, fpModuleCreator);

        Hydra.module.extend(sModuleId, sExtendedModuleId, fpModuleExtendedCreator);

        Hydra.module.start(sExtendedModuleId);

        expect(fpDestroyStub.callCount).toEqual(0);

        Hydra.module.remove(sModuleId);
        Hydra.module.remove(sExtendedModuleId);
      });

    });


    describe('Set global vars', function() {

      it('should check that setVars method exist in Module', function() {
        var oVars = null
          , oCallbacks = {
          fpInit: function(oData) {
            oVars = oData;
          }
        };

        Hydra.module.register("test-module", function() {
          return {
            init: oCallbacks.fpInit,
            destroy: function() {

            }
          };
        });
        sinon.spy(oCallbacks, 'fpInit');

        expect(typeof Hydra.module.setVars === 'function').toBeTruthy();

        oCallbacks.fpInit.restore();
        Hydra.module.resetVars();
        oVars = null;
        oCallbacks.fpInit = null;
      });

      it('should check that all the vars set in setVars are passed as an object when the module is started', function() {
        var oVars = null
          , oCallbacks = {
          fpInit: function(oData) {
            oVars = oData;
          }
        };

        Hydra.module.register("test-module", function() {
          return {
            init: oCallbacks.fpInit,
            destroy: function() {

            }
          };
        });
        sinon.spy(oCallbacks, 'fpInit');

        oVars = {
          'test': 'test',
          'test1': 'test1'
        };
        Hydra.module.setVars(oVars);

        Hydra.module.start('test-module');

        expect(oVars.test).toEqual("test");
        expect(oVars.test1).toEqual("test1");

        oCallbacks.fpInit.restore();
        Hydra.module.resetVars();
        oVars = null;
        oCallbacks.fpInit = null;
      });

      it('should check that if we pass a param when starting the module will move the object of vars to the last position in arguments', function() {
        var oVars = null
          , oCallbacks = {
          fpInit: function(oData) {
            oVars = oData;
          }
        }
          , oVars1 = {
          'test': 'test',
          'test1': 'test1'
        }
          , oData = {
          data: 2
        }
          , oCall;

        Hydra.module.register("test-module", function() {
          return {
            init: oCallbacks.fpInit,
            destroy: function() {

            }
          };
        });
        sinon.spy(oCallbacks, 'fpInit');


        Hydra.module.setVars(oVars1);

        Hydra.module.start('test-module', 'instance_id', oData);

        oCall = oCallbacks.fpInit.getCall(0);

        expect(oCall.args[0]).toEqual(oData);
        expect(oCall.args[1].test).toEqual(oVars1.test);
        expect(oCall.args[1].test1).toEqual(oVars1.test1);

        oCallbacks.fpInit.restore();
        Hydra.module.resetVars();
        oVars = null;
        oCallbacks.fpInit = null;
      });

    });


    describe('Get global vars', function() {

      it('should check that getVars method exist in Module', function() {
        var oVars = {
          'test': 'test',
          'test1': 'test1'
        };

        Hydra.module.setVars(oVars);

        expect(typeof Hydra.module.getVars === 'function').toBeTruthy();

        Hydra.module.resetVars();
        oVars = null;
      });

      it('should check that getVars return a copy of all the vars set using setVars', function() {
        var oVars = {
            'test': 'test',
            'test1': 'test1'
          },
          oVars1;

        Hydra.module.setVars(oVars);

        oVars1 = Hydra.module.getVars();

        expect(oVars1.test).toEqual(oVars.test);
        expect(oVars1.test1).toEqual(oVars.test1);

        Hydra.module.resetVars();
        oVars = null;
      });

    });


    describe('Global Extend for compatibility with require', function() {

      it('should check that extend method exist', function() {
        expect(typeof Hydra.extend === 'function').toBeTruthy();
      });

      it('should check that extend method must receive two params', function() {
        expect(Hydra.extend.length).toEqual(2);
      });

      it('should check when executing extend method the new object will be part of Hydra', function() {
        var oTest = {
          test: sinon.stub()
        };

        Hydra.extend("test", oTest);

        expect(Hydra.test).toBe(oTest);
      });

    });


    describe('Avoid conflict with third party namespaces', function() {

      it('should check that noConflict method exist ', function() {
        expect(typeof Hydra.noConflict === 'function').toBeTruthy();
      });

      it('should check that noConflict method must receive three params ', function() {
        expect(Hydra.noConflict.length).toEqual(3);
      });

      it('should check when executing noConflict a part of Hydra will be callable with other name and in other context ', function() {
        var bDone;

        bDone = Hydra.noConflict('module', this, 'Core');

        expect(bDone).toBeTruthy();
        expect(Hydra.module).toBe(this['Core']);
        expect(Hydra.module.register).toBe(this['Core'].register);
      });

    });


    describe('Bus Constructor', function() {

      beforeEach(function() {
        Hydra.bus.reset();
      });

      it('should check that Hydra.bus is not undefined', function() {
        expect(Hydra.bus).not.toBeUndefined();
      });

      it('should check that Hydra.bus has method subscribers', function() {
        expect(typeof Hydra.bus.subscribers === 'function').toBeTruthy();
      });

      it('should check that Hydra.bus has method subscribe', function() {
        expect(typeof Hydra.bus.subscribe === 'function').toBeTruthy();
      });

      it('should check that Hydra.bus has method unsubscribe', function() {
        expect(typeof Hydra.bus.unsubscribe === 'function').toBeTruthy();
      });

      it('should check that Hydra.bus has method publish', function() {
        expect(typeof Hydra.bus.publish === 'function').toBeTruthy();
      });

    });


    describe('Subscribe to an event', function() {

      beforeEach(function() {
        Hydra.bus.reset();
      });

      afterEach(function() {
        Hydra.bus.reset();
      });

      it('should check that subscribeTo adds a subscriber', function() {
        var oSubscriber = {};

        expect(Hydra.bus.subscribers('channel', 'item:action').length).toEqual(0);

        Hydra.bus.subscribeTo('channel', 'item:action', sinon.stub(), oSubscriber);

        expect(Hydra.bus.subscribers('channel', 'item:action').length).toEqual(1);

      });

    });


    describe('Unsubscribe from an event', function() {

      beforeEach(function() {
        Hydra.bus.reset();
      });

      afterEach(function() {
        Hydra.bus.reset();
      });

      it('should', function() {
        var oSubscriber = {};

        Hydra.bus.subscribeTo('channel', 'item:action', sinon.stub(), oSubscriber);

        expect(Hydra.bus.subscribers('channel', 'item:action').length).toEqual(1);

        Hydra.bus.unsubscribeFrom('channel', 'item:action', oSubscriber);

        expect(Hydra.bus.subscribers('channel', 'item:action').length).toEqual(0);

        oSubscriber = null;
      });

    });


    describe('Get Subscribers', function() {

      beforeEach(function() {
        Hydra.bus.reset();
      });

      it('should check that must return an empty array if there are no channel', function() {
        var oResult = Hydra.bus.subscribers('channel', 'item:actionChannel');

        expect(Object.prototype.toString.call(oResult) === '[object Array]').toBeTruthy();
        expect(oResult.length).toEqual(0);

      });

      it('should check that must return an array with an element if a subscriber is registered', function() {
        var oSubscriber = {
          events: {
            channel: {
              'item:actionChannel': function() {

              }
            }
          }
        }
          , oResult;

        Hydra.bus.subscribe(oSubscriber);

        oResult = Hydra.bus.subscribers('channel', 'item:actionChannel');

        expect(Object.prototype.toString.call(oResult) === '[object Array]').toBeTruthy();
        expect(oResult.length).toEqual(1);

        Hydra.bus.unsubscribe('channel', this['oSubscriber']);

        oSubscriber = null;
      });

    });


    describe('Subscribe to one channel', function() {

      it('should check that no subscriber must be added if Subscriber does not have events and must return false', function() {
        var oBadSubscriber = {}
          , bResult;

        Hydra.bus.reset();

        bResult = Hydra.bus.subscribe(oBadSubscriber);

        expect(bResult).toBeFalsy();
        expect(Hydra.bus.subscribers('channel', 'item:actionChannel').length).toEqual(0);

        Hydra.bus.unsubscribe(oBadSubscriber);

        oBadSubscriber = null;
      });

      it('should check that one subscriber has been added to channel and other to global if oSubscriber has events', function() {
        var oSubscriber = {
          events: {
            global: {
              'item:actionGlobal': function() {

              }
            },
            channel: {
              'item:actionChannel': function() {

              }
            }
          }
        }
          , aChannelSubscribers
          , aGlobalSubscribers
          , bResult;

        Hydra.bus.reset();


        bResult = Hydra.bus.subscribe(oSubscriber);

        aChannelSubscribers = Hydra.bus.subscribers('channel', 'item:actionChannel');
        aGlobalSubscribers = Hydra.bus.subscribers('global', 'item:actionGlobal');

        expect(bResult).toBeTruthy();
        expect(aChannelSubscribers.length).toEqual(1);
        expect(aGlobalSubscribers.length).toEqual(1);
        expect(aChannelSubscribers[0].subscriber).toBe(oSubscriber);
        expect(aGlobalSubscribers[0].subscriber).toBe(oSubscriber);
        expect(aChannelSubscribers[0].handler).toBe(oSubscriber.events.channel['item:actionChannel']);
        expect(aGlobalSubscribers[0].handler).toBe(oSubscriber.events.global['item:actionGlobal']);

        Hydra.bus.unsubscribe(oSubscriber);

        oSubscriber = null;
      });

    });

    describe('Unsubscribe from one channel', function() {

      it('should check that must return false if Subscriber does not have events', function() {
        var oBadSubscriber = {}
          , bResult;

        Hydra.bus.reset();

        bResult = Hydra.bus.unsubscribe(oBadSubscriber);

        expect(bResult).toBeFalsy();

        oBadSubscriber = null;
      });

      it('should check that must return false if Subscriber has events but has not been subscribed', function() {
        var oSubscriber = {
          events: {
            global: {
              'item:actionGlobal': function() {

              }
            },
            channel: {
              'item:actionChannel': function() {

              }
            }
          }
        }
          , bResult;

        Hydra.bus.reset();

        bResult = Hydra.bus.unsubscribe(oSubscriber);

        expect(bResult).toBeFalsy();

        oSubscriber = null;
      });

      it('should check that must return true if Subscriber has events but has been subscribed', function() {
        var oSubscriber = {
          events: {
            global: {
              'item:actionGlobal': function() {

              }
            },
            channel: {
              'item:actionChannel': function() {

              }
            }
          }
        }
          , bResult;

        Hydra.bus.reset();

        Hydra.bus.subscribe(oSubscriber);

        bResult = Hydra.bus.unsubscribe(oSubscriber);

        expect(bResult).toBeTruthy();

        oSubscriber = null;
      });

      it('should check that subscribers of global must have subscriber if unsubscribe is launched', function() {
        var oSubscriber = {
          events: {
            global: {
              'item:actionGlobal': function() {

              }
            },
            channel: {
              'item:actionChannel': function() {

              }
            }
          }
        }
          , bResult
          , aSubscribers;

        Hydra.bus.reset();

        Hydra.bus.subscribe(oSubscriber);

        bResult = Hydra.bus.unsubscribe(oSubscriber);
        aSubscribers = Hydra.bus.subscribers('global', 'test');

        expect(bResult).toBeTruthy();
        expect(aSubscribers.length).toEqual(0);

        oSubscriber = null;
      });

    });

    describe('Publish events in channel', function() {

      it('should check that must return false if there are no subscribers to the event in channel', function() {
        var clock = sinon.useFakeTimers()
          , oSubscriber = {
          events: {
            channel: {
              'item:action': sinon.stub()
            }
          }
        }
          , bResult
          , oData = {};

        Hydra.bus.reset();

        bResult = Hydra.bus.publish('channel', 'item:action', oData);
        clock.tick(30);

        expect(bResult).toBeFalsy();
        expect(oSubscriber.events.channel['item:action'].callCount).toEqual(0);

        clock.restore();
        oSubscriber = null;
      });

      it('should check that must return true if there are any subscriber to the event in channel', function() {
        var clock = sinon.useFakeTimers()
          , oSubscriber = {
          events: {
            channel: {
              'item:action': sinon.stub()
            }
          }
        }
          , bResult
          , oData = {};

        Hydra.bus.reset();

        Hydra.bus.subscribe(oSubscriber);

        bResult = Hydra.bus.publish('channel', 'item:action', oData);
        clock.tick(30);

        expect(bResult).toBeTruthy();
        expect(oSubscriber.events.channel['item:action'].callCount).toEqual(1);

        clock.restore();
        oSubscriber = null;
      });

    });

    describe('Check that addExtensionBeforeInit works', function() {

      it('should check that after using addExtensionBeforeInitTest it saves the object', function() {
        var obj = {
          test: sinon.stub()
        };

        Hydra.module.register('test', function() {
          return {
            init: function() {

            }
          };
        });
        Hydra.addExtensionBeforeInit(obj);

        Hydra.module.start('test');

        expect(obj.test.callCount).toEqual(1);
      });

    });

    describe('Check that getCopyModules works', function() {

      beforeEach(function() {
        var oModules = Hydra.getCopyModules(),
          sKey;

        for (sKey in oModules) {
          if (oModules.hasOwnProperty(sKey)) {
            Hydra.module.remove(sKey);
          }
        }
      });

      it('should check that before doing anything it will return an empty object', function() {
        var oModules = Hydra.getCopyModules();
        expect(Object.keys(oModules).length).toEqual(0);
      });

      it('should check that if we set oModules to a different object it will continue returning the same copy of oModules', function() {
        expect(Object.keys(Hydra.getCopyModules()).length).toEqual(0);
      });

      it('should check that after registering one Module it will return one', function() {
        var oModules;

        Hydra.module.register('test', function() {
          return {};
        });

        oModules = Hydra.getCopyModules();

        expect(Object.keys(oModules).length).toEqual(1);
      });

    });

    describe('Check that getCopyChannels works', function() {

      beforeEach(function() {
        Hydra.bus.reset();
      });

      it('should check that before doing anything it will return zero', function() {
        var oChannels = Hydra.getCopyChannels();
        expect(Object.keys(oChannels.global).length).toEqual(0);
      });

      it('should check that before doing anything it will return one for the channels length', function() {
        var oChannels = Hydra.getCopyChannels();

        expect(Object.keys(oChannels).length).toEqual(1);
      });

      it('should check that if we set oChannels to a different object it will continue returning the same copy of oChannels', function() {
        var oChannels = Hydra.getCopyChannels();

        expect(Object.keys(oChannels).length).toEqual(1);
      });

      it('should check that after registering one Module it will return one', function() {
        var oChannels;

        Hydra.module.register('test', function() {
          return {
            events: {
              global: {
                'test': function() {
                }
              }
            }
          };
        });
        Hydra.module.start('test');
        oChannels = Hydra.getCopyChannels();

        expect(Object.keys(oChannels.global).length).toEqual(1);
      });

      it('should check that after registering one Module in a different channel from global it will return two for the channels length and one for the event in other_channel', function() {
        var oChannels;

        Hydra.module.register('test', function() {
          return {
            events: {
              other_channel: {
                'test': function() {
                }
              }
            }
          };
        });
        Hydra.module.start('test');
        oChannels = Hydra.getCopyChannels();

        expect(Object.keys(oChannels).length).toEqual(2);
        expect(Object.keys(oChannels.other_channel).length).toEqual(1);
      });

    });

    describe('Check that you can access Hydra api', function() {

      beforeEach(function() {
        Hydra.bus.reset();
      });

      it('should check that you can access Hydra.module', function() {
        var oStub = sinon.stub();
        Hydra.module.register('test', function(bus, module) {
          return {
            init: function() {
              module.start('test2');
            }
          };
        });

        Hydra.module.register('test2', function() {
          return {
            init: oStub
          };
        });

        Hydra.module.start('test');

        expect(oStub.calledOnce).toBeTruthy();
      });

      it('should check that you can access Hydra.bus', function() {
        var oStub = sinon.stub();

        Hydra.module.register('test', function(bus, module) {
          return {
            events: {
              'channel': {
                'item:action': oStub
              }
            },
            init: function() {
              module.start('test2');
            }
          };
        });

        Hydra.module.register('test2', function(bus) {
          return {
            init: function() {
              bus.publish('channel', 'item:action');
            }
          };
        });

        Hydra.module.start('test');

        expect(oStub.calledOnce).toBeTruthy();
      });

      it('should check that you can access Hydra.errorhandler', function() {
        var oModule;

        Hydra.setErrorHandler({
          log: function() {
          },
          error: function() {
          }
        });

        Hydra.module.register('test', function(bus, module, errorHandler) {
          return {
            init: function() {
              errorHandler.log('Hei');
            }
          };
        });

        Hydra.module.test('test', function(oMod) {
          oModule = oMod;
        });

        oModule.init();

        expect(oModule.mocks.log.log.calledOnce).toBeTruthy();
      });

      it('should check that you can access to your dependencies', function() {
        var oStub = sinon.stub();
        Hydra.module.register('test', function() {
          return {
            init: oStub
          };
        });
        Hydra.module.register('test2', ['hm_test'], function(test) {
          return {
            init: function() {
              test.start();
            }
          };
        });
        Hydra.module.start('test2');

        expect(oStub.calledOnce).toBeTruthy();
      });

      it('test that you can overwrite the dependencies', function() {
        var oStub;
        Hydra.module.register('test', function() {
          return {
            init: function() {
            }
          };
        });

        Hydra.module.register('test2', ['hm_test'], function(test) {
          return {
            init: function() {
              test.start();
            }
          }
        });

        oStub = sinon.stub();
        Hydra.module.test('test2', [
          {
            start: oStub
          }
        ], function(oModule) {
          oModule.init();

          expect(oStub.calledOnce).toBeTruthy();
        });
      });

      it('test that you can overwrite the window object', function() {
        var global;
        Hydra.module.register('_test3', ['$global'], function(window) {
          return {
            init: function() {
              window.document.getElementById('test');
            }
          };
        });

        global = {
          document: {
            getElementById: sinon.stub()
          }
        };
        Hydra.module.test('_test3', [global], function(oModule) {
          oModule.init();

          expect(global.document.getElementById.calledOnce).toBeTruthy();
        });
      });

      it('test that you can overwrite the document object', function() {
        var document;
        Hydra.module.register('_test4', ['$doc'], function(doc) {
          return {
            init: function() {
              doc.getElementById('test');
            }
          };
        });
        document = {
          getElementById: sinon.stub()
        };
        Hydra.module.test('_test4', [document], function(oModule) {
          oModule.init();

          expect(document.getElementById.calledOnce).toBeTruthy();
        });
      });

      it('test should check that if you do not supply anything it should be able to mock all the dependencies', function() {
        var registerStub, $bus, $module, $log, $api;
        Hydra.module.register('_test5', function($bus, $module, $log, $api) {
          return {
            init: function() {
              $bus.publish('channel', 'test');
              $module.register('_test6', [], function() {
                return {
                  init: function() {
                  }
                };
              }).start();
              $log.log('test7');
              $api.module.register('_test7', [], function() {
                return {
                  init: function() {
                  }
                };
              });
            }
          };
        });

        registerStub = sinon.stub();
        $bus = {
          publish: sinon.stub()
        };
        $module = {
          register: function() {
            registerStub();
            return this;
          },
          start: sinon.stub()
        };
        $log = {
          log: sinon.stub()
        };
        $api = {
          module: {
            register: sinon.stub()
          }
        };
        Hydra.module.test('_test5', [$bus, $module, $log, $api], function(oModule) {
          oModule.init();

          expect($bus.publish.calledOnce).toBeTruthy();
          expect(registerStub.calledOnce).toBeTruthy();
          expect($module.start.calledOnce).toBeTruthy();
          expect($log.log.calledOnce).toBeTruthy();
          expect($api.module.register.calledOnce).toBeTruthy();
        });
      });

      describe('Pre-process publish data', function() {

        beforeEach(function() {
          Hydra.bus.preprocessorPublishData(function(oData) {
            return oData;
          });
        });

        afterEach(function() {
          Hydra.bus.preprocessorPublishData(function(oData) {
            return oData;
          });
        });

        describe('Normal usage', function() {
          it('should check that the changes in the original object are persistent', function() {
            var oObj = {
              data: 'original'
            };
            Hydra.bus.subscribeTo('channel', 'test', function(oData) {
              oData.data = 'changed'
            }, {});
            Hydra.bus.publish('channel', 'test', oObj);
            expect(oObj.data).toEqual('changed');
          });
        });

        describe('Cloning usage', function() {
          it('should check that the changes in the original object are not persistent', function() {
            var oObj = {
              data: 'original'
            };
            Hydra.bus.subscribeTo('channel', 'test', function(oData) {
              oData.data = 'changed'
            }, {});

            Hydra.bus.preprocessorPublishData(function(oData, clone) {
              return clone(oData);
            });

            Hydra.bus.publish('channel', 'test', oObj);
            expect(oObj.data).toEqual('original');
          });
        });
      });

      describe('Extending and events', function() {

        describe('Basic module with events:Grandpa', function() {

          beforeEach(function() {
            Hydra.bus.reset();
            Hydra.module.reset();
          });

          it('should call the test callback when the event is triggered', function() {
            var oModBase = {
              oConfig: null,
              init: function() {
                this.oConfig = {soy: 'base-module'};
              },
              events: {
                channel: {
                  test: sinon.stub()
                }
              }
            };
            Hydra.module.register('base-module', function() {
              return oModBase;
            });
            Hydra.module.start('base-module');
            Hydra.bus.publish('channel', 'test');
            expect(oModBase.events.channel.test.callCount).toEqual(1);
          });

        });

        describe('Extended module with events:Father', function() {

          beforeEach(function() {
            Hydra.bus.reset();
            Hydra.module.reset();
          });

          it('should call the test callback when the event is triggered but not the parent', function() {
            var oModBase, oModFather;
            oModBase = {
              oConfig: null,
              init: function() {
                this.oConfig = {soy: 'base-module'};
              },
              events: {
                channel: {
                  test: sinon.stub()
                }
              }
            };
            oModFather = {
              events: {
                channel: {
                  test: sinon.stub()
                }
              }
            };
            Hydra.module.register('base-module', function() {
              return oModBase;
            });
            Hydra.module.extend('base-module', 'father-module', function() {
              return oModFather;
            });
            Hydra.module.start('father-module');
            Hydra.bus.publish('channel', 'test');
            expect(oModBase.events.channel.test.callCount).toEqual(0);
            expect(oModFather.events.channel.test.callCount).toEqual(1);
          });

        });

        describe('Extended module with events: Son', function() {

          beforeEach(function() {
            Hydra.bus.reset();
            Hydra.module.reset();
          });

          it('should check that the test callback is called when the event is triggered', function() {
            var oModBase, oModFather, oModSon;
            oModBase = {
              oConfig: null,
              init: function() {
                this.oConfig = {soy: 'base-module'};
              },
              events: {
                channel: {
                  test: sinon.stub()
                }
              }
            };
            oModFather = {
              events: {
                channel: {
                  test: sinon.stub()
                }
              }
            };
            oModSon = {};
            Hydra.module.register('base-module', function() {
              return oModBase;
            });
            Hydra.module.extend('base-module', 'father-module', function() {
              return oModFather;
            });
            Hydra.module.extend('father-module', 'son-module', function() {
              return oModSon;
            });
            Hydra.module.start('son-module');
            Hydra.bus.publish('channel', 'test');
            expect(oModBase.events.channel.test.callCount).toEqual(0);
            expect(oModFather.events.channel.test.callCount).toEqual(1);
          });

        });

      });

      describe('Add mapping', function() {

        describe('Sync mapping', function() {
          it('should check that add mapping add the mapping to the object', function(done) {
            var oStub = sinon.stub(),
              dependencies;
            Hydra.module.register('test_mapping', ['$$_bind'], function(bind) {
              return {
                init: function() {
                  bind();
                }
              }
            });
            var oPromise = Hydra.resolveDependencies('test_mapping');
            oPromise
              .then(function() {
                dependencies = [].slice.call(arguments);
                expect(typeof dependencies[1] === 'object').toBeTruthy();
                Hydra.addMapping('$$_', {
                  bind: oStub
                });
              })
              .then(function() {
                var oPromise = Hydra.resolveDependencies('test_mapping');
                oPromise
                  .then(function() {
                    dependencies = [].slice.call(arguments);
                    expect(typeof dependencies[1] === 'function').toBeTruthy();
                    done();
                  });
              });

          });
        });

        describe('Async mapping', function() {
          it('should check that add mapping returns the correct mapping', function(done) {
            var dependencies,
              oStub = sinon.stub();

            Hydra.module.register('test_async_mapping', ['ex_binding'], function(binding) {
              return {
                init: function() {
                  binding();
                }
              }
            });

            var oPromise = Hydra.resolveDependencies('test_async_mapping');
            oPromise
              .then(function() {
              dependencies = [].slice.call(arguments);
            })
            .then(function () {
              expect(typeof dependencies[1] === 'object').toBeTruthy();
              Hydra.addAsyncMapping('ex_', {
                binding: oStub
              }, function(sDependency) {
                var oResolution = this[sDependency],
                  oPromise = new Hydra.Promise(function(resolve, reject) {
                    setTimeout(function() {
                      resolve(oResolution);
                    }, 500);
                  });
                if (!oResolution) {
                  return false;
                }
                return oPromise;
              });
            })
            .then(function () {
              var oPromise = Hydra.resolveDependencies('test_async_mapping');
              oPromise.then(function() {
                dependencies = [].slice.call(arguments);
                expect(typeof dependencies[1] === 'function').toBeTruthy();
                done();
              });
            });


          });
        });
      });
    });
    describe('Module extension and dependencies', function() {
      it('should access the parent module using this.uber', function() {
        var oBase, oParent, oSon, oStub, oSonStub;
        oStub = sinon.stub();
        oSonStub = sinon.stub();
        oBase = {
          init: function() {
            this.other();
          },
          other: function() {
            oStub();
          }
        };
        oParent = {
          init: function() {
            this.uber.init();
          }
        };
        oSon = {
          other: function() {
            oSonStub()
          }
        };
        Hydra.module.register('base', function() {
          return oBase;
        });
        Hydra.module.extend('base', 'parent', function() {
          return oParent;
        });
        Hydra.module.extend('parent', 'son', function() {
          return oSon;
        });
        Hydra.module.start('son');
        expect(oStub.callCount).toEqual(0);
        expect(oSonStub.callCount).toEqual(1);
      });
      it('should check that the extended module can access their dependencies', function() {
        var oBody;
        Hydra.module.register('base', function() {
          return {};
        });
        Hydra.module.extend('base', 'parent', ['$$_bus'], function(oBus) {
          return {
            init: function() {
              oBus.publish('channel', 'test:event');
            }
          };
        });
        Hydra.module.extend('parent', 'son', ['$$_doc'], function(doc) {
          return {
            init: function() {
              oBody = doc.getElementsByTagName('body')[0];
              this.uber.init();
            }
          };
        });
        Hydra.module.test('son', function(oModule) {
          oModule.mocks.doc.getElementsByTagName.returns([document.body]);
          oModule.init();
          expect(oBody).toEqual(document.body);
          expect(oModule.mocks.doc.getElementsByTagName.callCount).toEqual(1);
        });
      });
      it('should check that the extended module can access their dependencies', function() {
        var oBody;
        Hydra.module.register('base', ['$$_bus'], function(oBus) {
          return {
            init: function() {
              oBus.publish('channel', 'test:event');
            }
          }
        });
        Hydra.module.extend('base', 'parent', ['$$_doc'], function(doc) {
          return {
            init: function() {
              oBody = doc.getElementsByTagName('body')[0];
              this.uber.init();
            }
          };
        });
        Hydra.module.test('parent', function(oModule) {
          oModule.mocks.doc.getElementsByTagName.returns([document.body]);
          oModule.init();
          expect(oBody).toEqual(document.body);
          expect(oModule.mocks.doc.getElementsByTagName.callCount).toEqual(1);
        });
      });
    });
    describe('Module extension and access parent methods', function() {
      it('should access their methods from parent methods', function() {
        Hydra.setDebug(true);
        var oBase, oParent, oSon, oStub, oStub2, oSonStub, oSonStub2;
        oStub = sinon.stub();
        oStub2 = sinon.stub();
        oSonStub = sinon.stub();
        oSonStub2 = sinon.stub();
        oBase = {
          other: function() {
            this.rasca();
            oStub();
          },
          rasca: function() {
            oStub2();
          }
        };
        oParent = {
          init: function() {
            this.uber.other();
          }
        };
        oSon = {
          other: oSonStub,
          rasca: function() {
            oSonStub2();
          }
        };
        Hydra.module.register('base', function() {
          return oBase;
        });
        Hydra.module.extend('base', 'parent', function() {
          return oParent;
        });
        Hydra.module.extend('parent', 'son', function() {
          return oSon;
        });
        Hydra.module.start('son');
        expect(oSonStub.callCount).toEqual(0);
        expect(oStub.callCount).toEqual(1);
        expect(oStub2.callCount).toEqual(0);
        expect(oSonStub2.callCount).toEqual(1);
        Hydra.setDebug(false);
      });
    });
  });

  describe('Extension dependencies bug', function() {
    it('should check that the extended module should get and access to a new dependencies array each time:first execution', function() {
      Hydra.module.register('base-module', function() {
        return {
          init: function() {
          }
        };
      });
      Hydra.module.extend('base-module', 'extended-module', function(oBus) {
        return {
          init: function() {
            oBus.publish('channel', 'test:action');
          }
        };
      });

      Hydra.module.test('extended-module', function(oMod) {
        oMod.init();
        expect(oMod.mocks.bus.publish.callCount).toEqual(1);
      });
    });
    it('should check that the extended module should get and access to a new dependencies array each time:second execution', function() {
      Hydra.module.register('base-module', function() {
        return {
          init: function() {
          }
        };
      });
      Hydra.module.extend('base-module', 'extended-module', function(oBus) {
        return {
          init: function() {
            oBus.publish('channel', 'test:action');
          }
        };
      });

      Hydra.module.test('extended-module', function(oMod) {
        oMod.init();
        Hydra.module.test('extended-module', function(oMod) {
          oMod.init();
          expect(oMod.mocks.bus.publish.callCount).toEqual(1);
        });
      });
    });
  });
  describe('Test Deferred api', function() {
    it('should check that Deferred is called properly with one promise', function() {
      var oDeferred = new Hydra.Deferred(),
        oPromise1 = new Hydra.Promise(),
        oStubAllPromisesResolved = sinon.stub(),
        oStubOnePromiseRejected = sinon.stub(),
        oPromiseResolved = sinon.stub(),
        oPromiseRejected = sinon.stub();

      oPromise1.then(oPromiseResolved, oPromiseRejected);

      oDeferred.add(oPromise1);
      oDeferred.then(oStubAllPromisesResolved, oStubOnePromiseRejected);
      oPromise1.resolve('Promise1ResultValue');

      expect(oPromiseResolved.callCount).toEqual(1);
      expect(oStubAllPromisesResolved.callCount).toEqual(1);
    });
    it('should check that Deferred is called properly with two promises but one is rejected', function() {
      var oDeferred = new Hydra.Deferred(),
        oPromise1 = new Hydra.Promise(),
        oPromise2 = new Hydra.Promise(),
        oStubAllPromisesResolved = sinon.stub(),
        oStubOnePromiseRejected = sinon.stub(),
        oPromiseResolved = sinon.stub(),
        oPromiseRejected = sinon.stub(),
        oPromise2Resolved = sinon.stub(),
        oPromise2Rejected = sinon.stub();

      oPromise1.then(oPromiseResolved, oPromiseRejected);
      oPromise2.then(oPromise2Resolved, oPromise2Rejected);

      oDeferred.add(oPromise1).add(oPromise2);
      oDeferred.then(oStubAllPromisesResolved, oStubOnePromiseRejected);
      oPromise1.resolve('Promise1ResultValue');
      oPromise2.reject('Promise2ResultValue');

      expect(oPromiseResolved.callCount).toEqual(1);
      expect(oPromise2Resolved.callCount).toEqual(0);
      expect(oPromise2Rejected.callCount).toEqual(1);
      expect(oStubAllPromisesResolved.callCount).toEqual(0);
      expect(oStubOnePromiseRejected.callCount).toEqual(1);
    });
    it('should check that Deferred is called properly with two promises but one is rejected', function() {
      var oDeferred = new Hydra.Deferred(),
        oPromise1 = new Hydra.Promise(),
        oPromise2 = new Hydra.Promise(),
        oStubAllPromisesResolved = sinon.stub(),
        oStubOnePromiseRejected = sinon.stub(),
        oPromiseResolved = sinon.stub(),
        oPromiseRejected = sinon.stub(),
        oPromise2Resolved = sinon.stub(),
        oPromise2Rejected = sinon.stub();

      oPromise1.then(oPromiseResolved, oPromiseRejected);
      oPromise2.then(oPromise2Resolved, oPromise2Rejected);

      oDeferred.add(oPromise1).add(oPromise2);
      oDeferred.then(oStubAllPromisesResolved, oStubOnePromiseRejected);
      oPromise1.resolve('Promise1ResultValue');
      oPromise2.resolve('Promise2ResultValue');

      expect(oPromiseResolved.callCount).toEqual(1);
      expect(oPromiseRejected.callCount).toEqual(0);
      expect(oPromise2Resolved.callCount).toEqual(1);
      expect(oPromise2Rejected.callCount).toEqual(0);
      expect(oStubAllPromisesResolved.callCount).toEqual(1);
      expect(oStubOnePromiseRejected.callCount).toEqual(0);
    });

    it('should check that Deferred is called properly with two promises but one is rejected', function() {
      var oDeferred = new Hydra.Deferred(),
        oPromise1 = new Hydra.Promise(),
        oPromise2 = new Hydra.Promise(),
        oStubAllPromisesResolved = sinon.stub(),
        oStubOnePromiseRejected = sinon.stub(),
        oPromiseResolved = sinon.stub(),
        oPromiseRejected = sinon.stub(),
        oPromise2Resolved = sinon.stub(),
        oPromise2Rejected = sinon.stub();

      oPromise1.then(oPromiseResolved, oPromiseRejected);
      oPromise2.then(oPromise2Resolved, oPromise2Rejected);

      oDeferred.add(oPromise1).add(oPromise2);
      oDeferred.then(oStubAllPromisesResolved, oStubOnePromiseRejected);
      oPromise1.reject('Promise1ResultValue');
      oPromise2.reject('Promise2ResultValue');

      expect(oPromiseResolved.callCount).toEqual(0);
      expect(oPromiseRejected.callCount).toEqual(1);
      expect(oPromise2Resolved.callCount).toEqual(0);
      expect(oPromise2Rejected.callCount).toEqual(1);
      expect(oStubAllPromisesResolved.callCount).toEqual(0);
      expect(oStubOnePromiseRejected.callCount).toEqual(1);
    });
  });

  describe('The module should not call more than one time to the init if the same instance exist', function() {
    var stubInit;
    beforeEach(function() {
      Hydra.bus.reset();
      Hydra.module.reset();
      stubInit = sinon.stub();
      Hydra.module.register('base-module', function() {
        return {
          init: stubInit
        };
      });
    });

    it('should check that the first time we start a module without an instance name it calls the init method', function() {
      Hydra.setDebug(true);
      Hydra.module.start('base-module');

      expect(stubInit.callCount).toEqual(1);
      Hydra.setDebug(false);
    });
    it('should check that the second time we start a module without an instance name then the init method is called two times', function() {
      Hydra.setDebug(true);
      Hydra.module.start('base-module');
      Hydra.module.start('base-module');

      expect(stubInit.callCount).toEqual(2);
      Hydra.setDebug(false);
    });
    it('should check that the second time we start a module without an instance name then the init method is called two times', function() {
      Hydra.setDebug(true);
      Hydra.module.start('base-module');
      Hydra.module.start('base-module', 'hi');

      expect(stubInit.callCount).toEqual(2);
      Hydra.setDebug(false);
    });
    it('should check that the second time we start a module without an instance name, but with the same instance name, then the init method is called two times but Hydra.stop is called one time', function() {
      Hydra.setDebug(true);
      sinon.stub(Hydra.module, 'stop');
      Hydra.module.start('base-module', 'hi');
      Hydra.module.start('base-module', 'hi');

      expect(stubInit.callCount).toEqual(2);
      expect(Hydra.module.stop.callCount).toEqual(1);
      Hydra.module.stop.restore();
      Hydra.setDebug(false);
    });
  });
}());
