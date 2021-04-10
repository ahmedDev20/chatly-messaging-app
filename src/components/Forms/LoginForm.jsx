import React, { useEffect, useState } from 'react';
import { useStateValue } from '../../context/provider';
import { validateForm } from '../../utils/validator';
import { Link, useHistory } from 'react-router-dom';
import { auth, db } from '../../config/firebase';
import Joi from 'joi';

import { Button, FormControl, TextField, FormHelperText, Fade, Typography, Paper, makeStyles } from '@material-ui/core';
import 'animate.css';
import appLogo from '../../assets/img/logo.png';

const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .trim()
    .required()
    .label('Email'),
  password: Joi.string().min(6).max(20).required().label('Password'),
});

const useStyles = makeStyles(() => ({
  root: {
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px',
  },
  logo: {
    width: '100px',
  },
  form: {
    width: '400px',
    padding: '20px',
    paddingTop: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    animation: 'fadeIn',
    animationDuration: '.7s',
    '& > *': {
      margin: '10px 0px',
    },
  },
  input: {
    width: '100%',
  },
  registerLink: {
    textDecoration: 'none',
    color: 'dodgerblue',
    transition: '.5s',
    '&:hover': {
      color: 'darkblue',
    },
  },
}));

function LoginForm() {
  const [, dispatch] = useStateValue();
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({ email: '', password: '' });
  const history = useHistory();
  const classes = useStyles();

  const getUserDataFromDb = async uid => {
    try {
      const doc = await db.doc(`users/${uid}`).get();
      return doc.data();
    } catch (error) {
      dispatch({ type: 'user_error_caught', error: error.message });
    }
  };

  const loginUser = async user => {
    try {
      const res = await auth.signInWithEmailAndPassword(user.email, user.password);
      const data = await getUserDataFromDb(res.user.uid);

      setSubmitted(false);
      dispatch({ type: 'user_loggedIn', data });

      history.push('/chatroom');
    } catch (error) {
      setSubmitted(false);
      handleLoginError(error);
    }
  };

  const handleLoginError = error => {
    switch (error.code) {
      case 'auth/invalid-email':
        setFormErrors({
          email: error.message,
          password: '',
        });
        break;

      case 'auth/user-not-found':
        setFormErrors({
          email: 'Incorrect email. No user found with this email',
          password: '',
        });
        break;

      case 'auth/wrong-password':
        setFormErrors({
          email: '',
          password: 'Invalid Password',
        });
        break;

      default:
        dispatch({ type: 'user_error_caught', error });
        break;
    }
  };

  const handleSubmit = e => {
    e.preventDefault();

    const user = { email, password };
    const errors = validateForm(user, loginSchema);
    setFormErrors(errors || '');
    if (errors) return;

    setSubmitted(true);
    loginUser(user);
  };

  useEffect(() => {
    auth.onAuthStateChanged(async user => {
      if (user) {
        setSubmitted(true);
        const data = await getUserDataFromDb(user.uid);
        dispatch({ type: 'user_loggedIn', data });
        history.push('/chatroom');
      } else {
        dispatch({ type: 'user_loggedOut' });
      }
    });
    // eslint-disable-next-line
  }, [dispatch, history]);

  return (
    <Paper className={classes.root}>
      <img className={classes.logo} src={appLogo} alt="Chatly logo" />

      <form className={classes.form} onSubmit={handleSubmit}>
        <FormControl className={classes.input}>
          <TextField
            label="Enter your email"
            error={!!formErrors.email}
            type="text"
            name="email"
            variant="outlined"
            value={email}
            onChange={event => setEmail(event.target.value)}
          />
          <Fade in={!!formErrors.email}>
            <FormHelperText error={!!formErrors.email}>{formErrors.email}</FormHelperText>
          </Fade>
        </FormControl>
        <FormControl className={classes.input}>
          <TextField
            label="Enter your password"
            error={!!formErrors.password}
            type="password"
            name="password"
            variant="outlined"
            value={password}
            onChange={event => setPassword(event.target.value)}
          />
          <Fade in={!!formErrors.password}>
            <FormHelperText error={!!formErrors.password}>{formErrors.password}</FormHelperText>
          </Fade>
        </FormControl>
        <Button className={classes.loginBtn} variant="contained" color="primary" type="submit" disabled={!(email && password) || submitted}>
          {submitted ? 'Logging in...' : 'Login'}
        </Button>
        <Typography component="p" color="textSecondary" align="left">
          Dont have an account?{' '}
          <Link className={classes.registerLink} to="/register">
            Register
          </Link>
        </Typography>
      </form>
    </Paper>
  );
}

export default LoginForm;
