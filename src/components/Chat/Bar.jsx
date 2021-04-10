import React, { useState } from 'react';
import { useStateValue } from '../../context/provider';
import RoomInfos from './RoomInfos';
import RoomActions from './RoomActions';
import AlertDialog from '../Utils/AlertDialog';
import { auth } from '../../config/firebase';

import { AppBar, Button, makeStyles, Toolbar, Typography } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  appBar: {
    backgroundColor: 'whitesmoke',
    borderLeft: '2px solid lightgray',
    boxShadow: '5px 1px 8px rgb(0 0 0 / 40%)',
    position: 'sticky',
    color: theme.palette.text.primary,
    top: '0px',
    zIndex: 2,
  },
  title: {
    fontFamily: '"Potta One"',
    flex: 1,
    color: 'dodgerblue',
  },
}));

function Bar() {
  const [{ rooms }] = useStateValue();
  const [dialogOpen, setDialogOpen] = useState(false);
  const classes = useStyles();

  return (
    <AppBar position="static" className={classes.appBar}>
      <Toolbar>
        {rooms.selectedRoom.id ? (
          <React.Fragment>
            <RoomInfos />
            <RoomActions />
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Typography variant="h4" className={classes.title}>
              Chatly
            </Typography>
            <Button onClick={() => setDialogOpen(true)} variant="outlined" color="secondary">
              Log out
            </Button>

            <AlertDialog
              open={dialogOpen}
              title="Log out"
              description="Do you really want to log out ?"
              action="log out"
              onClose={() => setDialogOpen(false)}
              onAction={async () => await auth.signOut()}
            />
          </React.Fragment>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Bar;
