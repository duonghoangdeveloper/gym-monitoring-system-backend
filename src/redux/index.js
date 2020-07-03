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
  UPDATE_SCREEN: 'UPDATE_SCREEN',
};

const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case TYPES.ADD_SCREEN:
      return {
        ...state,
        screens: [...state.screens, action.payload.screen],
      };
    case TYPES.UPDATE_SCREEN:
      return {
        ...state,
        screens: state.screens.map(screen =>
          screen.key === action.payload.key
            ? {
                ...screen,
                snapshot: action.payload.snapshot,
              }
            : screen
        ),
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
    default:
      return state;
  }
};

export const store = createStore(reducer);

// setInterval(() => console.log('Store', store.getState()), 10000);
