import http from 'http';
import { fromEvent } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import socketio from 'socket.io';
import { debounce, throttle } from 'throttle-debounce';

import { DELAY } from '../common/constants';
import { store, TYPES } from '../redux';

export const configSocket = app => {
  const server = http.Server(app);
  const io = socketio(server);

  io.on('connection', socket => {
    // Connected
    console.log('Someone connect');
    store.dispatch({
      payload: {
        socket,
      },
      type: TYPES.ADD_SOCKET,
    });
    socket.on('disconnect', () => {
      store.dispatch({
        payload: {
          socket,
        },
        type: TYPES.REMOVE_SOCKET,
      });
      subscriber.unsubscribe();
      socket.removeAllListeners();
      clearInterval(viewScreenInterval);
      console.log('Someone disconnected');
    });

    // Desktop
    const receiveStream = throttle(DELAY, true, ([key, data, timestamp]) => {
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
          type: TYPES.UPDATE_SNAPSHOT,
        });
      } else {
        const selfDestroy = debounce(10000, false, () => {
          store.dispatch({
            payload: {
              key,
            },
            type: TYPES.REMOVE_SCREEN,
          });
        });

        // Create new screen
        store.dispatch({
          payload: {
            screen: {
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
      }
    });
    const observable = fromEvent(socket, 'desktop-stream-screen').pipe(
      throttleTime(DELAY)
    );
    const subscriber = observable.subscribe({
      next(data) {
        receiveStream(data);
      },
    });
    socket.on('desktop-pause-screen', key => {
      store.dispatch({
        payload: {
          key,
        },
        type: TYPES.REMOVE_SCREEN,
      });
    });

    // Client
    const sendScreen = throttle(DELAY, true, () => {
      const { screens } = store.getState();
      socket.emit(
        'server-send-screens',
        screens.map(({ key, snapshot }) => ({
          key,
          snapshot,
        }))
      );
    });
    let viewScreenInterval = null;
    socket.on('client-start-view-screens', () => {
      clearInterval(viewScreenInterval);
      viewScreenInterval = setInterval(sendScreen, DELAY);
    });
    socket.on('client-stop-view-screens', () => {
      clearInterval(viewScreenInterval);
    });
  });

  return server;
};
