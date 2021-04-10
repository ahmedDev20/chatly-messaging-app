import React, { useState } from 'react';
import { useStateValue } from '../../context/provider';

import { IconButton, makeStyles, Menu, MenuItem, Tooltip } from '@material-ui/core';
import { ExitToApp, MoreVert, Delete, Group } from '@material-ui/icons';
import 'animate.css';
import { auth, db, firebase } from '../../config/firebase';
import AlertDialog from '../Utils/AlertDialog';

const useStyles = makeStyles(theme => ({
  menuItem: {
    fontFamily: '"Roboto", sans-serif',
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

function RoomActions() {
  const [{ rooms, roomMembers, user }, dispatch] = useStateValue();
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({
    title: '',
    description: '',
    action: '',
    onClose: () => setDialogOpen(false),
    onAction: () => {},
  });
  const isMenuOpen = Boolean(anchorEl);
  const classes = useStyles();

  const logOutModalHandler = () => {
    setDialogContent({
      ...dialogContent,
      title: 'Log out',
      description: 'Do you really want to log out ?',
      action: 'log out',
      onAction: async () => {
        await auth.signOut();
      },
    });
    setDialogOpen(true);
  };

  const handleLeaveRoom = () => {
    setDialogContent({
      ...dialogContent,
      title: 'Leave Room',
      description: `Do you really want to leave ${rooms.selectedRoom.name} ?`,
      action: 'leave room',
      onAction: leaveRoom,
    });
    setDialogOpen(true);
  };

  const leaveRoom = async () => {
    try {
      const targetMember = roomMembers.list.find(member => member.uid === user.info.uid);
      await db
        .collection('rooms')
        .doc(rooms.selectedRoom.id)
        .update({ members: firebase.firestore.FieldValue.arrayRemove(targetMember) });

      const leftMsg = {
        isEvent: true,
        roomId: rooms.selectedRoom.id,
        user: user.info,
        message: `${user.info.username} left 😥`,
        timestamp: firebase.firestore.Timestamp.now().toMillis(),
      };

      await db.collection('messages').add(leftMsg);
      await db.collection('rooms').doc(rooms.selectedRoom.id).update({ lastMsg: leftMsg });

      dispatch({ type: 'roomMembers_member_left' });
    } catch (error) {
      dispatch({ type: 'error_caught', error });
    }
  };

  const menuOptions = (
    <Menu anchorEl={anchorEl} id="settings-menu" keepMounted open={isMenuOpen} onClose={() => setAnchorEl(null)}>
      <MenuItem className={classes.menuItem}>
        Leave Room
        <IconButton onClick={handleLeaveRoom} color="secondary">
          <Delete />
        </IconButton>
      </MenuItem>
      <MenuItem className={classes.menuItem}>
        Log Out
        <IconButton onClick={logOutModalHandler}>
          <ExitToApp color="secondary" />
        </IconButton>
      </MenuItem>
    </Menu>
  );

  return (
    <React.Fragment>
      <Tooltip title="members" arrow>
        <IconButton
          edge="end"
          aria-label="members"
          aria-haspopup="true"
          onClick={() => dispatch({ type: 'roomMembers_tab_opened' })}
          color="inherit"
        >
          <Group />
        </IconButton>
      </Tooltip>

      <Tooltip title="settings" arrow>
        <IconButton
          style={{ marginLeft: 10 }}
          edge="end"
          aria-label="settings"
          aria-controls="settings-menu"
          aria-haspopup="true"
          onClick={e => setAnchorEl(e.currentTarget)}
          color="inherit"
        >
          <MoreVert />
        </IconButton>
      </Tooltip>

      {menuOptions}

      <AlertDialog open={dialogOpen} {...dialogContent} />
    </React.Fragment>
  );
}

export default RoomActions;
