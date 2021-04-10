import React, { useRef, useState } from 'react';
import ImageUploader from 'react-images-upload';
import Joi from 'joi';
import { firebase, db, storage } from '../../config/firebase';

import { Button, Fade, FormControl, FormHelperText, IconButton, makeStyles, TextField } from '@material-ui/core';
import 'animate.css';
import { Close, PhotoCamera } from '@material-ui/icons';
import { useStateValue } from '../../context/provider';

const useStyles = makeStyles(theme => ({
  formContainer: {
    width: '100vw',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    display: 'flex',
    zIndex: 5,
    background: 'rgba(0, 0, 0, .8)',
    animation: 'fadeIn',
    animationDuration: '.4s',
  },
  roomForm: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto',
    width: 400,
    padding: 20,
    borderRadius: 4,
    background: 'white',
    gap: 10,
  },
  imgUploader: {
    width: 200,
    height: 200,
    border: '2px solid lightgray',
    borderRadius: '50%',
    position: 'relative',
    display: 'flex',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  iconPreview: {
    position: 'relative',
    alignSelf: 'center',
    overflow: 'hidden',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    border: '1px solid lightgray',
    '& > img': {
      width: 200,
      height: 200,
      objectFit: 'cover',
    },
    '&:hover > div': {
      opacity: 1,
    },
  },
  overlay: {
    opacity: 0,
    transition: '.4s',
    width: '100%',
    height: '100%',
    display: 'flex',
    position: 'absolute',
    top: 0,
    left: 0,
    background: 'rgba(0, 0, 0, .5)',
  },
  createBtn: {
    transition: '.4s',
    '&:hover': {
      background: theme.palette.secondary.main,
      color: theme.palette.secondary.contrastText,
    },
  },
  closeBtn: {
    background: theme.palette.error.light,
    position: 'absolute',
    top: 5,
    right: 5,
    color: 'white',
    '&:hover': {
      background: theme.palette.error.dark,
    },
  },
  closePreviewBtn: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  hidden: {
    display: 'none',
  },
}));

function RoomForm({ onClose }) {
  const [{ user }, dispatch] = useStateValue();
  const [roomName, setRoomName] = useState('');
  const [iconSelected, setIconSelected] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState({ previewURL: '', blob: null });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const classes = useStyles();
  const uploadRef = useRef(null);

  const handleSubmit = e => {
    e.preventDefault();

    const { error } = Joi.string().min(3).max(100).required().label('Room Name').validate(roomName);
    if (error) return setError(error.details[0].message);

    setError('');
    setSubmitted(true);
    uploadIconToStorage(selectedIcon);
  };

  const uploadIconToStorage = icon => {
    const dir = 'rooms_icons/';
    const ref = dir + icon.name;
    const storageRef = storage.ref(ref);
    const task = storageRef.put(icon.blob);

    const onSuccess = async () => {
      try {
        const iconUrl = await storageRef.getDownloadURL();
        createRoom(iconUrl);
        onClose();
      } catch (error) {
        dispatch({ type: 'rooms_room_not_created', error });
      } finally {
        setSubmitted(false);
      }
    };

    const onError = error => dispatch({ type: 'rooms_room_not_created', error });

    task.on(firebase.storage.TaskEvent.STATE_CHANGED, null, onError, onSuccess);
  };

  const createRoom = async iconURL => {
    const { id: roomId } = await db.collection('rooms').add({
      name: roomName,
      icon: iconURL,
      members: [{ ...user.info }],
      admin: {
        uid: user.info.uid,
        username: user.info.username,
      },
      createdAt: firebase.firestore.Timestamp.now().seconds,
    });

    const lastMsg = {
      roomId,
      isEvent: true,
      user: user.info,
      message: `${roomName} created 👏`,
      timestamp: firebase.firestore.Timestamp.now().toMillis(),
    };

    db.collection('rooms').doc(roomId).update({ lastMsg });
    db.collection('messages').add(lastMsg);
  };

  const onDrop = (files, previewURL) => {
    const file = files[0];
    if (!file) return;

    setIconSelected(true);
    setSelectedIcon({ previewURL, blob: file, name: file.name });
  };

  const deleteImage = () => {
    setIconSelected(false);
    setSelectedIcon({ previewURL: '', blob: null });
  };

  return (
    <div className={classes.formContainer}>
      <form className={classes.roomForm} onSubmit={handleSubmit}>
        <IconButton className={classes.closeBtn} size="small" onClick={onClose}>
          <Close fontSize="inherit" />
        </IconButton>

        {iconSelected ? (
          <Fade in={iconSelected} exit={!iconSelected}>
            <div className={classes.iconPreview}>
              <img src={selectedIcon.previewURL} alt="preview avatar pic" />
              <div className={`${classes.overlay} ${submitted ? classes.hidden : ''}`}>
                <IconButton className={`${classes.closeBtn} ${classes.closePreviewBtn}`} onClick={deleteImage}>
                  <Close />
                </IconButton>
              </div>
            </div>
          </Fade>
        ) : (
          <>
            <ImageUploader
              ref={uploadRef}
              className={classes.imgUploader}
              fileContainerStyle={{ margin: 0, padding: 0, width: '100%' }}
              errorStyle={{ textAlign: 'center' }}
              buttonStyles={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'gray',
                fontSize: 18,
                cursor: 'none',
                pointerEvents: 'none',
              }}
              buttonText="Room Icon"
              withLabel={false}
              withIcon={false}
              onChange={onDrop}
              imgExtension={['.jpg', '.jpeg', '.gif', 'svg', '.png']}
              singleImage={true}
              maxFileSize={5242880}
            />
            <Button variant="contained" color="primary" startIcon={<PhotoCamera />} onClick={() => uploadRef.current.triggerFileUpload()}>
              Upload Icon
            </Button>
          </>
        )}

        <FormControl className={classes.input}>
          <TextField
            autoFocus
            label="Room name"
            disabled={submitted}
            error={!!error}
            type="text"
            variant="outlined"
            value={roomName}
            onChange={event => setRoomName(event.target.value)}
          />
          <Fade in={!!error}>
            <FormHelperText error={!!error}>{error}</FormHelperText>
          </Fade>
        </FormControl>

        <Button disabled={!roomName || submitted} className={classes.createBtn} variant="outlined" color="secondary" type="submit">
          {submitted ? 'Creating...' : 'Create'}
        </Button>
      </form>
    </div>
  );
}

export default RoomForm;
