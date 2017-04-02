import {clone} from './Utils';
let oModules = {};

export function getCopyModules() {
  return clone(oModules);
}
export function getModules() {
  return oModules;
}
export function resetModules() {
  oModules = {};
}
