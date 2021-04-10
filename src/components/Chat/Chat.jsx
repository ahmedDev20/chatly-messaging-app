import React from 'react';
import { useStateValue } from '../../context/provider';
import Rooms from './Rooms';
import ChatFeed from './ChatFeed';
import AlertSnackBar from '../Utils/AlertSnackBar';

import 'animate.css';
import { makeStyles, useMediaQuery, useTheme } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  chatRoom: {
    height: '100%',
    width: '100%',
    margin: 'auto',
    display: 'flex',
    position: 'relative',
    fontFamily: "'Nunito', sans-serif",
    animation: 'fadeIn',
    animationDuration: '.8s',
  },
  startChat: {
    flex: 1,
    background: 'antiquewhite',
    display: 'flex',
    flexDirection: 'column',
    padding: '50px',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderLeft: '1px solid lightgray',
    '&>img': {
      width: '70%',
    },
    '&>h2': {},
  },
  chatRoomMobile: {
    height: '92vh',
  },
}));

function Chat() {
  const [{ error }] = useStateValue();
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));

  return (
    <div className={`${classes.chatRoom} ${isMobile ? classes.chatRoomMobile : ''}`}>
      <Rooms />
      <ChatFeed />
      {error.message ? <AlertSnackBar severity="error" message={error.message} /> : null}
    </div>
  );
}

export default Chat;
