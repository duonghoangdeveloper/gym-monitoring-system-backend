import sharp from 'sharp';

import { deleteDirectoryS3, uploadFileS3 } from '../../common/s3';
import { throwError } from '../../common/services';
import { Face } from './face.model';

export const uploadFaces = async (user, files) => {
  try {
    const streams = await Promise.all(
      files.map(async file => {
        const { createReadStream, mimetype } = await file;
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
          throwError('Input file is not an image', 415);
        }

        // Create stream from file & compress
        const transform = sharp().toFormat('png');
        const stream = createReadStream().pipe(transform);

        return stream;
      })
    );

    const result = await Promise.all(
      streams.map(async (stream, i) =>
        uploadFileS3(`face/${user._id}/${i}`, stream, 'image/png')
      )
    );

    const faces = result.map(data => ({
      key: data.Key,
      url: data.Location,
      user: user._id.toString(),
    }));

    const createdFaces = await Face.create(faces);
    return createdFaces;
  } catch (_) {
    try {
      await Promise.all([deleteDirectoryS3(`face/${user._id}`), user.remove()]);
    } catch (__) {
      // Do nothing
    }
  }
};
