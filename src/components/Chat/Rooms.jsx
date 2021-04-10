import React, { useEffect, useState } from 'react';
import { useStateValue } from '../../context/provider';
import { db } from '../../config/firebase';
import RoomForm from '../Forms/RoomForm';
import moment from 'moment';

import { Avatar, Box, Button, makeStyles, Typography } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import { Skeleton } from '@material-ui/lab';
import { deepOrange } from '@material-ui/core/colors';

const useStyles = makeStyles(theme => ({
  rooms__container: {
    width: '25vw',
    display: 'flex',
    background: 'whitesmoke',
    flexDirection: 'column',
    alignItems: 'center',
  },
  skeleton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: 10,
    gap: 5,
  },
  addRoom: {
    position: 'sticky',
    boxShadow: '0px 1px 8px rgb(0 0 0 / 40%)',
    padding: 14,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    '& > button': {
      background: deepOrange[400],
      color: 'white',
      '&:hover': {
        background: deepOrange[500],
      },
    },
  },
  rooms: {
    padding: 0,
    width: '100%',
    overflowY: 'auto',
  },
  room: {
    padding: 15,
    cursor: 'pointer',
    transition: '.3s ease',
    '&:hover': {
      backgroundColor: theme.palette.grey[300],
    },
  },
  lastMsg: {
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    '& > p': {
      display: 'inline',
    },
  },
  inline: {
    display: 'inline',
  },
}));

const SideBar = () => {
  const classes = useStyles();
  const [{ user, rooms }, dispatch] = useStateValue();
  const [formHidden, setFormHidden] = useState(true);

  const addRoomsListener = () => {
    const unsubscribe = db
      .collection('rooms')
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        snapshot => {
          let rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          rooms = rooms.filter(room => {
            for (const member of room.members) {
              if (member.uid === user.info.uid) return true;
            }
            return false;
          });

          dispatch({ type: 'rooms_received', rooms });
        },
        error => dispatch({ type: 'rooms_not_received', error }),
      );

    // Cleanup
    return () => unsubscribe();
  };

  useEffect(addRoomsListener, []);

  const selectRoom = async e => {
    const roomId = e.currentTarget.dataset.roomid;
    const [selectedRoom] = rooms.list.filter(room => room.id === roomId);

    dispatch({ type: 'rooms_room_selected', room: selectedRoom });
  };

  const renderRooms = () => {
    if (!rooms.list.length)
      return (
        <Typography variant="body1" align="center" style={{ padding: 20 }}>
          Click 'Create new room' to start chatting with your friends.
        </Typography>
      );

    return rooms.list.map((room, index) => {
      const { lastMsg } = room;
      let roomLastText = '';
      let roomLastTime = '';

      if (!lastMsg) return null;
      if (lastMsg.isEvent) roomLastText = lastMsg.message;
      else if (lastMsg.user.uid === user.info.uid) {
        roomLastText = `You : ${lastMsg.isFile ? 'sent an attachment' : lastMsg.message}`;
      } else roomLastText = `${lastMsg.user.username} : ${lastMsg.isFile ? 'sent an attachment' : lastMsg.message}`;

      roomLastTime = moment(lastMsg.timestamp).toNow();

      return (
        <React.Fragment key={room.id}>
          <ListItem alignItems="flex-start" className={classes.room} data-roomid={room.id} onClick={selectRoom}>
            <ListItemAvatar>
              <Avatar alt={room.name} src={room.icon} />
            </ListItemAvatar>
            <Box overflow="hidden" width="100%">
              <ListItemText className={classes.lastMsg} primary={room.name} secondary={roomLastText} />
              <ListItemText style={{ width: 'fit-content', marginLeft: 'auto' }} secondary={roomLastTime} />
            </Box>
          </ListItem>

          {index !== rooms.list.length - 1 && <Divider key={index} variant="fullWidth" component="li" />}
        </React.Fragment>
      );
    });
  };

  const renderSkeletons = () =>
    Array.from(new Array(8)).map((_, i) => (
      <div key={i} className={classes.skeleton}>
        <Skeleton variant="circle" width={40} height={40} />
        <Box width="100%">
          <Skeleton width="60%" />
          <Skeleton />
        </Box>
      </div>
    ));

  const closeRoomForm = () => {
    setFormHidden(true);
  };

  return (
    <div className={classes.rooms__container}>
      <div className={classes.addRoom}>
        <Button variant="contained" onClick={() => setFormHidden(false)}>
          Create New Room
        </Button>
      </div>

      {formHidden ? null : <RoomForm onClose={closeRoomForm} />}

      <List className={classes.rooms}>{rooms.loading ? renderSkeletons() : renderRooms()}</List>
    </div>
  );
};

export default SideBar;
