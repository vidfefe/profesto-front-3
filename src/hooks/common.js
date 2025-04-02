import React from 'react';

export const useToggle = initialState => {
  const [value, setValue] = React.useState(initialState);

  const toggle = React.useCallback(
    nextState => {
      if (typeof nextState !== 'undefined') {
        setValue(!!nextState);
        return;
      }

      setValue(prevState => !prevState);
    },
    [setValue],
  );

  return [value, toggle];
};


export function useTimeout(callback, delay) {
  const savedCallback = React.useRef();

  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  React.useEffect(() => {
    function onTimeout() {
      savedCallback.current();
    }

    if (delay !== null) {
      const id = setTimeout(onTimeout, delay);
      return () => clearTimeout(id);
    }

    return undefined;
  }, [delay]);
}


export const useDebouncedEffect = (effect, delay, deps) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const callback = React.useCallback(effect, deps);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      callback();
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [callback, delay]);
}

// Hook
export const useDebounce = (callback, delay) => {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = React.useState(callback);

  React.useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(callback);
      }, delay);

      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [callback, delay] // Only re-call effect if value or delay changes
  );

  return debouncedValue;
}

export const useScrollTop = () => {
  const [scrollTop, setScrollTop] = React.useState(0);
  const onScroll = (event) => setScrollTop(event.target.scrollTop);
  return [scrollTop, { onScroll }];
};