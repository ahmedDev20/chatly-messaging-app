import React, { useEffect, useState } from 'react';
import { useStateValue } from '../../context/provider';
import { db, firebase } from '../../config/firebase';

import { Avatar, Chip, Dialog, DialogTitle, Divider, IconButton, List, ListItem, ListItemAvatar, ListItemText } from '@material-ui/core';
import { Add, Delete, KeyboardArrowLeft } from '@material-ui/icons';

function Members() {
  const [{ roomMembers, rooms, users, user: currentUser }, dispatch] = useStateValue();
  const { selectedRoom } = rooms;
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const isRoomAdmin = currentUser.info.uid === selectedRoom.admin.uid;

  const handleClose = (event, reason) => {
    if (reason === 'backdropClick') dispatch({ type: 'roomMembers_tab_closed' });
    setIsAddingMembers(false);
  };

  const addUser = async uid => {
    try {
      const targetUser = users.list.find(user => user.uid === uid);

      await db
        .collection('rooms')
        .doc(selectedRoom.id)
        .update({ members: firebase.firestore.FieldValue.arrayUnion(targetUser) });

      const joinedMsg = {
        isEvent: true,
        roomId: rooms.selectedRoom.id,
        user: targetUser,
        message: `${targetUser.username} joined 🔥`,
        timestamp: firebase.firestore.Timestamp.now().toMillis(),
      };

      await db.collection('messages').add(joinedMsg);
      await db.collection('rooms').doc(rooms.selectedRoom.id).update({ lastMsg: joinedMsg });
    } catch (error) {
      dispatch({ type: 'error_caught', error });
    }
  };

  const removeMember = async uid => {
    try {
      const targetMember = roomMembers.list.find(member => member.uid === uid);

      await db
        .collection('rooms')
        .doc(selectedRoom.id)
        .update({ members: firebase.firestore.FieldValue.arrayRemove(targetMember) });

      const leftMsg = {
        isEvent: true,
        roomId: rooms.selectedRoom.id,
        user: targetMember,
        message: `${targetMember.username} got kicked 😲`,
        timestamp: firebase.firestore.Timestamp.now().toMillis(),
      };

      await db.collection('messages').add(leftMsg);
      await db.collection('rooms').doc(selectedRoom.id).update({ lastMsg: leftMsg });
    } catch (error) {
      dispatch({ type: 'error_caught', error });
    }
  };

  const fetchData = () => {
    dispatch({ type: 'roomMembers_requested' });
    dispatch({ type: 'users_requested' });

    fetchRoomMembers(selectedRoom.id);
    fetchUsers();
  };

  const fetchRoomMembers = roomId => {
    db.collection('rooms')
      .doc(roomId)
      .onSnapshot(
        room => {
          let roomMembers = room.data();
          if (!roomMembers) return;
          roomMembers = room.data().members;
          dispatch({ type: 'roomMembers_received', roomMembers });
        },
        error => dispatch({ type: 'roomMembers_not_received', error }),
      );
  };

  const fetchUsers = () => {
    db.collection('users').onSnapshot(
      data => {
        if (data.empty) return;

        const users = data.docs.map(doc => ({ ...doc.data() }));
        dispatch({ type: 'users_received', users });
      },
      error => dispatch({ type: 'users_not_received', error }),
    );
  };

  useEffect(fetchData, []);

  const renderMembersOrNonMembers = () => {
    let items = [];

    if (isAddingMembers) {
      items = [...users.list];

      for (const user of users.list) {
        for (const member of roomMembers.list) {
          if (user.uid === member.uid) items.splice(items.indexOf(user), 1);
        }
      }
    } else items = roomMembers.list;

    if (!items.length)
      return (
        <ListItem>
          <ListItemText primary="All users have been added to your room." />
        </ListItem>
      );

    return items.map(user => {
      const isCurrentUser = user.uid === currentUser.info.uid;
      const isOwner = user.uid === selectedRoom.admin.uid;

      return (
        <ListItem button key={user.uid}>
          <ListItemAvatar>
            <Avatar src={user.picture} alt={user.username} />
          </ListItemAvatar>
          <ListItemText primary={isCurrentUser ? 'You' : user.username} />

          {isOwner ? (
            <Chip color="primary" size="small" label="owner" />
          ) : !isCurrentUser && isRoomAdmin ? (
            isAddingMembers ? (
              <IconButton color="primary" onClick={() => addUser(user.uid)}>
                <Add />
              </IconButton>
            ) : (
              <IconButton color="secondary" onClick={() => removeMember(user.uid)}>
                <Delete />
              </IconButton>
            )
          ) : null}
        </ListItem>
      );
    });
  };

  return (
    <Dialog open={roomMembers.tabOpen} onClose={handleClose} style={{ overflow: 'hidden' }}>
      {isAddingMembers ? (
        <ListItem button style={{ padding: 16 }} onClick={() => setIsAddingMembers(false)}>
          <ListItemAvatar>
            <Avatar color="primary">
              <KeyboardArrowLeft />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Go Back" />
        </ListItem>
      ) : (
        <DialogTitle>Room members</DialogTitle>
      )}

      <Divider />

      <List style={{ width: 300, maxHeight: 400, overflowY: 'auto' }}>
        {roomMembers.loading || users.loading ? (
          <ListItem autoFocus button onClick={() => setIsAddingMembers(true)}>
            <ListItemAvatar>
              <Avatar color="primary">
                <Add />
              </Avatar>
            </ListItemAvatar>
          </ListItem>
        ) : (
          <React.Fragment>
            {isRoomAdmin ? (
              isAddingMembers ? null : (
                <ListItem button onClick={() => setIsAddingMembers(true)}>
                  <ListItemAvatar>
                    <Avatar color="primary">
                      <Add />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="Add members" />
                </ListItem>
              )
            ) : null}

            {renderMembersOrNonMembers()}
          </React.Fragment>
        )}
      </List>
    </Dialog>
  );
}

export default Members;
