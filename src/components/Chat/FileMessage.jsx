import React, { useState } from 'react';
import ImageModal from './ImageModal';
import moment from 'moment';

import 'animate.css';
import { Avatar, Card, CardContent, makeStyles, Typography } from '@material-ui/core';
import ReactImageAppear from 'react-image-appear';

const useStyles = makeStyles(theme => ({
  filePlaceholder: {
    position: 'relative',
    cursor: 'pointer',
    '& > img, & > video': {
      maxHeight: 200,
      objectFit: 'contain',
      width: '100%',
      display: 'block',
      outline: 'none',
      border: 'none',
      borderRadius: 4,
      background: 'white',
    },
    background: 'white',
    overflow: 'hidden',
    borderRadius: 4,
    animation: 'fadeIn',
    animationDuration: '.5s',
  },
  file: {
    width: '100%',
  },
  fileDamaged: {
    padding: '10px',
    color: 'black',
    margin: 'auto',
  },
  caption: {
    marginTop: '10px',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    background: 'rgba(0, 0, 0, .3)',
    transition: '.2s',
    '&:hover': {
      opacity: 1,
    },
  },
}));

function FileMessage({ message, isUser, style }) {
  const [expanded, setExpanded] = useState(false);
  const [damaged, setDamaged] = useState(false);
  const classes = { ...useStyles(), ...style };

  const expandImage = () => {
    setExpanded(true);
  };

  const closeImage = e => {
    if (e.target.tagName === 'IMG') return;
    setExpanded(false);
  };

  const renderFile = () => {
    if (damaged)
      return (
        <h4 className={classes.fileDamaged}>
          Invalid attachment{' '}
          <span role="img" aria-label="emoji">
            🤕
          </span>
        </h4>
      );

    if (message.fileType === 'video')
      return <video src={message.fileURL} controls alt={`${message.username}'s attachment`} onError={() => setDamaged(true)}></video>;

    return (
      <ReactImageAppear
        src={message.fileURL}
        className={classes.file}
        onClick={expandImage}
        onError={() => setDamaged(true)}
        alt="attachement"
      />
    );
  };

  return (
    <Card className={`${classes.card} ${isUser && classes.userCard}`}>
      <CardContent className={`${classes.cardContent} ${isUser && classes.userCardContent}`}>
        {!isUser && (
          <div className={classes.userInfo}>
            <Avatar className={classes.avatar} src={message.user.picture} alt={message.user.username.toUpperCase()} />
            <Typography align="right" variant="subtitle2" color="textSecondary" gutterBottom={true}>
              {message.user.username || 'anonymos'}
            </Typography>
          </div>
        )}

        <div className={classes.filePlaceholder}>
          {renderFile()}
          {expanded ? <ImageModal src={message.fileURL} onCloseImage={closeImage} /> : null}
        </div>

        {message.caption && (
          <Typography variant="h5" component="h2" className={classes.caption}>
            {message.caption}
          </Typography>
        )}

        <Typography variant="subtitle2" component="small" color="textSecondary" className={classes.time}>
          {moment(message.timestamp).format('MMMM D, LT')}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default FileMessage;
