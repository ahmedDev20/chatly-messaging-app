import React from 'react';
import { useStateValue } from '../../context/provider';
import moment from 'moment';

import { Avatar, Box, makeStyles, Typography } from '@material-ui/core';
import 'animate.css';

const useStyles = makeStyles(theme => ({
  roomInfos: {
    flex: 1,
    fontFamily: "'Potta One', cursive",
    display: 'flex',
    overflow: 'hidden',
    alignItems: 'center',
    gap: 15,
  },
}));

function RoomInfos() {
  const [{ rooms }] = useStateValue();
  const classes = useStyles();

  return (
    <Box className={classes.roomInfos}>
      <Avatar src={rooms.selectedRoom.icon} alt={rooms.selectedRoom.name} />
      <Box style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <Typography variant="body1" style={{ display: 'inline' }}>
          {rooms.selectedRoom.name}
        </Typography>
        <Typography variant="body2">
          {moment(rooms.selectedRoom.lastMsg.timestamp).calendar(rooms.selectedRoom.lastMsg.timestamp)}
        </Typography>
      </Box>
    </Box>
  );
}

export default RoomInfos;
