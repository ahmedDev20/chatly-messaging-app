import React, { useEffect, useRef, useState } from 'react';
import Message from './Message';
import { useStateValue } from '../../context/provider';
import { db } from '../../config/firebase';

import { makeStyles } from '@material-ui/core';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import 'animate.css';

const useStyles = makeStyles(() => ({
  messagesContainer: {
    height: '80vh',
    display: 'flex',
    flexDirection: 'column-reverse',
    overflowY: 'auto',
  },
  backToBottom: {
    width: 40,
    height: 40,
    position: 'absolute',
    right: '20px',
    bottom: '120px',
    zIndex: '1',
    cursor: 'pointer',
    background: '#f1c40f',
    padding: '10px',
    borderRadius: '50%',
    boxShadow: '2px 2px 10px rgba(0, 0, 0, .4)',
    transition: '.2s',
    animation: 'fadeInUpBig',
    animationDuration: '.4s',
    '&:hover': {
      background: '#cda609',
    },
  },
  hidden: {
    animation: 'fadeOutDownBig forwards',
    animationDuration: '1s',
  },
  loading: {
    width: 50,
    margin: 'auto',
    alignSelf: 'center',
    justifySelf: 'center',
  },
}));

function Messages() {
  const [{ messages, rooms }, dispatch] = useStateValue();
  const [lastDoc, setLastDoc] = useState(0);
  const [isFarFromBottom, setIsFarFromBottom] = useState(false);
  const [isThereMore, setIsThereMore] = useState(Boolean(lastDoc));
  const classes = useStyles();
  const divRef = useRef(null);

  const handleScroll = () => {
    const scrolled = Math.abs(divRef.current.scrollTop);
    const left = divRef.current.clientHeight;
    const total = divRef.current.scrollHeight;
    const limit = total / 3;

    if (scrolled > limit) setIsFarFromBottom(true);
    else setIsFarFromBottom(false);

    if (scrolled + left >= total - 5) {
      if (!messages.loadingMore && isThereMore) loadMore();
    }
  };

  const scrollBackToBottom = () => {
    setIsFarFromBottom(false);
    divRef.current.scrollTop = 0;
  };

  const loadMore = async () => {
    dispatch({ type: 'messages_more_requested' });

    try {
      const data = await db
        .collection('messages')
        .where('roomId', '==', rooms.selectedRoom.id)
        .orderBy('timestamp', 'desc')
        .limit(20)
        .startAfter(lastDoc)
        .get();

      const lastdoc = data.docs[19];

      setLastDoc(lastdoc);
      setIsThereMore(Boolean(lastdoc));

      if (data.empty) return;

      const messages = data.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      dispatch({ type: 'messages_more_received', data: messages });
    } catch (error) {
      dispatch({ type: 'messages_not_received', error });
    }
  };

  const addMessagesListener = () => {
    dispatch({ type: 'messages_requested' });

    const successHandler = snap => {
      const lastdoc = snap.docs[19];
      setLastDoc(lastdoc);
      setIsThereMore(Boolean(lastdoc));
      scrollBackToBottom();

      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [];
      dispatch({ type: 'messages_received', data });
    };

    const errorHandler = error => dispatch({ type: 'messages_not_received', message: error.message });

    return db
      .collection('messages')
      .where('roomId', '==', rooms.selectedRoom.id)
      .orderBy('timestamp', 'desc')
      .limit(messages.limit)
      .onSnapshot(successHandler, errorHandler);
  };

  useEffect(addMessagesListener, [rooms.selectedRoom.id]);

  useEffect(() => {
    if (messages.sent) scrollBackToBottom();
  }, [messages.sent]);

  return (
    <div className={classes.messagesContainer} onScroll={handleScroll} ref={divRef}>
      {messages.loading ? <img src={require('../../assets/img/loading.svg')} alt="Loading messages" className={classes.loading} /> : null}

      <ArrowDownwardIcon className={`${classes.backToBottom} ${isFarFromBottom ? '' : classes.hidden}`} onClick={scrollBackToBottom} />

      {messages.list.map(message => (
        <Message key={message.id} message={message} />
      ))}
    </div>
  );
}

export default Messages;
