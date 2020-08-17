import http from 'http';
import jwt from 'jsonwebtoken';
import socketio from 'socket.io';

import { store, TYPES } from '../common/redux';
import { configSocketDesktopCameras } from '../config-socket/config-socket-desktop-cameras';
import { configSocketDesktopWebcam } from '../config-socket/config-socket-desktop-webcam';
import { configSocketWebsiteGetCameras } from '../config-socket/config-socket-website-get-cameras';
import { configSocketWebsiteGetCamerasDetection } from '../config-socket/config-socket-website-get-cameras-detection';
import { configSocketWebsiteGetCheckIn } from '../config-socket/config-socket-website-get-check-in';
import { configSocketWebsiteGetUsersAttendance } from '../config-socket/config-socket-website-get-users-attendance';
import { configSocketWebsiteGetWebcam } from '../config-socket/config-socket-website-get-webcam';

export const configSocket = app => {
  const server = http.Server(app);
  const io = socketio(server);

  io.on('connection', socket => {
    // Connected
    console.log('Someone connected');
    store.dispatch({
      payload: {
        camerasStatus: 'READY',
        checkInStatus: 'READY',
        socket,
        usersAttendanceStatus: 'READY',
        webcamStatus: 'READY',
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
      // cameraSubscriber.unsubscribe();
      socketDesktopCamerasCleanup();
      socketDesktopWebcamCleanup();
      socketWebsiteGetCamerasDetectionCleanup();
      socketWebsiteGetCamerasCleanup();
      socketWebsiteGetCheckInCleanup();
      socketWebsiteGetUsersAttendanceCleanup();
      socketWebsiteGetWebcamCleanup();
      console.log('Someone disconnected');
    });

    const socketDesktopCamerasCleanup = configSocketDesktopCameras(socket);
    const socketDesktopWebcamCleanup = configSocketDesktopWebcam(socket);
    const socketWebsiteGetCamerasDetectionCleanup = configSocketWebsiteGetCamerasDetection(
      socket
    );
    const socketWebsiteGetCamerasCleanup = configSocketWebsiteGetCameras(
      socket
    );
    const socketWebsiteGetCheckInCleanup = configSocketWebsiteGetCheckIn(
      socket
    );
    const socketWebsiteGetUsersAttendanceCleanup = configSocketWebsiteGetUsersAttendance(
      socket
    );
    const socketWebsiteGetWebcamCleanup = configSocketWebsiteGetWebcam(socket);
  });

  return server;
};
