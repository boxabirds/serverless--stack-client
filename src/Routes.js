import React from "react";
import { Route, Switch } from "react-router-dom";

import Home from "./containers/Home";
import Login from "./containers/Login";

import NotFound from "./containers/NotFound";

export default function Routes() {
  return(
    <Switch>
      <Route path="/" exact component={Home} />
      <Route path="/login" exact component={Login} />
      { /* Last entry is our fallback -- degault */ }
      <Route component={NotFound} />
    </Switch>
  );
}