import axios from 'axios';
import FormData from 'form-data';
import http from 'http';
import jwt from 'jsonwebtoken';
import { fromEvent } from 'rxjs';
import socketio from 'socket.io';
import { debounce } from 'throttle-debounce';

import { PYTHON_SERVER_URI } from '../common/constants';
import { store, TYPES } from '../common/redux';

export const configSocket = app => {
  const server = http.Server(app);
  const io = socketio(server);

  io.on('connection', socket => {
    // Connected
    console.log('Someone connected');
    store.dispatch({
      payload: {
        socket,
      },
      type: TYPES.ADD_SOCKET,
    });

    // Disconnected
    socket.on('disconnect', () => {
      socket.removeAllListeners();
      store.dispatch({
        payload: {
          socket,
        },
        type: TYPES.REMOVE_SOCKET,
      });
      subscriber.unsubscribe();
      clearInterval(viewScreensInterval);
      clearInterval(viewUsersAttendanceInterval);
      console.log('Someone disconnected');
    });
    const delay = 1000 / getFPS();

    // Desktop
    const receiveStream = ([key, data, timestamp, fps]) => {
      const screen = store.getState().screens.find(s => s.key === key);
      if (screen) {
        // Will destroy if the next 5000ms not receive any stream
        screen.selfDestroy();
        store.dispatch({
          payload: {
            key,
            snapshot: {
              data,
              timestamp,
            },
          },
          type: TYPES.UPDATE_SCREEN_SNAPSHOT,
        });
      } else {
        const selfDestroy = debounce(9000, false, () => {
          removeScreen(key);
        });
        const detectScreen = async screenToDetect => {
          store.dispatch({
            payload: {
              detectionStatus: 'DETECTING',
              key,
            },
            type: TYPES.UPDATE_SCREEN_DETECTION_STATUS,
          });
          try {
            const formData = new FormData();
            formData.append('image', screenToDetect.snapshot.data, {
              contentType: 'image/jpeg',
              filename: 'snapshot',
            });
            const result = await axios.post(
              `${PYTHON_SERVER_URI}/detect-gym-object/`,
              formData,
              {
                headers: {
                  ...formData.getHeaders(),
                  Authorization: `Bearer ${TOKEN}`,
                },
              }
            );
            store.dispatch({
              payload: {
                faces: result.data.faces ?? [],
                updatedAt: screenToDetect.snapshot.timestamp,
              },
              type: TYPES.UPDATE_USER_ATTENDANCE,
            });
          } catch (_) {
            // Do nothing
          }
          store.dispatch({
            payload: {
              detectionStatus: 'READY',
              key,
            },
            type: TYPES.UPDATE_SCREEN_DETECTION_STATUS,
          });
        };
        const detectionInterval = setInterval(() => {
          const screenToDetect = store
            .getState()
            .screens.find(s => s.key === key);
          const usersAttendaceUpdatedAt = store.getState().usersAttendance
            .updatedAt;
          if (
            screenToDetect &&
            screenToDetect.detectionStatus === 'READY' &&
            screenToDetect.snapshot.timestamp > usersAttendaceUpdatedAt
          ) {
            detectScreen(screenToDetect);
          }
        }, delay);
        // Create new screen
        store.dispatch({
          payload: {
            screen: {
              detectionInterval,
              detectionStatus: 'READY',
              key,
              selfDestroy,
              snapshot: {
                data,
                timestamp,
              },
            },
          },
          type: TYPES.ADD_SCREEN,
        });
        store.dispatch({
          payload: {
            fps,
          },
          type: TYPES.UPDATE_FPS,
        });
      }
      socket.emit('desktop-stream-screen-received', key);
    };
    const observable = fromEvent(socket, 'desktop-stream-screen');
    const subscriber = observable.subscribe({
      next(data) {
        receiveStream(data);
      },
    });
    socket.on('desktop-pause-screen', key => {
      removeScreen(key);
    });

    // Client - view screens
    const sendScreens = () => {
      try {
        const { screens, sockets } = store.getState();
        const { screensStatus } = sockets.find(({ socket: s }) => s === socket);
        if (screensStatus === 'READY') {
          store.dispatch({
            payload: {
              screensStatus: 'SENDING',
              socket,
            },
            type: TYPES.UPDATE_SOCKET_SCREENS_STATUS,
          });
          socket.emit(
            'server-send-screens',
            screens.map(({ key, snapshot }) => ({
              key,
              snapshot,
            }))
          );
        }
      } catch (_) {
        // Do nothing
      }
    };
    let viewScreensInterval = null;
    socket.on('client-start-view-screens', () => {
      clearInterval(viewScreensInterval);
      store.dispatch({
        payload: {
          screensStatus: 'READY',
          socket,
        },
        type: TYPES.UPDATE_SOCKET_SCREENS_STATUS,
      });
      sendScreens();
      viewScreensInterval = setInterval(sendScreens, delay);
    });
    socket.on('client-stop-view-screens', () => {
      clearInterval(viewScreensInterval);
    });
    socket.on('client-receive-screens', () => {
      store.dispatch({
        payload: {
          screensStatus: 'READY',
          socket,
        },
        type: TYPES.UPDATE_SOCKET_SCREENS_STATUS,
      });
    });

    // Client - view users attendance
    const sendUsersAttendance = () => {
      try {
        const { sockets, usersAttendance } = store.getState();
        const { usersAttendanceStatus } = sockets.find(
          ({ socket: s }) => s === socket
        );
        if (usersAttendanceStatus === 'READY') {
          store.dispatch({
            payload: {
              socket,
              usersAttendanceStatus: 'SENDING',
            },
            type: TYPES.UPDATE_SOCKET_USERS_ATTENDANCE_STATUS,
          });
          socket.emit('server-send-users-attendance', usersAttendance);
        }
      } catch (_) {
        // Do nothing
      }
    };
    let viewUsersAttendanceInterval = null;
    socket.on('client-start-view-users-attendance', () => {
      clearInterval(viewUsersAttendanceInterval);
      store.dispatch({
        payload: {
          socket,
          usersAttendanceStatus: 'READY',
        },
        type: TYPES.UPDATE_SOCKET_USERS_ATTENDANCE_STATUS,
      });
      sendUsersAttendance();
      viewUsersAttendanceInterval = setInterval(sendUsersAttendance, 3000);
    });
    socket.on('client-stop-view-users-attendance', () => {
      clearInterval(viewUsersAttendanceInterval);
    });
    socket.on('client-receive-users-attendance', () => {
      store.dispatch({
        payload: {
          socket,
          usersAttendanceStatus: 'READY',
        },
        type: TYPES.UPDATE_SOCKET_USERS_ATTENDANCE_STATUS,
      });
    });
  });

  return server;
};

const TOKEN = jwt.sign({ message: 'Hello world!' }, process.env.JWT_SECRET);

const getFPS = () => {
  const fps = !Number.isNaN(Number(store.getState().common.fps))
    ? Number(store.getState().common.fps)
    : 30;
  return fps < 30 ? fps : 30;
};

const removeScreen = key => {
  const screenToRemove = store.getState().screens.find(s => s.key === key);
  clearInterval(screenToRemove?.detectionInterval);
  store.dispatch({
    payload: {
      key,
    },
    type: TYPES.REMOVE_SCREEN,
  });
};
