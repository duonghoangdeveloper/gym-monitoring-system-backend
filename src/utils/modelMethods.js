export const generateSchemaStringField = (
  fieldName,
  minLength = 1,
  maxLength = 10000
) => ({
  type: String,
  minLength:
    typeof minLength === 'number'
      ? [
          minLength,
          `${fieldName.replace(/^\w/, c =>
            c.toUpperCase()
          )} must not be shorter than ${minLength} character`,
        ]
      : null,
  maxLength:
    typeof maxLength === 'number'
      ? [
          maxLength,
          `${fieldName.replace(/^\w/, c =>
            c.toUpperCase()
          )} must not be longer than ${maxLength} characters`,
        ]
      : null,
  trim: true,
});

export const generateSchemaArrayField = (
  fieldName,
  minLength = 0,
  maxLength = 10
) => ({
  required: true,
  default: [],
  validate: {
    validator: array => array.length >= minLength && array.length <= maxLength,
    message: `Length of ${fieldName} array is invalid`,
  },
});

export const generateSchemaEnumField = _enum => ({
  type: String,
  enum: _enum,
  default: _enum[0],
  required: true,
});
