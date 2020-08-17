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

  const handleDesktopCameraStream = ({ fps, key, screenshot }) => {
    const camera = store.getState().cameras.find(s => s.key === key);
    if (camera) {
      // Will destroy if the next 9000ms not receive any stream
      camera.selfDestroy();
      store.dispatch({
        payload: {
          key,
          screenshot,
        },
        type: TYPES.UPDATE_CAMERA,
      });
    } else {
      const selfDestroy = debounce(9000, false, () => {
        removeCamera(key);
      });
      const detectCamera = async cameraToDetect => {
        store.dispatch({
          payload: {
            detectionStatus: 'DETECTING',
            key,
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
              detectionData,
              key,
            },
            type: TYPES.UPDATE_CAMERA,
          });
          if (Math.random() < 0.5) {
            console.log('Send')
            const createdWarning = await createWarning({
              content: 'Wrong position',
              image: cameraToDetect.screenshot.data.toString('base64'),
            });
            await sendWarningNotificationToOnlineTrainers(createdWarning);
          }
          // if (detectDangeous(detectionData)) {
          //   console.log('Dangerous');
          //   // const createdWarning = await createWarning({
          //   //   content: 'Wrong position',
          //   //   image,
          //   // });
          //   // await sendWarningNotificationToOnlineTrainers(createdWarning);
          // }
        } catch (_) {
          console.log(_);
          // Do nothing
        }
        store.dispatch({
          payload: {
            detectionStatus: 'READY',
            key,
          },
          type: TYPES.UPDATE_CAMERA,
        });
      };
      const detectionInterval = setInterval(() => {
        const cameraToDetect = store
          .getState()
          .cameras.find(s => s.key === key);
        if (cameraToDetect && cameraToDetect.detectionStatus === 'READY') {
          detectCamera(cameraToDetect);
        }
      }, delay);
      // Create new camera
      store.dispatch({
        payload: {
          detectionData: null,
          detectionInterval,
          detectionStatus: 'READY',
          key,
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
    socket.emit('desktop-stream-camera-succeeded', { key });
  };
  const cameraObservable = fromEvent(socket, 'desktop-stream-camera');
  const cameraSubscriber = cameraObservable.subscribe({
    next(data) {
      handleDesktopCameraStream(data);
    },
  });
  socket.on('desktop-pause-camera', ({ key }) => {
    removeCamera(key);
  });

  return () => {
    cameraSubscriber.unsubscribe();
  };
};

const removeCamera = key => {
  const cameraToRemove = store.getState().cameras.find(s => s.key === key);
  clearInterval(cameraToRemove?.detectionInterval);
  store.dispatch({
    payload: {
      key,
    },
    type: TYPES.REMOVE_CAMERA,
  });
};
