import { useEffect, useState } from "react";

export type Selector<T> = (state: State) => T;
export type State = Record<string, any>;
export type Listener = (state: State) => void;

/**
 * Used for shallow comparison of old state to new state
 * @param objA old state of an object
 * @param objB new state of an object
 * @returns boolean
 */
export const shallowEqual = (objA: any, objB: any) => {
  if (Object.is(objA, objB)) return true;

  if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
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

/**
 * 
 * @param store Store instance
 * @param compareFn function used to do comparison between old state and new state. Default is shallowCompare
 * @returns react hook
 */
export const createHook = (store: Store, compareFn: (objA: any, objB: any) => boolean = shallowEqual) => {
  return <T>(selector: Selector<T>) => {
    const [state, setState] = useState!(() => selector(store.getState()));
    useEffect!(() => {
      const listener = (newState: State) => {
        const newSelectedState = selector(newState);
        if (!compareFn(newSelectedState, state)) {
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
