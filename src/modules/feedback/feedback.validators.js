import { throwError } from '../../common/services';

export const validateContent = content => {
  if (content.length < 1) {
    throwError('Content length must be 1 at minimum', 422);
  }
  if (content.length > 1000) {
    throwError('DisplayName length must be 3000 at maximum', 422);
  }
};
export const validateTitle = title => {
  if (title.length < 1) {
    throwError('Title length must be 1 at minimum', 422);
  }
  if (title.length > 300) {
    throwError('Title length must be 500 at maximum', 422);
  }
};
