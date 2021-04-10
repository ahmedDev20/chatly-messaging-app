import React, { useState } from 'react';
import AvatarForm from './AvatarForm';
import { useStateValue } from '../../context/provider';
import { validateForm } from '../../utils/validator';
import { Link } from 'react-router-dom';
import { auth, db } from '../../config/firebase';
import Joi from 'joi';

import { Button, FormControl, TextField, FormHelperText, Fade, Typography, makeStyles, Paper } from '@material-ui/core';
import 'animate.css';
import appLogo from '../../assets/img/logo.png';

const registerSchema = Joi.object({
  username: Joi.string().min(5).max(20).trim().required().label('Username'),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .trim()
    .required()
    .label('Email'),
  password: Joi.string().min(6).max(20).required().label('Password'),
  passwordConfirm: Joi.string()
    .min(6)
    .max(20)
    .valid(Joi.ref('password'))
    .required()
    .label('Confirmation password')
    .messages({ 'any.only': '{{#label}} does not match' }),
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

function RegisterForm() {
  const [{ user }, dispatch] = useStateValue();
  const [submitted, setSubmitted] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const classes = useStyles();

  const registerUser = async user => {
    try {
      const res = await auth.createUserWithEmailAndPassword(user.email, user.password);
      const data = { uid: res.user.uid, username: user.username, email: user.email };
      await db.doc(`users/${data.uid}`).set(data);

      setSubmitted(false);
    } catch (error) {
      setSubmitted(false);
      handleError(error);
    }
  };

  const handleError = error => {
    switch (error.code) {
      case 'auth/email-already-in-use':
        setFormErrors({
          email: error.message,
          password: '',
        });
        break;
      case 'auth/invalid-email':
        setFormErrors({
          email: error.message,
          password: '',
        });
        break;
      case 'auth/weak-password':
        setFormErrors({
          email: error.message,
          password: '',
        });

        break;

      default:
        dispatch({ type: 'error_caught', error });
        break;
    }
  };

  const handleSubmit = e => {
    e.preventDefault();

    const data = { username, email, password, passwordConfirm };
    const errors = validateForm(data, registerSchema);
    setFormErrors(errors || '');
    if (errors) return;

    const user = { username: data.username, email: data.email, password: data.password };
    setSubmitted(true);
    registerUser(user);
  };

  const renderForm = () => {
    switch (user.registration.step) {
      case 2:
        return <AvatarForm style={classes} />;

      default:
        return (
          <Paper className={classes.root}>
            <img className={classes.logo} src={appLogo} alt="Chatly logo" />
            <form className={classes.form} onSubmit={handleSubmit}>
              <FormControl className={classes.input}>
                <TextField
                  label="Enter your username"
                  error={Boolean(formErrors.username)}
                  type="text"
                  name="username"
                  variant="outlined"
                  value={username}
                  onChange={event => setUsername(event.target.value)}
                />
                <Fade in={Boolean(formErrors.username)}>
                  <FormHelperText error={Boolean(formErrors.username)}>{formErrors.username}</FormHelperText>
                </Fade>
              </FormControl>

              <FormControl className={classes.input}>
                <TextField
                  label="Enter your email"
                  error={Boolean(formErrors.email)}
                  type="text"
                  name="email"
                  variant="outlined"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                />
                <Fade in={Boolean(formErrors.email)}>
                  <FormHelperText error={Boolean(formErrors.email)}>{formErrors.email}</FormHelperText>
                </Fade>
              </FormControl>

              <FormControl className={classes.input}>
                <TextField
                  label="Enter your password"
                  error={Boolean(formErrors.password)}
                  type="password"
                  name="password"
                  variant="outlined"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                />
                <Fade in={Boolean(formErrors.password)}>
                  <FormHelperText error={Boolean(formErrors.password)}>{formErrors.password}</FormHelperText>
                </Fade>
              </FormControl>

              <FormControl className={classes.input}>
                <TextField
                  label="Confirm your password"
                  className={classes.input}
                  error={Boolean(formErrors.confirmPassword)}
                  type="password"
                  name="password-confirm"
                  variant="outlined"
                  value={passwordConfirm}
                  onChange={event => setPasswordConfirm(event.target.value)}
                />
                <Fade in={Boolean(formErrors.passwordConfirm)}>
                  <FormHelperText error={Boolean(formErrors.passwordConfirm)}>{formErrors.passwordConfirm}</FormHelperText>
                </Fade>
              </FormControl>

              <Button
                className={classes.loginBtn}
                variant="contained"
                color="primary"
                type="submit"
                disabled={!(email && password && passwordConfirm) || submitted}
              >
                {submitted ? 'Signing up...' : 'Sign Up'}
              </Button>

              <Typography component="p" color="textSecondary">
                Already have an account?{' '}
                <Link className={classes.loginLink} to="/">
                  Login
                </Link>
              </Typography>
            </form>
          </Paper>
        );
    }
  };

  return renderForm();
}

export default RegisterForm;
