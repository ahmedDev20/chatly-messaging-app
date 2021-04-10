import React from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import { red } from '@material-ui/core/colors';

function AlertDialog(props) {
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{props.title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">{props.description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>Cancel</Button>
        <Button onClick={props.onAction} style={{ color: red[500] }} autoFocus>
          {props.action}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AlertDialog;
