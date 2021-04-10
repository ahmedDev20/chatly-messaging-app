import React from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  modal: {
    cursor: 'initial',
    opacity: 0,
    display: 'flex',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,.7)',
    zIndex: '2',
    animation: 'fadeIn forwards',
    animationDuration: '.3s',
  },
  img: {
    maxHeight: '70%',
    margin: 'auto',
    boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.3)',
    background: 'white',
    animation: 'zoomIn forwards',
    animationDuration: '.2s',
  },
}));

function ImageModal({ src, onCloseImage }) {
  const classes = useStyles();

  return (
    <div className={classes.modal} onClick={onCloseImage}>
      <img src={src} className={`${classes.img}`} alt="Expanded attachment" onError={e => e.target.remove()} />
    </div>
  );
}

export default ImageModal;
