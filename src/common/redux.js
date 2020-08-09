import isNil from 'lodash.isnil';

import { getUserById } from '../modules/user/user.services';
import { validateObjectId } from './services';

const { createStore } = require('redux');

const INITIAL_STATE = {
  checkIn: {
    lastCheckIn: null,
    lastFace: null,
    updatedAt: Date.now(),
  },
  common: {
    fps: 30,
  },
  screens: [],
  sockets: [],
  usersAttendance: {
    updatedAt: Date.now(),
  },
  webcam: null,
};

export const TYPES = {
  ADD_SCREEN: 'ADD_SCREEN',
  ADD_SOCKET: 'ADD_SOCKET',
  ADD_WEBCAM: 'ADD_WEBCAM',
  REMOVE_SCREEN: 'REMOVE_SCREEN',
  REMOVE_SOCKET: 'REMOVE_SOCKET',
  REMOVE_WEBCAM: 'REMOVE_WEBCAM',
  UPDATE_CHECK_IN: 'UPDATE_CHECK_IN',
  UPDATE_FPS: 'UPDATE_FPS',
  UPDATE_SCREEN_DETECTION_STATUS: 'UPDATE_SCREEN_DETECTION_STATUS',
  UPDATE_SCREEN_SNAPSHOT: 'UPDATE_SCREEN_SNAPSHOT',
  UPDATE_SOCKET_CHECK_IN_STATUS: 'UPDATE_SOCKET_CHECK_IN_STATUS',
  UPDATE_SOCKET_SCREENS_STATUS: 'UPDATE_SOCKET_SCREENS_STATUS',
  UPDATE_SOCKET_USERS_ATTENDANCE_STATUS:
    'UPDATE_SOCKET_USERS_ATTENDANCE_STATUS',
  UPDATE_USER_ATTENDANCE: 'UPDATE_USER_ATTENDANCE',
  UPDATE_WEBCAM_DETECTION_STATUS: 'UPDATE_WEBCAM_DETECTION_STATUS',
  UPDATE_WEBCAM_SNAPSHOT: 'UPDATE_WEBCAM_SNAPSHOT',
};

const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case TYPES.ADD_SCREEN:
      return {
        ...state,
        screens: [...state.screens, action.payload.screen],
      };
    case TYPES.ADD_WEBCAM:
      return {
        ...state,
        webcam: action.payload.webcam,
      };
    case TYPES.ADD_SOCKET:
      return {
        ...state,
        sockets: [
          ...state.sockets,
          {
            screensStatus: 'READY',
            socket: action.payload.socket,
            usersAttendanceStatus: 'READY',
          },
        ],
      };
    case TYPES.REMOVE_SCREEN:
      return {
        ...state,
        screens: state.screens.filter(
          screen => screen.key !== action.payload.key
        ),
      };
    case TYPES.REMOVE_SOCKET:
      return {
        ...state,
        sockets: state.sockets.filter(
          ({ socket }) => socket !== action.payload.socket
        ),
      };
    case TYPES.REMOVE_WEBCAM:
      return {
        ...state,
        webcam: null,
      };
    case TYPES.UPDATE_CHECK_IN:
      return {
        ...state,
        checkIn: {
          ...state.checkIn,
          ...action.payload,
          updatedAt: Date.now(),
        },
      };
    case TYPES.UPDATE_FPS:
      return {
        ...state,
        common: {
          ...state.common,
          fps: action.payload.fps,
        },
      };
    case TYPES.UPDATE_SCREEN_DETECTION_STATUS:
      return {
        ...state,
        screens: state.screens.map(screen =>
          screen.key === action.payload.key
            ? {
                ...screen,
                detectionStatus: action.payload.detectionStatus,
              }
            : screen
        ),
      };
    case TYPES.UPDATE_SCREEN_SNAPSHOT:
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
    case TYPES.UPDATE_SOCKET_CHECK_IN_STATUS:
      return {
        ...state,
        sockets: state.sockets.map(socketObj =>
          socketObj.socket === action.payload.socket
            ? {
                ...socketObj,
                checkInStatus: action.payload.checkInStatus,
              }
            : socketObj
        ),
      };
    case TYPES.UPDATE_SOCKET_SCREENS_STATUS:
      return {
        ...state,
        sockets: state.sockets.map(socketObj =>
          socketObj.socket === action.payload.socket
            ? {
                ...socketObj,
                screensStatus: action.payload.screensStatus,
              }
            : socketObj
        ),
      };
    case TYPES.UPDATE_SOCKET_USERS_ATTENDANCE_STATUS:
      return {
        ...state,
        sockets: state.sockets.map(socketObj =>
          socketObj.socket === action.payload.socket
            ? {
                ...socketObj,
                usersAttendanceStatus: action.payload.usersAttendanceStatus,
              }
            : socketObj
        ),
      };
    case TYPES.UPDATE_USER_ATTENDANCE:
      return {
        ...state,
        usersAttendance: generateNewUsersAttendance(
          state.usersAttendance,
          action.payload.faces,
          action.payload.updatedAt
        ),
      };
    case TYPES.UPDATE_WEBCAM_DETECTION_STATUS:
      return {
        ...state,
        webcam: state.webcam
          ? {
              ...state.webcam,
              detectionStatus: action.payload.detectionStatus,
            }
          : null,
      };
    case TYPES.UPDATE_WEBCAM_SNAPSHOT:
      return {
        ...state,
        webcam: {
          ...state.webcam,
          snapshot:
            !state.webcam.snapshot ||
            action.payload.snapshot.timestamp > state.webcam.snapshot.timestamp
              ? action.payload.snapshot
              : state.webcam.snapshot,
        },
      };
    default:
      return state;
  }
};

export const store = createStore(reducer);

const generateNewUsersAttendance = (
  currentUsersAttendance,
  faces,
  updatedAt
) => {
  const newUsersAttendance = {
    ...currentUsersAttendance,
    updatedAt,
  };
  const decay = (updatedAt - currentUsersAttendance.updatedAt) / 30000;
  faces.forEach(({ label }) => {
    if (validateObjectId(label)) {
      if (isNil(newUsersAttendance[label])) {
        newUsersAttendance[label] = {
          document: null,
          score: 5 + decay,
          status: 'ABSENT',
        };
      } else {
        newUsersAttendance[label].score += 5 + decay;
      }
    }
  });
  Object.keys(newUsersAttendance).forEach(label => {
    if (validateObjectId(label) && !isNil(newUsersAttendance[label])) {
      // newUsersAttendance[label].score =
      //   Math.round((newUsersAttendance[label].score - 0.1) * 10) / 10;
      newUsersAttendance[label].score =
        Math.round((newUsersAttendance[label].score - decay) * 100) / 100;

      if (newUsersAttendance[label].score <= 80) {
        newUsersAttendance[label].status = 'ABSENT';
      }

      if (newUsersAttendance[label].score >= 100) {
        newUsersAttendance[label].status = 'PRESENT';
        newUsersAttendance[label].score = 100;
        if (isNil(newUsersAttendance[label].document)) {
          getUserById(label)
            .then(user => {
              if (isNil(user.activationToken)) {
                const clonedUser = { ...user._doc };
                delete clonedUser.password;
                delete clonedUser.tokens;
                newUsersAttendance[label].document = clonedUser;
              }
            })
            .catch(error => {
              // Do nothing
            });
        }
      }

      if (newUsersAttendance[label].score <= 0) {
        delete newUsersAttendance[label];
      }
    }
  });

  return newUsersAttendance;
};

const decayUsersAttendance = () => {
  const usersAttendaceUpdatedAt = store.getState().usersAttendance.updatedAt;
  if (usersAttendaceUpdatedAt <= Date.now() - 9000) {
    store.dispatch({
      payload: {
        faces: [],
        updatedAt: Date.now() - 9000,
      },
      type: TYPES.UPDATE_USER_ATTENDANCE,
    });
  }
};

setInterval(decayUsersAttendance, 9000);

// setInterval(() => console.log(store.getState()), 3000);
