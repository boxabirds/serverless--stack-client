import React from 'react';
import { Route } from 'react-router-dom';

export default function AppliedRoute({ component: C, appProps, ...rest }) {
  /*
  From docs
  This simple component creates a Route where the child component that it renders contains the 
  passed in props. Let’s take a quick look at how this is being done. The Route component takes a
  prop called component that represents the component that will be rendered when a matching
  route is found. We want our appProps to be applied to this component.

  The Route component can also take a render method in place of the component. This allows us to control what is passed in to our component.
  Based on this we can create a component that returns a Route that takes a component and appProps prop. This allows us to pass in the component we want rendered and the props that we want applied.
  Finally, we take component (set as C) and appProps and render inside our Route using the inline func:on; props => <C {...props} {...appProps} /> . Note, the props variable in this case is what the Route component passes us. Whereas, the
  appProps are the props that we are trying to set in our App component. 
  */
  return(
    <Route  
      { ...rest } 
      render = {
        props => <C 
          { ...props }
          { ...appProps } 
        />
      } 
    />
  );
}