import React, { useState } from 'react';
import { useStateValue } from '../../context/provider';
import { db, storage } from '../../config/firebase';
import ImageUploader from 'react-images-upload';
import { useHistory } from 'react-router-dom';

import { Button, Fade, makeStyles, Typography } from '@material-ui/core';
import { red } from '@material-ui/core/colors';

const useStyles = makeStyles(() => ({
  customForm: {
    width: '400px',
    '& > *': {
      margin: '5px 0',
    },
  },
  imgUploader: {
    border: '2px solid lightgray',
    borderRadius: 4,
  },
  avatarPreview: {
    position: 'relative',
    width: '150px',
    borderRadius: 4,
    padding: 5,
    border: '1px solid lightgray',
    '& > img': {
      width: '100%',
    },
  },
  closeBtn: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    width: '25px',
    height: '25px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
    boxShadow: '-2px 2px 10px rgb(0 0 0 / 40%)',
    background: red[500],
    color: 'white',
    cursor: 'pointer',
    fontSize: 15,
    borderRadius: '50%',
    transition: '.3s',
    '&:hover': {
      background: red[700],
    },
  },
  actions: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  skipBtn: {
    background: 'lightgray',
    borderRadius: 2,
    fontFamily: '"Roboto", sans-serif',
    transition: '.3s',
    '&  a': {
      color: '#333',
      textDecoration: 'none',
    },
    '&:hover': {
      background: 'darkgray',
    },
  },
}));

const AvatarForm = props => {
  const [{ upload, user }, dispatch] = useStateValue();
  const { style } = props;
  const [submitted, setSubmitted] = useState(false);

  const classes = { ...style, ...useStyles() };
  const history = useHistory();

  const onDrop = (files, previewURL) => {
    const file = files[0];
    if (!file) return;

    const fileExt = file.type.split('/').pop();

    dispatch({
      type: 'file_selected',
      data: {
        blob: file,
        name: file.name,
        type: 'image',
        ext: fileExt,
        previewURL,
      },
    });
  };

  const deleteImage = () => dispatch({ type: 'file_not_selected' });

  const uploadPictureToStorage = (uid, picture) => {
    const ref = `avatars/${uid}.${picture.ext}`;
    const storageRef = storage.ref(ref);
    const task = storageRef.put(picture.blob);

    const progress = snapshot => {
      const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      dispatch({ type: 'file_uploading', data: { progress } });
    };
    const err = e => {
      dispatch({ type: 'file_not_uploaded', error: 'Sorry. Something happend.' });
    };

    const success = async () => {
      try {
        const url = await storage.ref(ref).getDownloadURL();
        updateUserPicture(uid, url);
      } catch (e) {
        dispatch({ type: 'file_not_uploaded', error: 'Sorry. Something happend.' });
      }
    };
    task.on('state_changed', progress, err, success);
  };

  const updateUserPicture = async (uid, picture) => {
    try {
      await db.doc(`users/${uid}`).update({ picture });

      dispatch({ type: 'registration_picture_updated', picture });
      history.push('/chatroom');
    } catch (error) {
      dispatch({ type: 'file_not_uploaded', error: 'Sorry. Something happend.' });
      setSubmitted(false);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    uploadPictureToStorage(user.info.uid, upload.file);
  };

  const skip = () => {
    dispatch({ type: 'registration_picture_skipped' });
    history.push('/rooms/0');
  };

  return (
    <div className={`${classes.form} ${classes.customForm}`}>
      <Typography component="h6" variant="body2" color="textSecondary">
        Choose your profile picture
      </Typography>

      {!upload.selected ? (
        <Fade in={!upload.selected} exit={upload.selected}>
          <ImageUploader
            className={classes.imgUploader}
            withIcon={true}
            buttonText="Upload"
            onChange={onDrop}
            singleImage={true}
            imgExtension={['.jpg', 'jpeg', '.gif', '.png']}
            maxFileSize={5242880}
          />
        </Fade>
      ) : (
        <Fade in={upload.selected} exit={!upload.selected}>
          <div className={classes.avatarPreview}>
            <img src={upload.file.previewURL} alt="preview avatar pic" />
            <div className={classes.closeBtn} onClick={deleteImage}>
              &#10006;
            </div>
          </div>
        </Fade>
      )}

      <div className={classes.actions}>
        <Button disabled={submitted} variant="contained" className={classes.skipBtn} onClick={skip}>
          Skip
        </Button>
        <Button disabled={!upload.selected || submitted} variant="contained" color="primary" onClick={handleSubmit}>
          Apply
        </Button>
      </div>
    </div>
  );
};

export default AvatarForm;
