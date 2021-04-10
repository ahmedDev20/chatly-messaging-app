import React, { useState } from 'react';
import { useStateValue } from '../../context/provider';
import { db } from '../../config/firebase';
import { validateForm } from '../../utils/validator';
import Joi from 'joi';

import { Button, FormControl, TextField, FormHelperText, Fade } from '@material-ui/core';

const schema = Joi.object({
  username: Joi.string().min(6).max(30).alphanum().trim().required().label('Username'),
});

const UsernameForm = props => {
  const [{ user }, dispatch] = useStateValue();
  const { classes } = props;
  const [submitted, setSubmitted] = useState(false);
  const [username, setUsername] = useState('');
  const [formErrors, setFormErrors] = useState({
    username: '',
  });

  const updateUsername = async (uid, username) => {
    try {
      await db.doc(`users/${uid}`).update({ username });

      const doc = await db.doc(`users/${uid}`).get();
      const user = doc.data();

      setSubmitted(false);
      dispatch({ type: 'user_registred', user });
      dispatch({ type: 'registration_advanced', step: 3 });
    } catch (error) {
      setSubmitted(false);
      dispatch({ type: 'user_error_caught', error: error.message });
    }
  };

  const handleSubmit = e => {
    e.preventDefault();

    const errors = validateForm({ username }, schema);
    setFormErrors(errors || '');
    if (errors) return;

    setSubmitted(true);
    updateUsername(user.info.uid, username);
  };

  return (
    <form className={classes.form} onSubmit={handleSubmit}>
      <FormControl className={classes.input}>
        <TextField
          label="Enter your Username"
          error={!!formErrors.username}
          type="text"
          name="username"
          variant="outlined"
          value={username}
          onChange={event => setUsername(event.target.value)}
        />
        <Fade in={!!formErrors.username}>
          <FormHelperText error={!!formErrors.username}>{formErrors.username}</FormHelperText>
        </Fade>
      </FormControl>

      <Button
        className={classes.loginBtn}
        variant="contained"
        color="primary"
        type="submit"
        disabled={!username || submitted}
      >
        {submitted ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
};

export default UsernameForm;
