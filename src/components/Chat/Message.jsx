import React from 'react';
import { useStateValue } from '../../context/provider';
import EventMessage from './EventMessage';
import FileMessage from './FileMessage';
import TextMessage from './TextMessage';

import { makeStyles } from '@material-ui/core';
import 'animate.css';

const useStyles = makeStyles(theme => ({
  card: {
    position: 'relative',
    width: 'fit-content',
    margin: '10px',
    animation: 'fadeIn',
    animationDuration: '.6s',
    overflow: 'visible',
    '&::before': {
      content: '""',
      height: '20px',
      width: '20px',
      position: 'absolute',
      background: '#e9e9eb',
      left: -7,
      clipPath: 'polygon(100% 100%, 100% 0, 0 0)',
    },
  },
  userCard: {
    color: 'white !important',
    marginLeft: 'auto',
    '&::before': {
      background: '#0b81ff',
      left: 'auto',
      right: -7,
      clipPath: 'polygon(0 99%, 100% 0, 0 0)',
    },
  },
  cardContent: {
    minWidth: 220,
    display: 'flex',
    flexDirection: 'column',
    padding: '10px !important',
    backgroundColor: '#e9e9eb !important',
    maxWidth: '300px',
    borderRadius: 4,
    '& > h2': {
      fontSize: '18px !important',
      wordBreak: 'break-word',
    },
  },
  userCardContent: {
    backgroundColor: '#0b81ff !important',
    '& > small': {
      color: 'white',
    },
  },
  attachment: {
    maxWidth: 300,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  avatar: {
    marginRight: 5,
  },
  userName: {
    marginBottom: '5px',
    fontWeight: 'bold',
  },
  arrow: {
    width: '10px',
    height: '15px',
    position: 'absolute',
    clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
    backgroundColor: '#e9e9eb',
    left: '4px',
  },
  userArrow: {
    clipPath: 'polygon(100% 0, 0 0, 0 100%)',
    backgroundColor: '#0b81ff',
    right: '4px',
    left: 'initial',
  },
  time: {
    fontSize: 10,
    marginTop: 5,
    textAlign: 'right',
  },
}));

const Message = ({ message }) => {
  const [{ user }] = useStateValue();
  const isUser = user.info.uid === message.user.uid;
  const classes = useStyles();

  if (message.isEvent) return <EventMessage message={message} style={classes} />;
  else if (message.isFile) return <FileMessage style={classes} message={message} isUser={isUser} />;

  return <TextMessage style={classes} message={message} isUser={isUser} />;
};

export default Message;
