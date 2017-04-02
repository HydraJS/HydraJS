import { getRoot } from './Utils';
import { createMapping, getMappingMaps } from './DependencyInjector';
let namespace = getRoot();

export function setNamespace(_namespace) {
  namespace = _namespace;
  createMapping(getMappingMaps(), 'ns_', namespace);
}

export function getNamespace() {
  return namespace;
}
