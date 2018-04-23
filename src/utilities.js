export const getDisplayName =
  component => component.displayName || component.name || 'Component';

export const noop = /* istanbul ignore next */ () => {};

export const fakeChangeEvent = (name, value) => ({
  preventDefault: noop,
  target: { name, value },
});

export const shallowCompare = (nextObj, currObj) => {
  const keysNext = Object.keys(nextObj);
  const keysCurr = Object.keys(currObj);
  return (keysNext.length !== keysCurr.length) ||
    keysNext.some(next => (nextObj[next] !== currObj[next]));
};
