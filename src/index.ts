import { useEffect, useState } from 'react';

export type Selector<T> = (state: State) => T;
export type State = Record<string, any>;
export type Listener = (state: State) => void;

const shallowEqual = (objA: any, objB: any) => {
  if (Object.is(objA, objB)) return true;

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i++) {
    if ( !Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !Object.is(objA[keysA[i]], objB[keysA[i]]) ) {
      return false;
    }
  }

  return true;
}

export class Store {
  private listeners: Set<any> = new Set();
  constructor(private state: State = {}){}

  subscribe(listener?: Listener) {
    this.listeners.add(listener);
  }

  unsubscribe(listener: Listener) {
    this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  setState(newState: Partial<State>) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  getState(): State {
    return this.state;
  }
}

export const createHook = (store: Store) => {
  return <T>(selector: Selector<T>) => {
    const [state, setState] = useState(() => selector(store.getState()));
    
    useEffect(() => {
      const listener = (newState: State) => {
        const newSelectedState = selector(newState);
        if (!shallowEqual(newSelectedState, state)) {
          setState(newSelectedState);
        }
      };
      
      store.subscribe(listener);
      return () => {
        store.unsubscribe(listener);
      };
    }, [selector, state]);
    
    return state;
  };
}

