import { Typography } from '@material-ui/core';
import React from 'react';
import AlertSnackBar from './Utils/AlertSnackBar';

import { makeStyles, Paper, useMediaQuery, useTheme } from '@material-ui/core';
import { useStateValue } from '../context/provider';

const useStyles = makeStyles(theme => ({
  container: {
    height: '90vh',
    width: '95vw',
    margin: 'auto',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '0px !important',
    backgroundColor: '#f4f4f2',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    background: `url(${require('../assets/img/bg2.jpg')})`,
    backgroundSize: 'cover',
  },
  containerMobile: {
    height: '100vh',
  },
  title: {
    margin: 'auto',
    color: 'white',
    fontFamily: "'Potta One', cursive",
    textShadow: 'rgba(0,0,0,.2) 2px 6px 5px',
  },
}));

function Welcome(props) {
  const [{ error }] = useStateValue();
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));

  return (
    <Paper elevation={3} className={`${classes.container} ${isMobile ? classes.containerMobile : ''}`}>
      <Typography variant="h4" className={classes.title}>
        Chatly,
        <br /> instant chatting app
      </Typography>
      {props.children}

      {error.message ? <AlertSnackBar severity="error" message={error.message} /> : null}
    </Paper>
  );
}

export default Welcome;
