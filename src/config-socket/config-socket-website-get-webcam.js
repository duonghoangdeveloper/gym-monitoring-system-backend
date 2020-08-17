import { store, TYPES } from '../common/redux';
import { getFPS } from '../common/services';

export const configSocketWebsiteGetWebcam = socket => {
  const delay = 1000 / getFPS();

  const sendWebcam = () => {
    try {
      const { sockets, webcam } = store.getState();
      const { webcamStatus } = sockets.find(({ socket: s }) => s === socket);
      if (webcamStatus === 'READY') {
        store.dispatch({
          payload: {
            socket,
            webcamStatus: 'SENDING',
          },
          type: TYPES.UPDATE_SOCKET,
        });
        socket.emit('server-send-webcam', {
          webcam: {
            screenshot: webcam?.screenshot,
          },
        });
      }
    } catch (_) {
      // Do nothing
    }
  };

  let getWebcamInterval = null;

  socket.on('client-start-get-webcam', () => {
    clearInterval(getWebcamInterval);
    store.dispatch({
      payload: {
        socket,
        webcamStatus: 'READY',
      },
      type: TYPES.UPDATE_SOCKET,
    });
    getWebcamInterval = setInterval(sendWebcam, delay);
  });

  socket.on('client-stop-get-webcam', () => {
    clearInterval(getWebcamInterval);
    store.dispatch({
      payload: {
        socket,
        webcamStatus: 'READY',
      },
      type: TYPES.UPDATE_SOCKET,
    });
  });

  socket.on('client-get-webcam-succeeded', () => {
    store.dispatch({
      payload: {
        socket,
        webcamStatus: 'READY',
      },
      type: TYPES.UPDATE_SOCKET,
    });
  });

  return () => {
    clearInterval(getWebcamInterval);
  };
};
