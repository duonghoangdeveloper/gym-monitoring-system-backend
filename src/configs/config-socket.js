import http from 'http';
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
      clearInterval(viewScreenInterval);
      clearInterval(updateScreensInterval);
      console.log('Someone disconnected');
    });

    // Desktop
    const receiveStream = throttle(DELAY, true, ([key, data, timestamp]) => {
      const screen = store.getState().screens.find(s => s.key === key);

      if (screen) {
        // Will destroy if the next 10000ms not receive any stream
        screen.selfDestroy();

        store.dispatch({
          payload: {
            key,
            snapshot: {
              data,
              timestamp,
            },
          },
          type: TYPES.ADD_SNAPSHOT_TO_STACK,
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
              snapshot: data,
              snapshotStack: [],
            },
          },
          type: TYPES.ADD_SCREEN,
        });
      }
    });
    socket.on('desktop-stream-screen', receiveStream);
    socket.on('desktop-pause-screen', key => {
      store.dispatch({
        payload: {
          key,
        },
        type: TYPES.REMOVE_SCREEN,
      });
    });
    // Each 200ms poll latest snapshot in snapshotStack and update to current snapshot
    // then empty snapshotStack OF EACH SCREEN in redux store
    const updateScreensInterval = setInterval(() => {
      const { screens } = store.getState();
      store.dispatch({
        payload: {
          screens: screens.map(screen => ({
            ...screen,
            snapshot:
              screen.snapshotStack.reduce(
                (prev, current) =>
                  prev?.timestamp > current?.timestamp ? prev : current,
                null
              )?.data ?? screen.snapshot,
            snapshotStack: [],
          })),
        },
        type: TYPES.UPDATE_SCREENS,
      });
    }, DELAY);

    // Client
    const sendScreen = throttle(DELAY, true, () => {
      const { screens } = store.getState();
      socket.emit(
        'server-send-screens',
        screens.map(({ key, snapshot }) => ({
          key,
          snapshot: snapshot.toString('base64'),
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
