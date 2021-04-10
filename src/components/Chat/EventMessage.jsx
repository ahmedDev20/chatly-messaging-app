import React from 'react';

import { Card, CardContent, makeStyles, Typography } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  eventCard: {
    maxWidth: '70%',
    background: 'lightgray',
    margin: 10,
    alignSelf: 'center',
    overflow: 'visible',
  },
  eventCardContent: {
    background: 'lightgray',
    padding: '5px !important',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    '&>p': {
      display: 'inline',
    },
  },
}));

function EventMessage({ message, style }) {
  const classes = { style, ...useStyles() };

  return (
    <Card className={classes.eventCard}>
      <CardContent className={classes.eventCardContent}>
        <Typography variant="body1">{message.message}</Typography>
      </CardContent>
    </Card>
  );
}

export default EventMessage;
