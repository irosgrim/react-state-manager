A simple state manager using the observer pattern

`npm install @irosgrim/react-state-manager`

or

`yarn add @irosgrim/react-state-manager`


[Check the live example](https://irosgrim.github.io/state-management/)

[Source of the example](https://github.com/irosgrim/state-management)

## How to use it with React.js?

Define your default state and the store. 
You can create multiple:

```ts
// store.ts
import { Store, createHook } from "@irosgrim/react-state-manager"

// define your app state type
export type AppState = {
  profile: { name: string } | null;
  greet: (name: string) => string;
  login: () => void;
  logout: () => void;
  currentState: () => AppState,
};

// initialize the store
const globalStore = new Store();

// create your default state and actions
const appState: AppState = {
  profile: null,
  greet: (name: string) => `Hello ${name}`,
  login: async () => {
    const req = await fetch("https://jsonplaceholder.typicode.com/users");
    if (!req.ok) {
        throw new Error("Can't get profile");
    }
    const data: any[] = await req.json();

    globalStore.setState({
      profile: {
        name: data[Math.floor(Math.random() * data.length)].name,
      }
    })
  },
  logout: () => {
    globalStore.setState({ profile: null });
  },
  // if you want to use the current state in order to create the next state
  currentState: () => globalStore.getState() as AppState,
};

// assign your default state
globalStore.setState(appState);

export const useGlobalStore = createHook(globalStore);
```
Use the store in your components:

```tsx
// in your components
import { useState, useEffect } from "react";
import { useGlobalStore, AppState } from "./store";

export const Profile = () => {
  // take only what you need
  const { profile, login, logout, currentState } = useGlobalStore<Pick<AppState, "profile" | "login" | "logout" | "currentState">>((state) => (
    {
      profile: state.profile,
      login: state.login,
      logout: state.logout,
      currentState: state.currentState
    }
  ));

  useEffect(() => {
    // calling login state action
    login();
  },[])

  return (
    <div>
      {
        profile && `Welcome, ${profile.name}`
      }
      <button onClick={() => {
        if (profile) {
          logout();
        } else {
          login();
        }
      }}>
        {profile ? "Logout" : "Login"}
      </button>
    </div>
  );
};
```