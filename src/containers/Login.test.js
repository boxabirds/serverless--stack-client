import React from 'react';

// From airbnb.io:
// Shallow rendering is useful to constrain yourself to 
// testing a component as a unit, and 
// to ensure that your tests aren't indirectly asserting on 
// behavior of child components.
import { shallow } from 'enzyme';
import Login, { validateLoginForm } from "./Login";

describe('Test login front-end', () => {
  const wrapper = shallow(<Login/>);
  it('should have a button for sign-in', () => {
    expect(wrapper.find('LoaderButton')).toHaveLength(1);
    // TODO I need to learn more about
    // why this is failing. find(...).text() returns "<LoaderButton />"
    //expect(wrapper.find("LoaderButton").text()).toEqual('Login');
  });
});