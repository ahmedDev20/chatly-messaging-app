import React from 'react';

import { Avatar, Card, CardContent, Typography } from '@material-ui/core';
import moment from 'moment';

function TextMessage({ message, isUser, style }) {
  const classes = style;

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

        <Typography variant="h5" component="h2">
          {message.message}
        </Typography>

        <Typography variant="subtitle2" component="small" color="textSecondary" className={classes.time}>
          {moment(message.timestamp).format('MMMM D, LT')}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default TextMessage;
