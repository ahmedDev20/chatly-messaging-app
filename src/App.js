import React from 'react';
import Welcome from './components/Welcome';
import LoginForm from './components/Forms/LoginForm';
import RegisterForm from './components/Forms/RegisterForm';
import Chat from './components/Chat/Chat';
import PrivateRoute from './PrivateRoute';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import { makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import './App.css';

const useStyles = makeStyles(() => ({
  '@global': {
    '*': {
      boxSizing: 'border-box',
    },
    body: {
      margin: 0,
      background: `url(${require('./assets/img/bg1.jpg')})`,
    },
    '*::-webkit-scrollbar': {
      width: '6px',
    },
    '*::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
    '*::-webkit-scrollbar-thumb': {
      backgroundColor: 'dodgerblue',
      outline: 'none',
    },
  },
  root: {
    height: '100vh',
    display: 'flex',
    overflow: 'hidden',
    boxShadow: '1px 1px 10px rgba(0, 0, 0, .4)',
  },
  rootMobile: {
    width: '100%',
    margin: 0,
  },
}));

function App() {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));

  return (
    <Router>
      <div className={`${classes.root} ${isMobile ? classes.rootMobile : ''}`}>
        <Switch>
          <PrivateRoute path="/chatroom" component={Chat} />

          <Route path="/register">
            <Welcome>
              <RegisterForm />
            </Welcome>
          </Route>

          <Route path={['/login', '/']}>
            <Welcome>
              <LoginForm />
            </Welcome>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
