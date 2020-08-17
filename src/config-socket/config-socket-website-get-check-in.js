import { store, TYPES } from '../common/redux';

export const configSocketWebsiteGetCheckIn = socket => {
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
          type: TYPES.UPDATE_SOCKET,
        });
        socket.emit('server-send-check-in', { checkIn });
      }
    } catch (_) {
      // Do nothing
    }
  };

  let viewCheckInInterval = null;

  socket.on('client-start-get-check-in', () => {
    clearInterval(viewCheckInInterval);
    store.dispatch({
      payload: {
        checkInStatus: 'READY',
        socket,
      },
      type: TYPES.UPDATE_SOCKET,
    });
    viewCheckInInterval = setInterval(sendCheckIn, 1000);
  });

  socket.on('client-stop-get-check-in', () => {
    clearInterval(viewCheckInInterval);
    store.dispatch({
      payload: {
        checkInStatus: 'READY',
        socket,
      },
      type: TYPES.UPDATE_SOCKET,
    });
  });

  socket.on('client-receive-check-in', () => {
    store.dispatch({
      payload: {
        checkInStatus: 'READY',
        socket,
      },
      type: TYPES.UPDATE_SOCKET,
    });
  });

  return () => {
    clearInterval(viewCheckInInterval);
  };
};
