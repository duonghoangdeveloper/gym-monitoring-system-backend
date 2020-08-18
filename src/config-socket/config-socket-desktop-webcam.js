import axios from 'axios';
import cloneBuffer from 'clone-buffer';
import FormData from 'form-data';
import { fromEvent } from 'rxjs';
import { debounce } from 'throttle-debounce';

import { PYTHON_SERVER_URI_APIS, TOKEN } from '../common/constants';
import { store, TYPES } from '../common/redux';
import { getFPS, validateObjectId } from '../common/services';
import { createCheckIn } from '../modules/check-in/check-in.services';

export const configSocketDesktopWebcam = socket => {
  const delay = 1000 / getFPS();

  const handleDesktopWebcamStream = ({ screenshot }) => {
    const { webcam } = store.getState();
    if (webcam) {
      // Will destroy if the next 9000ms not receive any stream
      webcam.selfDestroy();
      store.dispatch({
        payload: {
          screenshot,
        },
        type: TYPES.UPDATE_WEBCAM,
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
          type: TYPES.UPDATE_WEBCAM,
        });
        const updateCheckInPayload = {};
        try {
          const checkInFormData = new FormData();
          checkInFormData.append(
            'image',
            cloneBuffer(currentWebcam.screenshot.data),
            {
              contentType: 'image/jpeg',
              filename: 'screenshot',
            }
          );
          const result = await axios.post(
            PYTHON_SERVER_URI_APIS.CHECK_IN,
            checkInFormData,
            {
              headers: {
                ...checkInFormData.getHeaders(),
                Authorization: `Bearer ${TOKEN}`,
              },
            }
          );
          const userId = result.data;
          if (validateObjectId(userId)) {
            const { checkIn } = store.getState();
            if (
              checkIn.lastFace === userId &&
              (checkIn.lastCheckIn?._id !== userId ||
                checkIn.lastCheckIn?.timestamp < Date.now() - 60000)
            ) {
              const createdCheckIn = await createCheckIn(
                userId,
                currentWebcam.screenshot.data.toString('base64')
              );
              if (createdCheckIn) {
                updateCheckInPayload.lastCheckIn = {
                  _id: createdCheckIn._id,
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
          console.log(_);
          // Do nothing
        }
        store.dispatch({
          payload: updateCheckInPayload,
          type: TYPES.UPDATE_CHECK_IN,
        });
        store.dispatch({
          payload: {
            detectionStatus: 'READY',
          },
          type: TYPES.UPDATE_WEBCAM,
        });
      };
      const detectionInterval = setInterval(() => {
        const { webcam: currentWebcam } = store.getState();
        const checkInUpdatedAt = store.getState().checkIn.updatedAt;
        if (
          currentWebcam &&
          currentWebcam.detectionStatus === 'READY' &&
          currentWebcam.screenshot.timestamp > checkInUpdatedAt
        ) {
          detectWebcam();
        }
      }, delay);
      // Create new webcam
      store.dispatch({
        payload: {
          detectionInterval,
          detectionStatus: 'READY',
          screenshot,
          selfDestroy,
        },
        type: TYPES.ADD_WEBCAM,
      });
    }
    socket.emit('desktop-stream-webcam-succeeded');
  };
  const webcamObservable = fromEvent(socket, 'desktop-stream-webcam');
  const webcamSubscriber = webcamObservable.subscribe({
    next(data) {
      handleDesktopWebcamStream(data);
    },
  });
  socket.on('desktop-pause-webcam', () => {
    removeWebcam();
  });

  return () => {
    webcamSubscriber.unsubscribe();
  };
};

const removeWebcam = () => {
  const { webcam } = store.getState();
  clearInterval(webcam?.detectionInterval);
  store.dispatch({
    type: TYPES.REMOVE_WEBCAM,
  });
};
