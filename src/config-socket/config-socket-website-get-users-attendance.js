import { store, TYPES } from '../common/redux';

export const configSocketWebsiteGetUsersAttendance = socket => {
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
          type: TYPES.UPDATE_SOCKET,
        });
        socket.emit('server-send-users-attendance', usersAttendance);
      }
    } catch (_) {
      // Do nothing
    }
  };

  let viewUsersAttendanceInterval = null;

  socket.on('client-start-get-users-attendance', () => {
    clearInterval(viewUsersAttendanceInterval);
    store.dispatch({
      payload: {
        socket,
        usersAttendanceStatus: 'READY',
      },
      type: TYPES.UPDATE_SOCKET,
    });
    viewUsersAttendanceInterval = setInterval(sendUsersAttendance, 3000);
  });

  socket.on('client-stop-get-users-attendance', () => {
    clearInterval(viewUsersAttendanceInterval);
    store.dispatch({
      payload: {
        socket,
        usersAttendanceStatus: 'READY',
      },
      type: TYPES.UPDATE_SOCKET,
    });
  });

  socket.on('client-receive-users-attendance', () => {
    store.dispatch({
      payload: {
        socket,
        usersAttendanceStatus: 'READY',
      },
      type: TYPES.UPDATE_SOCKET,
    });
  });

  return () => {
    clearInterval(viewUsersAttendanceInterval);
  };
};
