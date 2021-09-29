/**
 * Sets a value of nested key string descriptor inside a Object.
 * It changes the passed object.
 * Ex:
 *    let obj = {a: {b:{c:'initial'}}}
 *    setNestedKey(obj, ['a', 'b', 'c'], 'changed-value')
 *    assert(obj === {a: {b:{c:'changed-value'}}})
 *
 * @param {[Object]} obj   Object to set the nested key
 * @param {[Array]} path  An array to describe the path(Ex: ['a', 'b', 'c'])
 * @param {[Object]} value Any value
 */
export function setNestedKey<T>(obj: any, path: string[], value: T): void {
  if (path.length === 1) {
    obj[path[0]] = value;
    return;
  } else if (!obj[path[0]]) {
    obj[path[0]] = {};
  }
  return setNestedKey(obj[path[0]], path.slice(1), value);
}
