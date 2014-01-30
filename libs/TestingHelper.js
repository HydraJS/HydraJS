if (typeof require !== 'undefined') {
  var Hydra = require('../src/Hydra');
}
(function ()
{
  'use strict';
  var oMockLibrary = null,
  oAdapter = null,
  isNodeEnvironment,
  toString = Object.prototype.toString,
  isTypeOf = function ( oObj, sConstructor )
  {
    return toString.call( oObj ) === '[object ' + sConstructor + ']';
  },
  convertArrayMappingToObject = function ( aKeys, aValues )
  {
    var nIndexMap,
    nLenMap = aKeys.length,
    sKey,
    oValue,
    oNew = {};
    for ( nIndexMap = 0; nIndexMap < nLenMap; nIndexMap++ )
    {
      sKey = aKeys[nIndexMap];
      oValue = aValues[nIndexMap];
      oNew[sKey] = oValue;
    }
    return oNew;
  },
  helper = function ( Hydra )
  {
    var oTestFramework = null,
    fpConvertObjectToDependenciesArray = function ( oDeps, aMapping )
    {
      var aCloneMapping, sMap, aDeps = [];

      if ( !oDeps || !isTypeOf( aMapping, 'Array' ) )
      {
        return aDeps;
      }

      aCloneMapping = aMapping.concat();

      while ( !!( sMap = aCloneMapping.shift() ) )
      {
        aDeps.push( oDeps[sMap] );
      }
      return aDeps;
    },
    fpMockDependencies = function ( aDependencies )
    {

      var oDependency,
      nIndexDependency,
      nLenDependencies = aDependencies.length,
      aMocks = [];

      if ( oAdapter != null && oMockLibrary !== null )
      {
        for ( nIndexDependency = 0; nIndexDependency < nLenDependencies; nIndexDependency++ )
        {
          oDependency = aDependencies[nIndexDependency];
          aMocks.push( oAdapter.getAllFunctionsStubbed( oDependency ) );
        }
      }

      return aMocks;
    };

    /**
     * Sets the framework object that will be used to allow test and getModule methods in module
     * @static
     * @deprecated
     * @member Hydra
     * @param {Object} oTest
     */
    Hydra.setTestFramework = function ( oTest )
    {
      oTestFramework = oTest;
    };

    Hydra.extend( 'testing', {
      /**
       * Sets the framework object that will be used to allow test and getModule methods in module
       * @static
       * @member Hydra
       * @param {Object} oTest
       */
      setTestFramework: function ( oTestLibrary )
      {
        oTestFramework = oTestLibrary;
      },
      setMockLibrary: function ( oMockLib, oAdapt )
      {
        if ( !oMockLib )
        {
          throw new Error( 'The mock library is not valid!' );
        }
        if ( typeof oAdapt.getAllFunctionsStubbed !== 'function' )
        {
          throw new Error( 'Adapter should implement a getAllFunctionsStubbed method.' );
        }
        oMockLibrary = oMockLib;
        oAdapter = oAdapt;
      }
    } );

    Hydra.extend( 'module', {
      /**
       * getModule returns the module with the id
       * It must work only when it's executed in oTestFramework environment
       * @member Hydra.module
       * @param {String} sModuleId
       * @param {String} sIdInstance
       * @param {Function} fpCallback
       * @return {Module}
       */
      getModule: function ( sModuleId, sIdInstance, fpCallback )
      {
        var self = this;
        if ( oTestFramework )
        {
          Hydra.module.getInstance( sModuleId, undefined, function ( oInstance ) {
            fpCallback( self.setInstance( sModuleId, sIdInstance, oInstance ) );
          } );
        }
        return null;
      },
      /**
       * test is a method that will return the module without wrapping their methods.
       * It's called test because it was created to be able to test the modules with unit testing.
       * It must work only when it's executed in oTestFramework environment
       * You can mock your dependencies overwriting them.
       * @member Hydra.module
       * @param {String} sModuleId
       * @param {*} oDeps - Could be a function that gets the module as single argument or an array of dependencies to mock
       * @param {Function} Callback to get the module after being mocked all its dependencies.
       */
      test: function ( sModuleId, oDeps, fpCallback )
      {
        var oModule, oModules, oDependencies, aMocked, aMapping;
        if ( oTestFramework )
        {

          try
          {
            Hydra.setDebug( true );
            oModules = Hydra.getCopyModules();
            if( !oModules[sModuleId]){
              throw new Error('The module ' + sModuleId + ' is not registered in the system');
            }
            oDependencies = Hydra.resolveDependencies( sModuleId );
            oDependencies.then( function ( mapping )
            {
              aMapping = mapping;

              if ( isTypeOf( oDeps, 'Object' ) )
              {
                aMocked = fpConvertObjectToDependenciesArray( oDeps, mapping );
              }
              else if ( isTypeOf( oDeps, 'Array' ) )
              {
                aMocked = oDeps;
              }
              else
              {
                aMocked = fpMockDependencies( [].slice.call(arguments, 1) );
              }


              Hydra.module.getInstance( sModuleId, aMocked, function ( oModule ) {

                oModule.mocks = convertArrayMappingToObject( mapping, aMocked );
                if ( typeof oDeps === 'function' )
                {
                  oDeps( oModule );
                }else{
                  fpCallback(oModule);
                }
              });
            } );
          }
          finally
          {
            oModule = null;
            Hydra.setDebug( false );
          }
        }
        return null;
      }
    } );
    return Hydra;
  };
  isNodeEnvironment = typeof exports === 'object' && typeof module === 'object' && typeof module.exports === 'object' && typeof require === 'function';

  if (isNodeEnvironment) {
    module.exports = helper( Hydra );
  }else if ( typeof define !== 'undefined' ) {
    define( 'hydrajs-testing-helper', ['hydra'], helper );
  }else{
    helper( Hydra );
  }
}());