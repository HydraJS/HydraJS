import {copyArray} from './Utils';
import {getPromise, getThenCallbacks} from './Promise';

/**
 * Sugar function to create a new Deferred object.
 * When expects Promise objects to be added to the Deferred object [Promise1, Promise2,...PromiseN]
 * If one of the arguments is not a Promise When assume that we want to complete the Deferred object
 * @private
 */
export default function When() {
  var aArgs, nArg, nLenArgs, oPromise, oArg, oData, aSolutions;
  aArgs = copyArray(arguments);
  nLenArgs = aArgs.length;
  oPromise = getPromise();
  oData = {
    nLenPromisesResolved: 0
  };
  aSolutions = [];

  if (aArgs.length === 0) {
    oPromise.resolve();
  } else {
    for (nArg = 0; nArg < nLenArgs; nArg++) {
      oArg = aArgs[nArg];
      oArg.then(getThenCallbacks(nArg, 'resolve', oData, nLenArgs, oPromise, aSolutions),
        getThenCallbacks(nArg, 'reject', oData, nLenArgs, oPromise, aSolutions));
    }
  }

  return oPromise;
}
