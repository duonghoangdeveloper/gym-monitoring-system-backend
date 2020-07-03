import http from 'http';
import socketio from 'socket.io';
import { debounce, throttle } from 'throttle-debounce';

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
      clearInterval(intervalId);
      console.log('Someone disconnected');
    });

    // Desktop
    socket.on('desktop-stream-screen', ([key, snapshot]) => {
      const screen = store.getState().screens.find(s => s.key === key);
      if (screen) {
        screen.destroy();
        store.dispatch({
          payload: {
            key,
            snapshot,
          },
          type: TYPES.UPDATE_SCREEN,
        });
      } else {
        store.dispatch({
          payload: {
            screen: {
              destroy: debounce(3000, false, () => {
                store.dispatch({
                  payload: {
                    key,
                  },
                  type: TYPES.REMOVE_SCREEN,
                });
              }),
              key,
              snapshot,
            },
          },
          type: TYPES.ADD_SCREEN,
        });
      }
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
    const sendScreen = throttle(250, true, () => {
      const { screens } = store.getState();
      socket.emit('server-send-screens', screens);
    });
    let intervalId = null;
    socket.on('client-start-view-screens', () => {
      clearInterval(intervalId);
      intervalId = setInterval(sendScreen, 200);
    });
    socket.on('client-stop-view-screens', () => {
      clearInterval(intervalId);
    });
  });

  return server;
};
