import isNil from 'lodash.isnil';

import { getUserById } from '../modules/user/user.services';
import { reloadFacesPython, validateObjectId } from './services';

const { createStore } = require('redux');

const INITIAL_STATE = {
  cameras: [],
  checkIn: {
    lastCheckIn: null,
    lastFace: null,
    updatedAt: Date.now(),
  },
  common: {
    fps: 30,
  },
  sockets: [],
  usersAttendance: {
    updatedAt: Date.now(),
  },
  webcam: null,
};

export const TYPES = {
  ADD_CAMERA: 'ADD_CAMERA',
  ADD_SOCKET: 'ADD_SOCKET',
  ADD_WEBCAM: 'ADD_WEBCAM',
  REMOVE_CAMERA: 'REMOVE_CAMERA',
  REMOVE_SOCKET: 'REMOVE_SOCKET',
  REMOVE_WEBCAM: 'REMOVE_WEBCAM',
  UPDATE_CAMERA: 'UPDATE_CAMERA',
  UPDATE_CHECK_IN: 'UPDATE_CHECK_IN',
  UPDATE_COMMON: 'UPDATE_COMMON',
  UPDATE_SOCKET: 'UPDATE_SOCKET',
  UPDATE_USER_ATTENDANCE: 'UPDATE_USER_ATTENDANCE',
  UPDATE_WEBCAM: 'UPDATE_WEBCAM',
};

const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case TYPES.ADD_CAMERA:
      return {
        ...state,
        cameras: [
          ...state.cameras,
          {
            ...action.payload,
            updatedAt: Date.now(),
          },
        ],
      };
    case TYPES.ADD_SOCKET:
      return {
        ...state,
        sockets: [
          ...state.sockets,
          {
            ...action.payload,
            updatedAt: Date.now(),
          },
        ],
      };
    case TYPES.ADD_WEBCAM:
      return {
        ...state,
        webcam: {
          ...action.payload,
          updatedAt: Date.now(),
        },
      };
    case TYPES.REMOVE_CAMERA:
      return {
        ...state,
        cameras: state.cameras.filter(
          camera => camera._id !== action.payload._id
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
    case TYPES.UPDATE_CAMERA:
      return {
        ...state,
        cameras: state.cameras.map(camera =>
          camera._id === action.payload._id
            ? {
                ...camera,
                ...action.payload,
                updatedAt: Date.now(),
              }
            : camera
        ),
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
    case TYPES.UPDATE_COMMON:
      return {
        ...state,
        common: {
          ...state.common,
          ...action.payload,
          updatedAt: Date.now(),
        },
      };
    case TYPES.UPDATE_SOCKET:
      return {
        ...state,
        sockets: state.sockets.map(socketObj =>
          socketObj.socket === action.payload.socket
            ? {
                ...socketObj,
                ...action.payload,
                updatedAt: Date.now(),
              }
            : socketObj
        ),
      };
    case TYPES.UPDATE_USER_ATTENDANCE:
      return {
        ...state,
        usersAttendance: {
          ...generateNewUsersAttendance(
            state.usersAttendance,
            action.payload.faces
          ),
          updatedAt: Date.now(),
        },
      };
    case TYPES.UPDATE_WEBCAM:
      return {
        ...state,
        webcam: state.webcam
          ? {
              ...state.webcam,
              ...action.payload,
              updatedAt: Date.now(),
            }
          : null,
      };
    default:
      return state;
  }
};

export const store = createStore(reducer);

const generateNewUsersAttendance = (currentUsersAttendance, faces) => {
  const newUsersAttendance = {
    ...currentUsersAttendance,
  };
  const decay = (Date.now() - currentUsersAttendance.updatedAt) / 30000;
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

const refreshUsersAttendance = () => {
  const usersAttendanceUpdatedAt = store.getState().usersAttendance.updatedAt;
  if (usersAttendanceUpdatedAt <= Date.now() - 9000) {
    store.dispatch({
      payload: {
        faces: [],
      },
      type: TYPES.UPDATE_USER_ATTENDANCE,
    });
  }
};

const refreshCheckIn = () => {
  const checkInUpdatedAt = store.getState().checkIn.updatedAt;
  if (checkInUpdatedAt <= Date.now() - 9000) {
    store.dispatch({
      payload: {},
      type: TYPES.UPDATE_CHECK_IN,
    });
  }
};

setInterval(refreshUsersAttendance, 9000);
setInterval(refreshCheckIn, 9000);
// setTimeout(() => reloadFacesPython(), 9000);

// setInterval(() => console.log(store.getState()), 3000);
