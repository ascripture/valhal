export function nestedPathValue<T>(
  obj: any,
  paths: IterableIterator<string>
): T | undefined {
  const current = paths.next();

  if (current?.done) {
    return obj as T;
  }

  if (Object.prototype.hasOwnProperty.call(obj, current?.value)) {
    return nestedPathValue(obj[current?.value], paths);
  }

  return undefined;
}
