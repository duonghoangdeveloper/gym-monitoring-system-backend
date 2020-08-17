import { store, TYPES } from '../common/redux';
import { getFPS } from '../common/services';

export const configSocketWebsiteGetCameras = socket => {
  const delay = 1000 / getFPS();

  const sendCameras = () => {
    console.log(1);
    try {
      const { cameras, sockets } = store.getState();
      const { camerasStatus } = sockets.find(({ socket: s }) => s === socket);
      if (camerasStatus === 'READY') {
        store.dispatch({
          payload: {
            camerasStatus: 'SENDING',
            socket,
          },
          type: TYPES.UPDATE_SOCKET,
        });
        socket.emit('server-send-cameras', {
          cameras: cameras.map(({ key, screenshot }) => ({
            key,
            screenshot,
          })),
        });
      }
    } catch (_) {
      // Do nothing
    }
  };

  let viewCamerasInterval = null;

  socket.on('client-start-get-cameras', () => {
    clearInterval(viewCamerasInterval);
    store.dispatch({
      payload: {
        camerasStatus: 'READY',
        socket,
      },
      type: TYPES.UPDATE_SOCKET,
    });
    viewCamerasInterval = setInterval(sendCameras, delay);
  });

  socket.on('client-stop-get-cameras', () => {
    clearInterval(viewCamerasInterval);
    store.dispatch({
      payload: {
        camerasStatus: 'READY',
        socket,
      },
      type: TYPES.UPDATE_SOCKET,
    });
  });

  socket.on('client-get-cameras-succeeded', () => {
    store.dispatch({
      payload: {
        camerasStatus: 'READY',
        socket,
      },
      type: TYPES.UPDATE_SOCKET,
    });
  });

  return () => {
    clearInterval(viewCamerasInterval);
  };
};
