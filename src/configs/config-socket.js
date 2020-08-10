import atob from 'atob';
import axios from 'axios';
import FormData from 'form-data';
import http from 'http';
import jwt from 'jsonwebtoken';
import { fromEvent } from 'rxjs';
import socketio from 'socket.io';
import { Readable } from 'stream';
import { debounce } from 'throttle-debounce';

import { detectDangeous } from '../common/algorithms';
import { PYTHON_SERVER_URI_APIS } from '../common/constants';
import { store, TYPES } from '../common/redux';
import { validateObjectId } from '../common/services';
import { createCheckIn } from '../modules/check-in/check-in.services';
// import { base64toBlob } from '../common/services';

/**
 * @param binary Buffer
 * returns readableInstanceStream Readable
 */

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
      screenSubscriber.unsubscribe();
      webcamSubscriber.unsubscribe();
      clearInterval(viewScreensInterval);
      clearInterval(viewUsersAttendanceInterval);
      clearInterval(viewCheckInInterval);
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
            const image = screenToDetect.snapshot.data.toString('base64');
            const combineResult = await Promise.all([
              axios.post(
                PYTHON_SERVER_URI_APIS.RECOGNIZE_PEOPLE,
                {
                  image,
                },
                {
                  headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    'Content-Type': 'application/json',
                  },
                }
              ),
              axios.post(
                PYTHON_SERVER_URI_APIS.DETECT_BARBELLS,
                {
                  image,
                },
                {
                  headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    'Content-Type': 'application/json',
                  },
                }
              ),
            ]);
            const gymData = combineResult
              .map(result => result.data)
              .reduce(
                (accumulator, currentValue) => ({
                  ...accumulator,
                  ...currentValue,
                }),
                {}
              );
            detectDangeous(gymData);
            // console.log(gymData);
            // store.dispatch({
            //   payload: {
            //     faces: result.data.faces ?? [],
            //     updatedAt: screenToDetect.snapshot.timestamp,
            //   },
            //   type: TYPES.UPDATE_USER_ATTENDANCE,
            // });
          } catch (_) {
            console.log(_);
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
          const usersAttendanceUpdatedAt = store.getState().usersAttendance
            .updatedAt;
          if (
            screenToDetect &&
            screenToDetect.detectionStatus === 'READY' &&
            screenToDetect.snapshot.timestamp > usersAttendanceUpdatedAt
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
    const screenObservable = fromEvent(socket, 'desktop-stream-screen');
    const screenSubscriber = screenObservable.subscribe({
      next(data) {
        receiveStream(data);
      },
    });
    socket.on('desktop-pause-screen', key => {
      removeScreen(key);
    });
    const receiveWebcamStream = data => {
      const { webcam } = store.getState();
      if (webcam) {
        // Will destroy if the next 5000ms not receive any stream
        webcam.selfDestroy();
        store.dispatch({
          payload: {
            snapshot: {
              data,
              timestamp: Date.now(),
            },
          },
          type: TYPES.UPDATE_WEBCAM_SNAPSHOT,
        });
      } else {
        const selfDestroy = debounce(9000, false, () => {
          removeWebcam();
        });
        const detectWebcam = async () => {
          const { webcam: currentWebcam } = store.getState();
          store.dispatch({
            payload: {
              detectionStatus: 'DETECTING',
            },
            type: TYPES.UPDATE_WEBCAM_DETECTION_STATUS,
          });
          const updateCheckInPayload = {};
          try {
            const result = await axios.post(
              PYTHON_SERVER_URI_APIS.CHECK_IN,
              {
                image: currentWebcam.snapshot.data,
              },
              {
                headers: {
                  Authorization: `Bearer ${TOKEN}`,
                  'Content-Type': 'application/json',
                },
              }
            );
            const userId = result.data;
            if (validateObjectId(userId)) {
              const { checkIn } = store.getState();
              if (
                checkIn.lastFace === userId &&
                (checkIn.lastCheckIn?.userId !== userId ||
                  checkIn.lastCheckIn?.timestamp < Date.now() - 60000)
              ) {
                const createdCheckIn = await createCheckIn(
                  userId,
                  currentWebcam.snapshot.data
                );
                if (createdCheckIn) {
                  updateCheckInPayload.lastCheckIn = {
                    _id: createdCheckIn._id,
                    lastFace: userId,
                    timestamp: Date.now(),
                  };
                }
              }
              updateCheckInPayload.lastFace = userId;
            } else {
              updateCheckInPayload.lastFace = null;
            }
          } catch (_) {
            updateCheckInPayload.lastFace = null;
            // Do nothing
          }
          // updateCheckInPayload.updatedAt = Date.now();
          store.dispatch({
            payload: updateCheckInPayload,
            type: TYPES.UPDATE_CHECK_IN,
          });
          store.dispatch({
            payload: {
              detectionStatus: 'READY',
            },
            type: TYPES.UPDATE_WEBCAM_DETECTION_STATUS,
          });
        };
        const detectionInterval = setInterval(() => {
          const { webcam: currentWebcam } = store.getState();
          const checkInUpdatedAt = store.getState().checkIn.updatedAt;
          if (
            currentWebcam &&
            currentWebcam.detectionStatus === 'READY' &&
            currentWebcam.snapshot.timestamp > checkInUpdatedAt
          ) {
            detectWebcam();
          }
        }, delay);
        // Create new webcam
        store.dispatch({
          payload: {
            webcam: {
              detectionInterval,
              detectionStatus: 'READY',
              selfDestroy,
              snapshot: {
                data,
                timestamp: Date.now(),
              },
            },
          },
          type: TYPES.ADD_WEBCAM,
        });
      }
      socket.emit('desktop-stream-webcam-received');
    };
    const webcamObservable = fromEvent(socket, 'desktop-stream-webcam');
    const webcamSubscriber = webcamObservable.subscribe({
      next(data) {
        receiveWebcamStream(data);
      },
    });
    socket.on('desktop-pause-webcam', () => {
      removeWebcam();
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

    // Client - view check in
    const sendCheckIn = () => {
      try {
        const { checkIn, sockets } = store.getState();
        const { checkInStatus } = sockets.find(({ socket: s }) => s === socket);
        if (checkInStatus === 'READY') {
          store.dispatch({
            payload: {
              checkInStatus: 'SENDING',
              socket,
            },
            type: TYPES.UPDATE_SOCKET_CHECK_IN_STATUS,
          });
          socket.emit('server-send-check-in', checkIn);
        }
      } catch (_) {
        // Do nothing
      }
    };
    let viewCheckInInterval = null;
    socket.on('client-start-view-check-in', () => {
      clearInterval(viewCheckInInterval);
      store.dispatch({
        payload: {
          checkInStatus: 'READY',
          socket,
        },
        type: TYPES.UPDATE_SOCKET_CHECK_IN_STATUS,
      });
      sendCheckIn();
      viewCheckInInterval = setInterval(sendCheckIn, 1000);
    });
    socket.on('client-stop-view-check-in', () => {
      clearInterval(viewCheckInInterval);
    });
    socket.on('client-receive-check-in', () => {
      store.dispatch({
        payload: {
          checkInStatus: 'READY',
          socket,
        },
        type: TYPES.UPDATE_SOCKET_CHECK_IN_STATUS,
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

const removeWebcam = () => {
  const { webcam } = store.getState();
  clearInterval(webcam?.detectionInterval);
  store.dispatch({
    type: TYPES.REMOVE_WEBCAM,
  });
};
