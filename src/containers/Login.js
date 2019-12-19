import React, { useState } from 'react';
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import "./Login.css";
import { Auth } from "aws-amplify";
import LoaderButton from '../components/LoaderButton';
import { useFormFields } from "../libs/hooksLib";


function validateLoginForm(fields) {
  return fields.email.length > 0 && fields.password.length > 0;
}


export default function Login(props) {
  const [isLoading, setIsLoading] = useState(false);
  const [fields, handleFieldChange] = useFormFields({
    email: "", 
    password: ""
  });


  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    try {
      await Auth.signIn(fields.email, fields.password);
      setIsLoading(false);
      props.userHasAuthenticated(true);
      props.history.push("/notes/new");
    } catch (e) {
      setIsLoading(false);
      alert(e.message);
    }
  }

  return( 
    <div className="Login">
      <form onSubmit={handleSubmit}>
        <FormGroup controlId="email" bsSize="large">
          <ControlLabel>Email</ControlLabel>
          <FormControl 
            autoFocus
            type="email"
            value={fields.email}
            onChange={handleFieldChange}
          />
        </FormGroup>
        <FormGroup controlId="password" bsSize="large">
          <ControlLabel>Password</ControlLabel>
          <FormControl
            type="password"
            value={fields.password}
            onChange={handleFieldChange}
          />
        </FormGroup>
        <LoaderButton
          block
          type="submit"
          bsSize="large"
          isLoading={isLoading}
          disabled={!validateLoginForm(fields)}
        >
          Login
          </LoaderButton>
      </form>
    </div>
  );
}