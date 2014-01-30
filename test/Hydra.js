(function () {
  'use strict';
  var oErrorHandler = null
  , FakeClass = function () {
  }
  , sTimeout = setTimeout;

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

  Hydra.setTestFramework( true );

  describe('Hydra.js', function () {

    beforeEach(function () {
      Hydra.module.reset();
    });

    afterEach(function () {
      Hydra.module.reset();
    });
    describe('Fix extension module bug on lazy pattern single module', function () {
      beforeEach(function () {
        Hydra.module.register("single-module", function () {
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
      });
      it('should return true if module is executed once', function () {
        Hydra.module.test('single-module', undefined, function ( oModule ) {
          oModule.init();
          expect( oModule.isFirstExecution ).toEqual( true );
        });
      });

      it('should return false if module is executed twice', function () {

        Hydra.module.test('single-module', undefined, function ( oModule ) {
          oModule.init();
          oModule.init();
          expect( oModule.isFirstExecution ).toEqual( false );
        });

      });

    });


    describe('Fix extension module bug on lazy pattern extended module', function () {
      beforeEach(function () {
        Hydra.module.register("single-module", function () {
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
        Hydra.module.extend("single-module", "extended-module", function () {
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
      });
      it('should return true if module is executed once', function () {
        Hydra.module.test('extended-module', undefined, function ( oModule ) {
          oModule.init();
          expect( oModule.isFirstExecution ).toEqual( true );
        });

      });

      it('should return false if module is executed twice', function () {
        Hydra.module.test('extended-module', undefined, function ( oModule ) {
          oModule.init();
          oModule.init();
          expect( oModule.isFirstExecution ).toEqual( false );
        });
      });

    });


    describe('On request Hydra', function () {

      it('should return an object', function () {
        expect( Hydra ).not.toBeUndefined();
      });

      it('should contain a property called errorHandler', function () {
        expect( Hydra.errorHandler ).not.toBeUndefined();
        expect( typeof Hydra.errorHandler === 'function' ).toBeTruthy();
      });

      it('should contain a property called setErrorHandler', function () {
        expect( Hydra.setErrorHandler ).not.toBeUndefined();
        expect( typeof Hydra.setErrorHandler === 'function' ).toBeTruthy();
      });

      it('should contain a property called module', function () {
        expect( Hydra.module ).not.toBeUndefined();
        expect( typeof Hydra.module === 'object' ).toBeTruthy();
        expect( Hydra.module.type ).toEqual( "Module" );
      });

    });


    describe('setErrorHandler', function () {

      it('should change the ErrorHandler class to a Fake Class', function () {
        var oResult;

        oErrorHandler = Hydra.errorHandler();
        Hydra.setErrorHandler(FakeClass);

        oResult = Hydra.errorHandler();

        expect( oResult.type ).toEqual( "Fake" );
        Hydra.setErrorHandler(oErrorHandler);
      });

      it('should return an instance of Fake Class', function () {
        var oInstance
        , oClass;

        oErrorHandler = Hydra.errorHandler();
        Hydra.setErrorHandler(FakeClass);

        oClass = Hydra.errorHandler();
        oInstance = new (oClass);

        expect( oInstance instanceof oClass ).toBeTruthy();

        Hydra.setErrorHandler(oErrorHandler);
      });

    });


    describe('Register a module', function () {

      it('should throw an error if we try to create a module without register if the ErrorHandler Class', function () {
        var sModuleId = 'test';

        expect( function () {
          Hydra.module.test(sModuleId, undefined, function () {
            Hydra.module.remove(sModuleId);
          });
        } ).toThrow();
      });

      it('should return a module if we create a module registering it', function () {
        var sModuleId = 'test'
        , fpModuleCreator = function () {
          return {
            init: function () {

            },
            handleAction: function () {

            },
            destroy: function () {

            }
          }
        };

        Hydra.module.register(sModuleId, fpModuleCreator);
        Hydra.module.test(sModuleId, undefined, function (oModule) {
          expect( typeof oModule === 'object' ).toBeTruthy();
          Hydra.module.remove(sModuleId);
        });


      });

    });


    describe('Remove a module', function () {
      beforeEach( function () {
        sinon.spy( Hydra.module, '_delete' );
      });

      afterEach( function () {
        Hydra.module._delete.restore();
      });

      it('should not call the delete native if the module is not registered before remove it', function () {
        var sModuleId = 'test'
        , sContainerId = 'test';
        Hydra.module.remove(sModuleId, sContainerId);

        expect( Hydra.module._delete.callCount ).toEqual( 0 );
      });

      it('should call the delete native one time if the module is registered before remove it', function () {
        var sModuleId = 'test'
        , sContainerId = 'test'
        , fpModuleCreator = function () {
          return {
            init: function () {

            },
            handleAction: function () {

            },
            destroy: function () {

            }
          }
        };

        Hydra.module.register(sModuleId, fpModuleCreator);

        Hydra.module.remove(sModuleId, sContainerId);

        expect( Hydra.module._delete.callCount ).toEqual( 1 );

      });

    });


    describe('Start module/s', function () {

      it('should call the init method of the module if the module is registered before start', function () {
        var sModuleId = 'test'
        , sModuleId2 = 'test2'
        , fpInitStub = sinon.stub()
        , fpInitStub2 = sinon.stub()
        , fpModuleCreator = function () {
          return {
            init: function () {
              fpInitStub();
            },
            handleAction: function () {

            },
            destroy: function () {

            }
          }
        }
        , fpModuleCreator2 = function () {
          return {
            init: function () {
              fpInitStub2();
            },
            handleAction: function () {

            },
            destroy: function () {

            }
          }
        };
        Hydra.module.register(sModuleId, fpModuleCreator);
        Hydra.module.register(sModuleId2, fpModuleCreator2);

        Hydra.module.start(sModuleId);

        expect( fpInitStub.calledOnce ).toBeTruthy();

        Hydra.module.remove(sModuleId);
      });

      it('should check that all the init methods in the modules are called when using multi-module start', function () {
        var sModuleId = 'test'
        , sModuleId2 = 'test2'
        , fpInitStub = sinon.stub()
        , fpInitStub2 = sinon.stub()
        , fpModuleCreator = function () {
          return {
            init: function () {
              fpInitStub();
            },
            handleAction: function () {

            },
            destroy: function () {

            }
          }
        }
        , fpModuleCreator2 = function () {
          return {
            init: function () {
              fpInitStub2();
            },
            handleAction: function () {

            },
            destroy: function () {

            }
          }
        };
        Hydra.module.register(sModuleId, fpModuleCreator);
        Hydra.module.register(sModuleId2, fpModuleCreator2);

        Hydra.module.start([sModuleId, sModuleId2]);

        expect( fpInitStub.calledOnce ).toBeTruthy();
        expect( fpInitStub2.calledOnce ).toBeTruthy();

        Hydra.module.remove(sModuleId);
      });

    });

    describe( 'Reset modules', function () {

      it( 'should check that there are no modules after executing reset', function () {
        var oModules;
        Hydra.module.register( 'test', function (){
          return {};
        });
        oModules = Hydra.getCopyModules();
        expect( Object.keys( oModules ).length ).toEqual( 1 );

        Hydra.module.reset();

        oModules = Hydra.getCopyModules();
        expect( Object.keys( oModules ).length ).toEqual( 0 );
      });
    });

    describe('Decorate a module', function () {
      it('should call the ErrorHandler.log if the base module has not been registered and return null', function () {
        var sModuleId = 'test'
        , oPromise
        , sModuleDecorator = 'test-decorator';

        sinon.stub(Hydra.errorHandler(), 'log');

        oPromise = Hydra.module.decorate(sModuleId, sModuleDecorator, function () {
          return {
            init: function () {
            },
            destroy: function () {
            }
          };
        });
        oPromise.then(function ( oModule ) {
          expect( Hydra.errorHandler().log.calledOnce ).toBeTruthy();
          expect( oModule ).toBeNull();
          Hydra.errorHandler().log.restore();
        });
      });

      it('should return a FakeModule instance if the base module has been registered', function () {
        var sModuleId = 'test'
        , oPromise
        , sModuleDecorator = 'test-decorator'
        , fpInitBaseModule = sinon.stub()
        , fpOnDestroyBaseModule = sinon.stub()
        , fpInitDecoratedModule = sinon.stub()
        , fpOnDestroyDecoratedModule = sinon.stub();

        Hydra.module.register(sModuleId, function () {
          return {
            init: fpInitBaseModule,
            onDestroy: fpOnDestroyBaseModule
          };
        });
        oPromise = Hydra.module.decorate(sModuleId, sModuleDecorator, [], function (oModule) {
          return {
            init: function () {
              fpInitDecoratedModule();
              oModule.init();
            },
            onDestroy: function () {
              fpOnDestroyDecoratedModule();
              oModule.onDestroy();
            }
          };
        });
        oPromise.then(function ( oModule ){
          Hydra.module.start(sModuleDecorator);

          expect( fpInitBaseModule.calledOnce ).toBeTruthy();
          expect( fpInitDecoratedModule.calledOnce ).toBeTruthy();

          Hydra.module.stop(sModuleDecorator);

          expect( fpOnDestroyBaseModule.calledOnce ).toBeTruthy();
          expect( fpOnDestroyDecoratedModule.calledOnce ).toBeTruthy();

          expect( typeof oModule === 'object' ).toBeTruthy();
          expect( typeof oModule.start !== 'undefined' ).toBeTruthy();
          expect( typeof oModule.stop !== 'undefined' ).toBeTruthy();
          expect( typeof oModule.extend !==  'undefined' ).toBeTruthy();
        });

      });
    });

    describe('Start all modules', function () {

      it('should call the init method of the two registered modules', function () {
        var sModuleId = 'test'
        , sModuleId2 = 'test2'
        , fpInitStub = sinon.stub()
        , fpModuleCreator = function () {
          return {
            init: function () {
              fpInitStub();
            },
            handleAction: function () {

            },
            destroy: function () {

            }
          }
        };
        Hydra.module.register(sModuleId, fpModuleCreator);
        Hydra.module.register(sModuleId2, fpModuleCreator);

        Hydra.module.startAll();

        expect( fpInitStub.calledTwice ).toBeTruthy();

        Hydra.module.remove(sModuleId);
      });

    });


    describe('Stop module/s', function () {

      it('should not call the destroy method if the module is registered but not started', function () {
        var sModuleId = 'test'
        , sContainerId = 'test'
        , fpDestroyStub;

        Hydra.module.register(sModuleId, function () {
          return {
            init: function () {
            }
          }
        });
        Hydra.module.getModule(sModuleId, sContainerId, function ( oModule ) {
          fpDestroyStub = sinon.stub(oModule.instances[sContainerId], 'destroy');

          Hydra.module.remove(sModuleId, sContainerId);

          Hydra.module.stop(sModuleId, sContainerId);

          expect( fpDestroyStub.callCount ).toEqual( 0 );

          Hydra.module.remove(sModuleId, sContainerId);
        });
      });

      it('should call the destroy method one time if the module is registered and started', function () {
        var sModuleId = 'test'
        , sContainerId = 'test'
        , fpDestroyStub;

        Hydra.module.register(sModuleId, function () {
          return {
            init: function () {
            }
          }
        });
        Hydra.module.getModule(sModuleId, sContainerId, function ( oModule ) {
          fpDestroyStub = sinon.stub(oModule.instances[sContainerId], 'destroy');

          Hydra.module.stop(sModuleId, sContainerId);

          expect( fpDestroyStub.calledOnce ).toBeTruthy();

          Hydra.module.remove(sModuleId, sContainerId);
        });
      });
    });


    describe('Stop all modules', function () {

      it('should call the destroy method of the two registered modules', function () {
        var sModuleId = 'test'
        , sContainerId_1 = 'test'
        , sContainerId_2 = 'test2'
        , fpDestroyStub1
        , fpDestroyStub2;

        Hydra.module.register(sModuleId, function () {
          return {
            init: function () {
            }
          }
        });
        Hydra.module.getModule(sModuleId, sContainerId_1, function ( oModule1 ) {
          fpDestroyStub1 = sinon.stub(oModule1.instances[sContainerId_1], 'destroy');

          Hydra.module.getModule(sModuleId, sContainerId_2, function ( oModule2 ) {
            fpDestroyStub2 = sinon.stub(oModule2.instances[sContainerId_2], 'destroy');
          });
          Hydra.module.stopAll();

          expect( fpDestroyStub1.calledOnce ).toBeTruthy();
          expect( fpDestroyStub2.calledOnce ).toBeTruthy();
          Hydra.module.remove(sModuleId);
        });
      });
    });


    describe('Simple Extension of modules', function () {

      it('should not call the merge method until is started', function () {
        var sModuleId = 'test'
        , fpInitStub = sinon.stub()
        , fpDestroyStub = sinon.stub()
        , fpModuleCreator = function () {
          return {
            init: function () {

            },
            handleAction: function () {

            },
            destroy: function () {
              fpDestroyStub();
            }
          }
        }
        , fpModuleExtendedCreator = function () {
          return {
            init: function () {
              fpInitStub();
            },
            handleAction: function () {

            },
            destroy: function () {

            }
          }
        };

        Hydra.module.register(sModuleId, fpModuleCreator);

        Hydra.module.extend(sModuleId, fpModuleExtendedCreator);

        Hydra.module.remove(sModuleId);
      });

      it('should call the init method of the final extended module', function () {
        var sModuleId = 'test'
        , fpInitStub = sinon.stub()
        , fpDestroyStub = sinon.stub()
        , fpModuleCreator = function () {
          return {
            init: function () {

            },
            handleAction: function () {

            },
            destroy: function () {
              fpDestroyStub();
            }
          }
        }
        , fpModuleExtendedCreator = function () {
          return {
            init: function () {
              fpInitStub();
            },
            handleAction: function () {

            },
            destroy: function () {

            }
          }
        };

        Hydra.module.register(sModuleId, fpModuleCreator);

        Hydra.module.extend(sModuleId, fpModuleExtendedCreator);

        Hydra.module.start(sModuleId);

        expect( fpInitStub.calledOnce ).toBeTruthy();

        Hydra.module.remove(sModuleId);
      });

      it('should call the init method of the final extended module', function () {
        var sModuleId = 'test'
        , fpInitStub = sinon.stub()
        , fpDestroyStub = sinon.stub()
        , fpModuleCreator = function () {
          return {
            init: function () {

            },
            handleAction: function () {

            },
            destroy: function () {
              fpDestroyStub();
            }
          }
        }
        , fpModuleExtendedCreator = function () {
          return {
            init: function () {
              fpInitStub();
            },
            handleAction: function () {

            },
            destroy: function () {

            }
          }
        };

        Hydra.module.register(sModuleId, fpModuleCreator);

        Hydra.module.extend(sModuleId, fpModuleExtendedCreator);

        Hydra.module.start(sModuleId);

        expect( fpDestroyStub.callCount ).toEqual( 0 );

        Hydra.module.remove(sModuleId);
      });

    });


    describe('Complex extend', function () {

      it('should call the init method of the final extended module', function () {
        var sModuleId = 'test'
        , sExtendedModuleId = 'test2'
        , fpInitStub = sinon.stub()
        , oPromise
        , fpDestroyStub = sinon.stub()
        , fpModuleCreator = function () {
          return {
            init: function () {

            },
            handleAction: function () {

            },
            destroy: function () {
              fpDestroyStub();
            }
          }
        }
        , fpModuleExtendedCreator = function () {
          return {
            init: function () {
              fpInitStub();
            },
            handleAction: function () {

            },
            destroy: function () {

            }
          }
        };

        Hydra.module.register(sModuleId, fpModuleCreator);

        oPromise = Hydra.module.extend(sModuleId, sExtendedModuleId, fpModuleExtendedCreator);

        oPromise.then(function (  ) {
          Hydra.module.start(sExtendedModuleId);

          expect( fpInitStub.callCount ).toEqual( 1 );

          Hydra.module.remove(sModuleId);
          Hydra.module.remove(sExtendedModuleId);
        });
      });

      it('should call the destroy method of the final extended module', function () {
        var sModuleId = 'test'
        , sExtendedModuleId = 'test2'
        , fpInitStub = sinon.stub()
        , fpDestroyStub = sinon.stub()
        , fpModuleCreator = function () {
          return {
            init: function () {

            },
            handleAction: function () {

            },
            destroy: function () {
              fpDestroyStub();
            }
          }
        }
        , fpModuleExtendedCreator = function () {
          return {
            init: function () {
              fpInitStub();
            },
            handleAction: function () {

            },
            destroy: function () {

            }
          }
        };

        Hydra.module.register(sModuleId, fpModuleCreator);

        Hydra.module.extend(sModuleId, sExtendedModuleId, fpModuleExtendedCreator);

        Hydra.module.start(sExtendedModuleId);

        expect( fpDestroyStub.callCount ).toEqual( 0 );

        Hydra.module.remove(sModuleId);
        Hydra.module.remove(sExtendedModuleId);
      });

    });


    describe('Set global vars', function () {

      it('should check that setVars method exist in Module', function () {
        var oVars = null
        , oCallbacks = {
          fpInit: function (oData) {
            oVars = oData;
          }
        };

        Hydra.module.register("test-module", function () {
          return {
            init: oCallbacks.fpInit,
            destroy: function () {

            }
          };
        });
        sinon.spy(oCallbacks, 'fpInit');

        expect( typeof Hydra.module.setVars === 'function' ).toBeTruthy();

        oCallbacks.fpInit.restore();
        Hydra.module.resetVars();
        oVars = null;
        oCallbacks.fpInit = null;
      });

      it('should check that all the vars set in setVars are passed as an object when the module is started', function () {
        var oVars = null
        , oCallbacks = {
          fpInit: function (oData) {
            oVars = oData;
          }
        };

        Hydra.module.register("test-module", function () {
          return {
            init: oCallbacks.fpInit,
            destroy: function () {

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

        expect( oVars.test ).toEqual( "test" );
        expect( oVars.test1 ).toEqual( "test1" );

        oCallbacks.fpInit.restore();
        Hydra.module.resetVars();
        oVars = null;
        oCallbacks.fpInit = null;
      });

      it('should check that if we pass a param when starting the module will move the object of vars to the last position in arguments', function () {
        var oVars = null
        , oCallbacks = {
          fpInit: function (oData) {
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

        Hydra.module.register("test-module", function () {
          return {
            init: oCallbacks.fpInit,
            destroy: function () {

            }
          };
        });
        sinon.spy(oCallbacks, 'fpInit');


        Hydra.module.setVars(oVars1);

        Hydra.module.start('test-module', 'instance_id', oData);

        oCall = oCallbacks.fpInit.getCall(0);

        expect( oCall.args[0] ).toEqual( oData );
        expect( oCall.args[1].test ).toEqual( oVars1.test );
        expect( oCall.args[1].test1 ).toEqual( oVars1.test1 );

        oCallbacks.fpInit.restore();
        Hydra.module.resetVars();
        oVars = null;
        oCallbacks.fpInit = null;
      });

    });


    describe('Get global vars', function () {

      it('should check that getVars method exist in Module', function () {
        var oVars = {
          'test': 'test',
          'test1': 'test1'
        };

        Hydra.module.setVars(oVars);

        expect( typeof Hydra.module.getVars === 'function' ).toBeTruthy();

        Hydra.module.resetVars();
        oVars = null;
      });

      it('should check that getVars return a copy of all the vars set using setVars', function () {
        var oVars = {
          'test': 'test',
          'test1': 'test1'
        },
        oVars1;

        Hydra.module.setVars(oVars);

        oVars1 = Hydra.module.getVars();

        expect( oVars1.test ).toEqual( oVars.test );
        expect( oVars1.test1 ).toEqual( oVars.test1 );

        Hydra.module.resetVars();
        oVars = null;
      });

    });


    describe('Global Extend for compatibility with require', function () {

      it('should check that extend method exist', function () {
        expect( typeof Hydra.extend === 'function' ).toBeTruthy();
      });

      it('should check that extend method must receive two params', function () {
        expect( Hydra.extend.length ).toEqual( 2 );
      });

      it('should check when executing extend method the new object will be part of Hydra', function () {
        var oTest = {
          test: sinon.stub()
        };

        Hydra.extend("test", oTest);

        expect( Hydra.test ).toBe( oTest );
      });

    });


    describe('Avoid conflict with third party namespaces', function () {

      it('should check that noConflict method exist ', function () {
        expect( typeof Hydra.noConflict === 'function' ).toBeTruthy();
      });

      it('should check that noConflict method must receive three params ', function () {
        expect( Hydra.noConflict.length ).toEqual( 3 );
      });

      it('should check when executing noConflict a part of Hydra will be callable with other name and in other context ', function () {
        var bDone;

        bDone = Hydra.noConflict('module', this, 'Core');

        expect( bDone ).toBeTruthy();
        expect( Hydra.module ).toBe( this['Core'] );
        expect( Hydra.module.register ).toBe( this['Core'].register );
      });

    });


    describe('Bus Constructor', function () {

      beforeEach( function () {
        Hydra.bus.reset();
      });

      it('should check that Hydra.bus is not undefined', function () {
        expect( Hydra.bus ).not.toBeUndefined();
      });

      it('should check that Hydra.bus has method subscribers', function () {
        expect( typeof Hydra.bus.subscribers === 'function' ).toBeTruthy();
      });

      it('should check that Hydra.bus has method subscribe', function () {
        expect( typeof Hydra.bus.subscribe === 'function' ).toBeTruthy();
      });

      it('should check that Hydra.bus has method unsubscribe', function () {
        expect( typeof Hydra.bus.unsubscribe === 'function' ).toBeTruthy();
      });

      it('should check that Hydra.bus has method publish', function () {
        expect( typeof Hydra.bus.publish === 'function' ).toBeTruthy();
      });

    });


    describe('Subscribe to an event', function () {

      beforeEach( function () {
        Hydra.bus.reset();
      });

      afterEach( function () {
        Hydra.bus.reset();
      });

      it('should check that subscribeTo adds a subscriber', function () {
        var oSubscriber = {};

        expect( Hydra.bus.subscribers('channel', 'item:action').length ).toEqual( 0 );

        Hydra.bus.subscribeTo('channel', 'item:action', sinon.stub(), oSubscriber);

        expect( Hydra.bus.subscribers('channel', 'item:action').length ).toEqual( 1 );

      });

    });


    describe('Unsubscribe from an event', function () {

      beforeEach( function () {
        Hydra.bus.reset();
      });

      afterEach( function () {
        Hydra.bus.reset();
      });

      it('should', function () {
        var oSubscriber = {};

        Hydra.bus.subscribeTo('channel', 'item:action', sinon.stub(), oSubscriber);

        expect( Hydra.bus.subscribers('channel', 'item:action').length ).toEqual( 1 );

        Hydra.bus.unsubscribeFrom('channel', 'item:action', oSubscriber);

        expect( Hydra.bus.subscribers('channel', 'item:action').length ).toEqual( 0 );

        oSubscriber = null;
      });

    });


    describe('Get Subscribers', function () {

      beforeEach( function () {
        Hydra.bus.reset();
      });

      it('should check that must return an empty array if there are no channel', function () {
        var oResult = Hydra.bus.subscribers('channel', 'item:actionChannel');

        expect( Object.prototype.toString.call( oResult ) === '[object Array]').toBeTruthy();
        expect( oResult.length ).toEqual( 0 );

      });

      it('should check that must return an array with an element if a subscriber is registered', function () {
        var oSubscriber = {
          events: {
            channel: {
              'item:actionChannel': function () {

              }
            }
          }
        }
        , oResult;

        Hydra.bus.subscribe(oSubscriber);

        oResult = Hydra.bus.subscribers('channel', 'item:actionChannel');

        expect( Object.prototype.toString.call( oResult ) === '[object Array]').toBeTruthy();
        expect( oResult.length ).toEqual( 1 );

        Hydra.bus.unsubscribe('channel', this['oSubscriber']);

        oSubscriber = null;
      });

    });


    describe('Subscribe to one channel', function () {

      it('should check that no subscriber must be added if Subscriber does not have events and must return false', function () {
        var oBadSubscriber = {}
        , bResult;

        Hydra.bus.reset();

        bResult = Hydra.bus.subscribe(oBadSubscriber);

        expect( bResult ).toBeFalsy();
        expect( Hydra.bus.subscribers('channel', 'item:actionChannel').length ).toEqual( 0 );

        Hydra.bus.unsubscribe(oBadSubscriber);

        oBadSubscriber = null;
      });

      it('should check that one subscriber has been added to channel and other to global if oSubscriber has events', function () {
        var oSubscriber = {
          events: {
            global: {
              'item:actionGlobal': function () {

              }
            },
            channel: {
              'item:actionChannel': function () {

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

        expect( bResult ).toBeTruthy();
        expect( aChannelSubscribers.length ).toEqual( 1 );
        expect( aGlobalSubscribers.length ).toEqual( 1 );
        expect( aChannelSubscribers[0].subscriber ).toBe( oSubscriber );
        expect( aGlobalSubscribers[0].subscriber ).toBe( oSubscriber );
        expect( aChannelSubscribers[0].handler ).toBe( oSubscriber.events.channel['item:actionChannel'] );
        expect( aGlobalSubscribers[0].handler ).toBe( oSubscriber.events.global['item:actionGlobal'] );

        Hydra.bus.unsubscribe(oSubscriber);

        oSubscriber = null;
      });

    });

    describe('Unsubscribe from one channel', function () {

      it('should check that must return false if Subscriber does not have events', function () {
        var oBadSubscriber = {}
        , bResult;

        Hydra.bus.reset();

        bResult = Hydra.bus.unsubscribe(oBadSubscriber);

        expect( bResult ).toBeFalsy();

        oBadSubscriber = null;
      });

      it('should check that must return false if Subscriber has events but has not been subscribed', function () {
        var oSubscriber = {
          events: {
            global: {
              'item:actionGlobal': function () {

              }
            },
            channel: {
              'item:actionChannel': function () {

              }
            }
          }
        }
        , bResult;

        Hydra.bus.reset();

        bResult = Hydra.bus.unsubscribe(oSubscriber);

        expect( bResult ).toBeFalsy();

        oSubscriber = null;
      });

      it('should check that must return true if Subscriber has events but has been subscribed', function () {
        var oSubscriber = {
          events: {
            global: {
              'item:actionGlobal': function () {

              }
            },
            channel: {
              'item:actionChannel': function () {

              }
            }
          }
        }
        , bResult;

        Hydra.bus.reset();

        Hydra.bus.subscribe(oSubscriber);

        bResult = Hydra.bus.unsubscribe(oSubscriber);

        expect( bResult ).toBeTruthy();

        oSubscriber = null;
      });

      it('should check that subscribers of global must have subscriber if unsubscribe is launched', function () {
        var oSubscriber = {
          events: {
            global: {
              'item:actionGlobal': function () {

              }
            },
            channel: {
              'item:actionChannel': function () {

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

        expect( bResult ).toBeTruthy();
        expect( aSubscribers.length ).toEqual( 0 );

        oSubscriber = null;
      });

    });

    describe('Publish events in channel', function () {

      it('should check that must return false if there are no subscribers to the event in channel', function () {
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

        expect( bResult ).toBeFalsy();
        expect( oSubscriber.events.channel['item:action'].callCount ).toEqual( 0 );

        clock.restore();
        oSubscriber = null;
      });

      it('should check that must return true if there are any subscriber to the event in channel', function () {
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

        expect( bResult ).toBeTruthy();
        expect( oSubscriber.events.channel['item:action'].callCount ).toEqual( 1 );

        clock.restore();
        oSubscriber = null;
      });

    });

    describe('Check that addExtensionBeforeInit works', function () {

      it('should check that Hydra.module.oModifyInit is an empty object', function () {
        expect( getLengthObject(Hydra.module.oModifyInit) ).toEqual( 0 );
      });

      it('should check that after using addExtensionBeforeInitTest it saves the object', function () {
        var stub = sinon.stub();

        Hydra.addExtensionBeforeInit({ test: stub});

        expect( getLengthObject(Hydra.module.oModifyInit) ).toEqual( 1 );
        expect( Hydra.module.oModifyInit.test ).toBe( stub );
      });

    });

    describe('Check that getCopyModules works', function () {

      beforeEach(function () {
        var oModules = Hydra.getCopyModules(),
        sKey;

        for (sKey in oModules) {
          if (oModules.hasOwnProperty(sKey)) {
            Hydra.module.remove(sKey);
          }
        }
      });

      it('should check that before doing anything it will return an empty object', function () {
        var oModules = Hydra.getCopyModules();
        expect( Object.keys(oModules).length ).toEqual( 0 );
      });

      it('should check that if we set oModules to a different object it will continue returning the same copy of oModules', function () {
        expect( Object.keys(Hydra.getCopyModules()).length ).toEqual( 0 );
      });

      it('should check that after registering one Module it will return one', function () {
        var oModules;

        Hydra.module.register('test', function () {
          return {};
        });

        oModules = Hydra.getCopyModules();

        expect( Object.keys(oModules).length ).toEqual( 1 );
      });

    });

    describe('Check that getCopyChannels works', function () {

      beforeEach(function () {
        Hydra.bus.reset();
      });

      it('should check that before doing anything it will return zero', function () {
        var oChannels = Hydra.getCopyChannels();
        expect( Object.keys(oChannels.global).length ).toEqual( 0 );
      });

      it('should check that before doing anything it will return one for the channels length', function () {
        var oChannels = Hydra.getCopyChannels();

        expect( Object.keys(oChannels).length ).toEqual( 1 );
      });

      it('should check that if we set oChannels to a different object it will continue returning the same copy of oChannels', function () {
        var oChannels = Hydra.getCopyChannels();

        expect( Object.keys(oChannels).length ).toEqual( 1 );
      });

      it('should check that after registering one Module it will return one', function () {
        var oChannels;

        Hydra.module.register('test', function () {
          return {
            events: {
              global: {
                'test': function () {
                }
              }
            }
          };
        });
        Hydra.module.start('test');
        oChannels = Hydra.getCopyChannels();

        expect( Object.keys(oChannels.global).length ).toEqual( 1 );
      });

      it('should check that after registering one Module in a different channel from global it will return two for the channels length and one for the event in other_channel', function () {
        var oChannels;

        Hydra.module.register('test', function () {
          return {
            events: {
              other_channel: {
                'test': function () {
                }
              }
            }
          };
        });
        Hydra.module.start('test');
        oChannels = Hydra.getCopyChannels();

        expect( Object.keys(oChannels).length ).toEqual( 2 );
        expect( Object.keys(oChannels.other_channel).length ).toEqual( 1 );
      });

    });

    describe('Check that you can access Hydra api', function () {

      beforeEach(function () {
        Hydra.bus.reset();
      });

      it('should check that you can access Hydra.module', function () {
        var oStub = sinon.stub();
        Hydra.module.register('test', function (bus, module) {
          return {
            init: function () {
              module.start('test2');
            }
          };
        });

        Hydra.module.register('test2', function () {
          return {
            init: oStub
          };
        });

        Hydra.module.start('test');

        expect( oStub.calledOnce ).toBeTruthy();
      });

      it('should check that you can access Hydra.bus', function () {
        var oStub = sinon.stub();

        Hydra.module.register('test', function (bus, module) {
          return {
            events: {
              'channel': {
                'item:action': oStub
              }
            },
            init: function () {
              module.start('test2');
            }
          };
        });

        Hydra.module.register('test2', function (bus) {
          return {
            init: function () {
              bus.publish('channel', 'item:action');
            }
          };
        });

        Hydra.module.start('test');

        expect( oStub.calledOnce ).toBeTruthy();
      });

      it('should check that you can access Hydra.errorhandler', function () {
        var oStub = sinon.stub();

        Hydra.setErrorHandler({
          log: oStub,
          error: function () {
            console.log.apply(console, arguments);
          }
        });
        Hydra.module.register('test', function (bus, module) {
          return {
            init: function () {
              module.start('test2');
            }
          };
        });

        Hydra.module.register('test2', function (bus, module, errorhandler) {
          return {
            init: function () {
              errorhandler.log('Hei');
            }
          };
        });

        Hydra.module.start('test');

        expect( oStub.calledOnce ).toBeTruthy();
      });

      it('should check that you can access to your dependencies', function () {
        var oStub = sinon.stub();
        Hydra.module.register('test', function () {
          return {
            init: oStub
          };
        });
        Hydra.module.register('test2', ['hm_test'], function (test) {
          return {
            init: function () {
              test.start();
            }
          };
        });
        Hydra.module.start('test2');

        expect( oStub.calledOnce ).toBeTruthy();
      });

      it('test that you can overwrite the dependencies', function () {
        var oStub;
        Hydra.module.register('test', function () {
          return {
            init: function () {
            }
          };
        });

        Hydra.module.register('test2', ['hm_test'], function (test) {
          return {
            init: function () {
              test.start();
            }
          }
        });

        oStub = sinon.stub();
        Hydra.module.test('test2', [
          {
            start: oStub
          }
        ], function ( oModule ) {
          oModule.init();

          expect( oStub.calledOnce ).toBeTruthy();
        });
      });

      it('test that you can overwrite the window object', function () {
        var global;
        Hydra.module.register('_test3', ['$global'], function (window) {
          return {
            init: function () {
              window.document.getElementById('test');
            }
          };
        });

        global = {
          document: {
            getElementById: sinon.stub()
          }
        };
        Hydra.module.test('_test3', [global], function ( oModule ) {
          oModule.init();

          expect( global.document.getElementById.calledOnce ).toBeTruthy();
        });
      });

      it('test that you can overwrite the document object', function () {
        var document;
        Hydra.module.register('_test4', ['$doc'], function (doc) {
          return {
            init: function () {
              doc.getElementById('test');
            }
          };
        });
        document = {
          getElementById: sinon.stub()
        };
        Hydra.module.test('_test4', [document], function ( oModule ) {
          oModule.init();

          expect( document.getElementById.calledOnce ).toBeTruthy();
        });
      });

      it('test should check that if you do not supply anything it should be able to mock all the dependencies', function () {
        var registerStub, $bus, $module, $log, $api;
        Hydra.module.register('_test5', function ($bus, $module, $log, $api) {
          return {
            init: function () {
              $bus.publish('channel', 'test');
              $module.register('_test6', [],function () {
                return {
                  init: function () {
                  }
                };
              }).start();
              $log.log('test7');
              $api.module.register('_test7', [], function () {
                return {
                  init: function () {
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
          register: function () {
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
        Hydra.module.test('_test5', [$bus, $module, $log, $api], function ( oModule ) {
          oModule.init();

          expect( $bus.publish.calledOnce ).toBeTruthy();
          expect( registerStub.calledOnce ).toBeTruthy();
          expect( $module.start.calledOnce ).toBeTruthy();
          expect( $log.log.calledOnce ).toBeTruthy();
          expect( $api.module.register.calledOnce ).toBeTruthy();
        });
      });

      describe('Add mapping', function() {

        describe('Sync mapping', function () {
          it('should check that add mapping add the mapping to the object', function () {
            var flag = false,
            oStub = sinon.stub(),
            dependencies;
            Hydra.module.register( 'test_mapping', ['$$_bind'], function ( bind ) {
              return {
                init: function () {
                  bind();
                }
              }
            } );
            waitsFor( function() {
              var oPromise = Hydra.resolveDependencies( 'test_mapping' );
              oPromise.then( function () {
                dependencies = [].slice.call( arguments );
                flag = true;
              } );
              return flag;
            }, 'It should resolve the dependencies before 1 sec', 1000 );

            runs(function () {
              expect( typeof dependencies[1] === 'object' ).toBeTruthy();
              Hydra.addMapping( '$$_', {
                bind: oStub
              });
              flag = false;
            });

            waitsFor( function () {
              var oPromise = Hydra.resolveDependencies( 'test_mapping' );
              oPromise.then( function () {
                dependencies = [].slice.call( arguments );
                flag = true;
              } );
              return flag;
            }, 'It should resolve the dependencies before 1 sec', 1000);

            runs(function () {
              expect( typeof dependencies[1] === 'function' ).toBeTruthy();
            });
          });
        });

        describe('Async mapping', function () {
          it('should check that add mapping returns the correct mapping', function () {
            var dependencies,
            oStub = sinon.stub(),
            flag = false;

            runs( function () {
              Hydra.module.register( 'test_async_mapping', ['ex_binding'], function ( binding ) {
                return {
                  init: function () {
                    binding();
                  }
                }
              } );
            });

            waitsFor( function () {
              var oPromise = Hydra.resolveDependencies( 'test_async_mapping' );
              oPromise.then( function () {
                dependencies = [].slice.call( arguments );
                flag = true;
              } );
              return flag;
            }, 'It should resolve the dependencies before 1 sec', 1000);

            runs( function () {
              expect( typeof dependencies[1] === 'object' ).toBeTruthy();
              Hydra.addAsyncMapping( 'ex_', {
                binding: oStub
              }, function ( sDependency ) {
                var oResolution = this[sDependency],
                oPromise = new Hydra.Promise();
                if(!oResolution){
                  return false;
                }
                sTimeout(function () {
                  oPromise.resolve( oResolution );
                  flag = true;
                }, 500);
                return oPromise;
              } );
              flag = false;
            });

            waitsFor( function () {
              var oPromise = Hydra.resolveDependencies( 'test_async_mapping' );
              oPromise.then( function () {
                dependencies = [].slice.call( arguments );
                flag = true;
              } );
              return flag;
            }, 'It should resolve the dependencies before 1 sec', 1000);

            runs( function () {
              expect( typeof dependencies[1] === 'function' ).toBeTruthy();
            });
          });
        });
      });
    });
  });

}());