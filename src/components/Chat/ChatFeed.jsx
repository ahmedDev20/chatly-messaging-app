import React from 'react';
import { useStateValue } from '../../context/provider';
import Bar from './Bar';
import Members from './Members';
import Messages from './Messages';
import MessageForm from '../Forms/MessageForm';

import 'animate.css';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
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
  content: {
    width: '75vw',
    display: 'flex',
    flexDirection: 'column',
    background: `url(${require('../../assets/img/bg3.png')})`,
    backgroundSize: 'cover',
  },
}));

function ChatFeed() {
  const [{ rooms }] = useStateValue();
  const classes = useStyles();

  return (
    <div className={`${classes.content}`}>
      <Bar />
      {rooms.selectedRoom.id ? (
        <React.Fragment>
          <Members />
          <Messages />
          <MessageForm />
        </React.Fragment>
      ) : (
        <div className={classes.startChat}>
          <img src={require('../../assets/img/start-chat.svg')} alt="Select or Create a room to start Chatting" />
          <h2>Select or Create a room to start Chatting</h2>
        </div>
      )}
    </div>
  );
}

export default ChatFeed;
