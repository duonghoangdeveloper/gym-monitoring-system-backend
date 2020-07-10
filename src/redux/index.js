const { createStore } = require('redux');

const INITIAL_STATE = {
  screens: [],
  sockets: [],
};

export const TYPES = {
  ADD_SCREEN: 'ADD_SCREEN',
  ADD_SOCKET: 'ADD_SOCKET',
  REMOVE_SCREEN: 'REMOVE_SCREEN',
  REMOVE_SOCKET: 'REMOVE_SOCKET',
  UPDATE_SNAPSHOT: 'UPDATE_SNAPSHOT',
};

const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case TYPES.ADD_SCREEN:
      return {
        ...state,
        screens: [...state.screens, action.payload.screen],
      };
    case TYPES.REMOVE_SCREEN:
      return {
        ...state,
        screens: state.screens.filter(
          screen => screen.key !== action.payload.key
        ),
      };
    case TYPES.ADD_SOCKET:
      return {
        ...state,
        sockets: [...state.sockets, action.payload.socket],
      };
    case TYPES.REMOVE_SOCKET:
      return {
        ...state,
        sockets: state.sockets.filter(
          socket => socket !== action.payload.socket
        ),
      };
    case TYPES.UPDATE_SNAPSHOT:
      return {
        ...state,
        screens: state.screens.map(screen =>
          screen.key === action.payload.key
            ? {
                ...screen,
                snapshot:
                  !screen.snapshot ||
                  action.payload.snapshot.timestamp > screen.snapshot.timestamp
                    ? action.payload.snapshot
                    : screen.snapshot,
              }
            : screen
        ),
      };
    default:
      return state;
  }
};

export const store = createStore(reducer);

// setInterval(() => console.log(store.getState()), 1000);
