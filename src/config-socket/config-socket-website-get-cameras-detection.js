import { store, TYPES } from '../common/redux';
import { getFPS } from '../common/services';

export const configSocketWebsiteGetCamerasDetection = socket => {
  const delay = 1000 / getFPS();

  const sendCamerasDetection = () => {
    try {
      const { cameras, sockets } = store.getState();
      const { camerasDetectionStatus } = sockets.find(
        ({ socket: s }) => s === socket
      );
      if (camerasDetectionStatus === 'READY') {
        store.dispatch({
          payload: {
            camerasDetectionStatus: 'SENDING',
            socket,
          },
          type: TYPES.UPDATE_SOCKET,
        });
        socket.emit('server-send-cameras-detection', {
          cameras: cameras
            .filter(({ detectionData }) => detectionData)
            .map(({ detectionData, key }) => ({
              detectionData,
              key,
            })),
        });
      }
    } catch (_) {
      // Do nothing
    }
  };

  let viewCamerasDetectionInterval = null;

  socket.on('client-start-get-cameras-detection', () => {
    clearInterval(viewCamerasDetectionInterval);
    store.dispatch({
      payload: {
        camerasDetectionStatus: 'READY',
        socket,
      },
      type: TYPES.UPDATE_SOCKET,
    });
    viewCamerasDetectionInterval = setInterval(sendCamerasDetection, delay);
  });

  socket.on('client-stop-get-cameras-detection', () => {
    clearInterval(viewCamerasDetectionInterval);
    store.dispatch({
      payload: {
        camerasDetectionStatus: 'READY',
        socket,
      },
      type: TYPES.UPDATE_SOCKET,
    });
  });

  socket.on('client-get-cameras-detection-succeeded', () => {
    store.dispatch({
      payload: {
        camerasDetectionStatus: 'READY',
        socket,
      },
      type: TYPES.UPDATE_SOCKET,
    });
  });

  return () => {
    clearInterval(viewCamerasDetectionInterval);
  };
};
