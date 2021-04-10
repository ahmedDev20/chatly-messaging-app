export const validateForm = (data, schema) => {
  const options = { abortEarly: false };
  const { error } = schema.validate(data, options);
  if (!error) return null;

  const errors = {};
  for (const item of error.details) errors[item.path[0]] = item.message.replace(/"+/g, '');

  return errors;
};
