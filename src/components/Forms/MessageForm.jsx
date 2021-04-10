import React, { useState } from 'react';
import { firebase, db } from '../../config/firebase';
import { useStateValue } from '../../context/provider';
import UploadForm from './UploadForm';

import { FormControl, IconButton, makeStyles, TextField } from '@material-ui/core';
import { AccessTime, Send } from '@material-ui/icons';

const useStyles = makeStyles(theme => ({
  container: {
    height: '15%',
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    paddingLeft: '10px',
    borderTop: '2px solid lightgray',
    borderLeft: '2px solid lightgray',
    background: 'white',
  },
  textForm: {
    flex: 1,
  },
  inputField: {
    border: '2px solid #bbbbbb',
    borderRadius: '50px',
    height: '50px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textInput: {
    '& fieldset': {
      outline: 'none',
      border: 'none',
    },
  },
}));

function MessageForm() {
  const [{ user, rooms }, dispatch] = useStateValue();
  const [input, setInput] = useState('');
  const [canType, setCanType] = useState(true);
  const [canSend, setCanSend] = useState(true);

  const classes = useStyles();

  const storeMessageInDb = async msg => {
    await db.collection('messages').add(msg);
    await db.collection('rooms').doc(rooms.selectedRoom.id).update({ lastMsg: msg });
  };

  const send = async e => {
    e.preventDefault();
    if (!input.trim()) return;

    setInput('');
    dispatch({ type: 'messages_msg_sending' });

    const msg = {
      roomId: rooms.selectedRoom.id,
      user: user.info,
      message: input,
      timestamp: firebase.firestore.Timestamp.now().toMillis(),
    };

    try {
      await storeMessageInDb(msg);
      dispatch({ type: 'messages_msg_sent' });
    } catch (error) {
      dispatch({ type: 'message_not_sent', error });
    }
  };

  const handleTextChange = e => {
    setInput(e.target.value);
    if (!e.target.value.trim()) return setCanSend(false);

    setCanType(true);
    setCanSend(true);
  };

  return (
    <div className={classes.container}>
      <UploadForm />

      <form className={classes.textForm}>
        <FormControl className={classes.inputField}>
          <TextField
            disabled={!canType}
            className={classes.textInput}
            variant="outlined"
            type="text"
            placeholder="Enter a message ..."
            value={input}
            onChange={handleTextChange}
            autoFocus
          />

          {canSend || canType ? (
            <IconButton disabled={!canSend} variant="contained" color="primary" type="submit" onClick={send}>
              <Send />
            </IconButton>
          ) : (
            <IconButton variant="contained" color="secondary">
              <AccessTime />
            </IconButton>
          )}
        </FormControl>
      </form>
    </div>
  );
}

export default MessageForm;
