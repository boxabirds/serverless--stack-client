import React from "react";
import { Route, Switch } from "react-router-dom";
import AppliedRoute from "./components/AppliedRoute";

import Home from "./containers/Home";
import Login from "./containers/Login";
import Signup from "./containers/Signup";
import ResetPassword from "./containers/ResetPassword";
import NewNote from "./containers/NewNote";
import NotFound from "./containers/NotFound";

export default function Routes({ appProps }) {
  return(
    <Switch>
      <AppliedRoute path="/" exact component={Home} appProps={appProps} />
      <AppliedRoute path="/login" exact component={Login} appProps={appProps} />
      <AppliedRoute path="/signup" exact component={Signup} appProps={appProps} />
      <AppliedRoute path="/reset-password" exact component={ResetPassword} appProps={appProps} />
      <AppliedRoute path="/notes/new" exact component={NewNote} appProps={appProps} />
      { /* Last entry is our fallback -- default */ }
      <Route component={NotFound} />
    </Switch>
  );
}