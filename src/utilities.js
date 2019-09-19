import invariant from 'invariant';

export const getDisplayName = component => component.displayName || component.name || 'Component';

export const noop = /* istanbul ignore next */ () => {};

export const fakeChangeEvent = (name, value) => ({
  preventDefault: noop,
  target: { name, value },
});

export const shallowCompare = (nextObj, currObj) => {
  const keysNext = Object.keys(nextObj);
  const keysCurr = Object.keys(currObj);
  return (keysNext.length !== keysCurr.length)
    || keysNext.some(next => (nextObj[next] !== currObj[next]));
};

export const invariantTypesMatch = (name, oldVal, newVal) => {
  let changingType = false;
  if (oldVal === null || newVal === null || typeof oldVal === 'undefined' || typeof newVal === 'undefined') { return; }
  if (typeof oldVal === 'object') {
    if (oldVal && newVal) {
      const c = 'constructor'; // Shorthand for constructor
      changingType = (oldVal[c] && newVal[c] && oldVal[c] === newVal[c])
        ? false
        : `Cannot convert between two object types: ${oldVal.constructor} !== ${newVal.constructor}`;
      if (changingType === false) {
        // Compare child values
        if (oldVal.constructor === ({}).constructor) {
          Object.keys(oldVal)
            .forEach(key => invariantTypesMatch(name.concat(key), oldVal[key], newVal[key]));
        } else if (Array.isArray(oldVal)) {
          oldVal.forEach((_, i) => invariantTypesMatch(name.concat(i), oldVal[i], newVal[i]));
        }
      }
    }
  } else {
    changingType = (typeof oldVal !== typeof newVal)
      ? `Cannot convert ${name.join('.')} from ${typeof oldVal} to ${typeof newVal}`
      : false;
  }
  invariant(!changingType, changingType);
};
