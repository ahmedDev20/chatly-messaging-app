import React, { useRef, useState } from 'react';
import ReactImageAppear from 'react-image-appear';
import { useStateValue } from '../../context/provider';
import { firebase, db, storage } from '../../config/firebase';

import 'animate.css';
import 'react-sweet-progress/lib/style.css';
import { Button, makeStyles, TextField, Tooltip } from '@material-ui/core';
import { AttachFile, Cancel, Image, Send, Videocam } from '@material-ui/icons';
import { green, deepOrange, deepPurple } from '@material-ui/core/colors';
import { Progress } from 'react-sweet-progress';
import { SpeedDial, SpeedDialAction } from '@material-ui/lab';

const useStyles = makeStyles(() => ({
  hidden: {
    display: 'none !important',
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    zIndex: '2',
    display: 'flex',
    transition: '.4s',
    background: 'rgba(0, 0, 0, .7)',
    animation: 'fadeIn',
    animationDuration: '.5s',
  },
  uploadForm: {
    position: 'relative',
    bottom: 63,
    marginRight: 10,
  },
  uploadWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 10,
    margin: 'auto',
  },
  placeHolder: {
    height: '400px',
    width: '300px',
    background: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsform: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  file: {
    height: '100%',
    width: '100%',
    objectFit: 'cover',
    background: 'white',
    border: '2px solid lightcyan',
    borderRadius: 4,
    outline: 'none',
  },
  caption: {
    width: '100%',
    background: 'white',
    borderRadius: '4px',
  },
  actions: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionBtn: {
    color: 'white',
  },
  actionBtn__grn: {
    background: green[500],
    '&:hover': {
      background: green[800],
    },
  },
  spinner: {
    width: 80,
    textAlign: 'center',
    margin: '10px 0px',
    alignSelf: 'center',
    justifySelf: 'center',
    animation: 'fadeIn',
    animationDuration: '.3s',
  },
}));

function UploadForm() {
  const [{ upload, user, rooms }, dispatch] = useStateValue();
  const { file, uploading, progress } = upload;
  const [uploadTask, setUploadTask] = useState(null);
  const [caption, setCaption] = useState('');
  const [open, setOpen] = useState(false);
  const imageUploadRef = useRef(null);
  const videoUploadRef = useRef(null);
  const classes = useStyles();

  const previewFile = e => {
    const file = e.target.files[0];
    const blob = file;
    const fileType = file.type.split('/').shift();
    const fileExt = file.type.split('/').pop();
    const fileName = file.name;

    if (fileType !== 'image' && fileType !== 'video')
      return dispatch({ type: 'file_not_supported', error: 'This file type is not supported.' });

    const previewURL = URL.createObjectURL(file);
    dispatch({ type: 'file_selected', data: { type: fileType, name: fileName, previewURL, blob, ext: fileExt } });
  };

  const send = e => {
    e.preventDefault();
    dispatch({ type: 'messages_msg_sending' });
    setUploadTask(uploadFileToStorage(file));
  };

  const sendMessage = async msg => {
    try {
      await db.collection('messages').add(msg);
      await db.collection('rooms').doc(rooms.selectedRoom.id).update({ lastMsg: msg });

      dispatch({ type: 'messages_msg_sent' });
    } catch (e) {
      dispatch({ type: 'messages_msg_not_sent', error: e.message });
    }
  };

  const uploadFileToStorage = file => {
    const dir = file.type === 'image' ? 'messages/images/' : 'messages/videos/';
    const ref = dir + file.name;
    const storageRef = storage.ref(ref);
    const task = storageRef.put(file.blob);

    const onProgress = function (snapshot) {
      const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      dispatch({ type: 'file_uploading', data: { progress } });
    };
    const onError = function (error) {
      if (error.code === 'storage/canceled') return dispatch({ type: 'file_upload_cancled' });
      dispatch({ type: 'file_not_uploaded', error: error.message });
    };
    const onSuccess = async function () {
      try {
        const url = await storage.ref(ref).getDownloadURL();

        const msg = {
          roomId: rooms.selectedRoom.id,
          user: user.info,
          isFile: true,
          fileType: file.type,
          fileURL: url,
          caption,
          timestamp: firebase.firestore.Timestamp.now().toMillis(),
        };

        await sendMessage(msg);
      } catch (e) {
        dispatch({ type: 'file_not_uploaded', error: e.message });
      }
    };

    task.on('state_changed', onProgress, onError, onSuccess);
    return task;
  };

  const renderProgress = () => <Progress type="circle" percent={progress} status="success" />;

  const renderFilePreview = () => {
    if (!file) return;

    if (file.type === 'image') return <ReactImageAppear src={file.previewURL} className={classes.file} />;
    else if (file.type === 'video') return <video className={classes.file} src={file.previewURL} muted controls></video>;
  };

  const renderAll = () => {
    if (!upload.selected) return;

    return (
      <div className={classes.uploadWrapper}>
        <div className={classes.placeHolder}>{uploading ? renderProgress() : renderFilePreview()}</div>

        <form onSubmit={send} className={classes.actionsform}>
          <TextField
            placeholder="Caption"
            variant="outlined"
            className={classes.caption}
            value={caption}
            onChange={e => setCaption(e.target.value)}
            disabled={uploading}
          />

          <div className={classes.actions}>
            <Button
              className={classes.actionBtn}
              variant="contained"
              color="secondary"
              startIcon={<Cancel />}
              onClick={() => uploadTask.cancel()}
            >
              Cancel
            </Button>

            <Button
              className={`${classes.actionBtn} ${classes.actionBtn__grn}`}
              variant="contained"
              type="submit"
              startIcon={<Send />}
              disabled={uploading}
            >
              Send
            </Button>
          </div>
        </form>
      </div>
    );
  };

  const uploadActions = [
    {
      icon: <Image style={{ color: deepOrange[500] }} />,
      name: 'Upload image',
      onClick: () => imageUploadRef.current.click(),
    },
    {
      icon: <Videocam style={{ color: deepPurple[500] }} />,
      name: 'Upload video',
      onClick: () => videoUploadRef.current.click(),
    },
  ];

  return (
    <React.Fragment>
      <div className={classes.uploadForm}>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          type="file"
          ref={imageUploadRef}
          onChange={previewFile}
          onClick={e => (e.target.value = null)}
        />

        <input
          accept="video/*"
          style={{ display: 'none' }}
          type="file"
          ref={videoUploadRef}
          onChange={previewFile}
          onClick={e => (e.target.value = null)}
        />

        <Tooltip title="Upload media">
          <SpeedDial
            ariaLabel="SpeedDial openIcon example"
            icon={<AttachFile />}
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            open={open}
          >
            {uploadActions.map(action => (
              <SpeedDialAction key={action.name} icon={action.icon} tooltipTitle={action.name} onClick={action.onClick} />
            ))}
          </SpeedDial>
        </Tooltip>
      </div>

      <div className={`${classes.container} ${upload.selected ? '' : classes.hidden}`}>{renderAll()}</div>
    </React.Fragment>
  );
}

export default UploadForm;
