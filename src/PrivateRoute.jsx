import React from 'react';
import { useStateValue } from './context/provider';
import { Redirect, Route } from 'react-router';
import Chat from './components/Chat/Chat';

function PrivateRoute({ component: PrivateComponent, ...props }) {
  const [{ user }] = useStateValue();

  return <Route {...props} render={routeProps => (user.loggedIn ? <Chat {...routeProps} /> : <Redirect to="/login" />)} />;
}

export default PrivateRoute;
