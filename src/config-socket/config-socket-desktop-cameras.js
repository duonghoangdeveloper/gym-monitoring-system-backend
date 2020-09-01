import axios from 'axios';
import cloneBuffer from 'clone-buffer';
import FormData from 'form-data';
import { fromEvent } from 'rxjs';
import { debounce } from 'throttle-debounce';

import { detectDangeous } from '../common/algorithms';
import { PYTHON_SERVER_URI_APIS, TOKEN } from '../common/constants';
import { store, TYPES } from '../common/redux';
import { getFPS } from '../common/services';
import {
  createWarning,
  sendWarningNotificationToOnlineTrainers,
} from '../modules/warning/warning.services';

export const configSocketDesktopCameras = socket => {
  const delay = 1000 / getFPS();

  const handleDesktopCameraStream = ({ _id, fps, screenshot }) => {
    const camera = store.getState().cameras.find(s => s._id === _id);
    if (camera) {
      // Will destroy if the next 9000ms not receive any stream
      camera.selfDestroy();
      store.dispatch({
        payload: {
          _id,
          screenshot,
        },
        type: TYPES.UPDATE_CAMERA,
      });
    } else {
      const selfDestroy = debounce(9000, false, () => {
        removeCamera(_id);
      });
      const detectCamera = async cameraToDetect => {
        store.dispatch({
          payload: {
            _id,
            detectionStatus: 'DETECTING',
          },
          type: TYPES.UPDATE_CAMERA,
        });
        try {
          const recognizePeopleFormData = new FormData();
          recognizePeopleFormData.append(
            'image',
            cloneBuffer(cameraToDetect.screenshot.data),
            {
              contentType: 'image/jpeg',
              filename: 'screenshot',
            }
          );
          const detectBarbellsFormData = new FormData();
          detectBarbellsFormData.append(
            'image',
            cloneBuffer(cameraToDetect.screenshot.data),
            {
              contentType: 'image/jpeg',
              filename: 'screenshot',
            }
          );
          const combineResult = await Promise.all([
            axios.post(
              PYTHON_SERVER_URI_APIS.DETECT_BARBELLS,
              detectBarbellsFormData,
              {
                headers: {
                  ...detectBarbellsFormData.getHeaders(),
                  Authorization: `Bearer ${TOKEN}`,
                },
              }
            ),
            axios.post(
              PYTHON_SERVER_URI_APIS.RECOGNIZE_PEOPLE,
              recognizePeopleFormData,
              {
                headers: {
                  ...recognizePeopleFormData.getHeaders(),
                  Authorization: `Bearer ${TOKEN}`,
                },
              }
            ),
          ]);
          const detectionData = {
            ...combineResult
              .map(result => result.data)
              .reduce(
                (accumulator, currentValue) => ({
                  ...accumulator,
                  ...currentValue,
                }),
                {}
              ),
            screenshot: {
              data: cloneBuffer(cameraToDetect.screenshot.data),
              timestamp: cameraToDetect.screenshot.timestamp,
            },
          };

          store.dispatch({
            payload: {
              _id,
              detectionData,
            },
            type: TYPES.UPDATE_CAMERA,
          });
          if (detectDangeous(detectionData)) {
            const createdWarning = await createWarning({
              cameraId: _id,
              content: 'Dangerous position',
              image: cameraToDetect.screenshot.data.toString('base64'),
            });
            await sendWarningNotificationToOnlineTrainers(createdWarning);
          }
        } catch (_) {
          // Do nothing
        }
        store.dispatch({
          payload: {
            _id,
            detectionStatus: 'READY',
          },
          type: TYPES.UPDATE_CAMERA,
        });
      };
      const detectionInterval = setInterval(() => {
        const cameraToDetect = store
          .getState()
          .cameras.find(s => s._id === _id);
        if (cameraToDetect && cameraToDetect.detectionStatus === 'READY') {
          detectCamera(cameraToDetect);
        }
      }, delay);
      // Create new camera
      store.dispatch({
        payload: {
          _id,
          detectionData: null,
          detectionInterval,
          detectionStatus: 'READY',
          screenshot,
          selfDestroy,
        },
        type: TYPES.ADD_CAMERA,
      });
      store.dispatch({
        payload: {
          fps,
        },
        type: TYPES.UPDATE_COMMON,
      });
    }
    socket.emit('desktop-stream-camera-succeeded', { _id });
  };
  const cameraObservable = fromEvent(socket, 'desktop-stream-camera');
  const cameraSubscriber = cameraObservable.subscribe({
    next(data) {
      handleDesktopCameraStream(data);
    },
  });
  socket.on('desktop-pause-camera', ({ _id }) => {
    removeCamera(_id);
  });

  return () => {
    cameraSubscriber.unsubscribe();
  };
};

const removeCamera = _id => {
  const cameraToRemove = store.getState().cameras.find(s => s._id === _id);
  clearInterval(cameraToRemove?.detectionInterval);
  store.dispatch({
    payload: {
      _id,
    },
    type: TYPES.REMOVE_CAMERA,
  });
};
