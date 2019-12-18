import React, { useState } from 'react';
import { FormGroup, FormControl, ControlLabel, HelpBlock } from "react-bootstrap";
import "./ResetPassword.css";
import { Auth } from "aws-amplify";
import LoaderButton from '../components/LoaderButton';
import { useFormFields } from "../libs/hooksLib";

export default function ResetPassword(props) {
  /*
  props: user authentication state

  Reset password flow is this:
    1. Ask for email address form
    2. Present code confirmation form:
      - confirmation code
      - new password
      - confirm new password
    3. Check email for code and copy text
    4. Fill in confirmation form
    5. Go /Home
    TODO this could be generalised easily with form screen state.
  */

  // Multi-form flow
  // to show a form, simply call 
  // call setFormToShow( <const from below> ) 
  const PASSWORD_RESET_FORM = 1;
  const CONFIRMATION_CODE_FORM = 2;
  const [formToShow, setFormToShow] = useState(PASSWORD_RESET_FORM);

  function renderCurrentForm() {
    /*
    Decide which form to show to the user
    */
    let rendererOutput = null;
    switch(formToShow) {
      case CONFIRMATION_CODE_FORM:
        rendererOutput = renderConfirmationCodeForm(); 
        break;

      case PASSWORD_RESET_FORM:
        rendererOutput = renderPasswordResetForm();
        break;
      
      default:
        alert("Sorry, a little confusion here -- not sure which step to show. Developers have been contacted.");
        break;
    }
    return rendererOutput;
  }


  // Every server communication is async
  // so we maintain temporary state to track where we are. 

  // request password reset, show spinner, stop spinner
  const [isSendingPasswordReset, setIsSendingPasswordReset] = useState(false);

  // user sending confirmation code, spinner, stop spinner
  const [isConfirmingCode, setIsConfirmingCode] = useState(false);

  // Form data across all the forms
  const [fields, handleFieldChange] = useFormFields({
    // email address form
    email: "",

    // New password with code confirmation form
    newPassword: "",
    passwordConfirmation: "",
    confirmationCode: "",
  });

  
  function validatePasswordResetForm() {
    return fields.email.length > 0;
  }

  function validateConfirmationCodeForm() {
    return( 
      // Note that the verification of the pin is done
      // inside Auth (Cognito) so all we can do is check the length
      fields.confirmationCode.length > 0 &&
      fields.newPassword.length > 0 &&
      fields.newPassword === fields.passwordConfirmation
    );
  }

  async function handlePasswordResetSubmit(event) {
    event.preventDefault();

    setIsSendingPasswordReset(true);
    try {
      await Auth.forgotPassword(fields.email);
      setIsSendingPasswordReset(false);
      setFormToShow(CONFIRMATION_CODE_FORM);
      alert("sent code");
    } catch (e) {
      setIsSendingPasswordReset(false);
      alert(e.message);
    }
  }

  async function handleConfirmationCodeSubmit(event) {
    event.preventDefault();

    setIsConfirmingCode(true);

    try {
      await Auth.forgotPasswordSubmit(fields.email, fields.confirmationCode, fields.newPassword);
      setIsConfirmingCode(false);

      // TODO these three lines should be atomic: sign in, and go where 
      // the user was trying to go
      await Auth.signIn(fields.email, fields.newPassword);
      props.userHasAuthenticated(true);
      props.history.push("/");
    } catch (e) {
      alert(e.message);
      setIsConfirmingCode(false);
    }
  }

  function renderConfirmationCodeForm() {
    return( 
      <form onSubmit={handleConfirmationCodeSubmit}>
        <FormGroup controlId="confirmationCode" bsSize="large">
          <ControlLabel>Confirmation Code</ControlLabel>
          <FormControl 
            autoFocus
            type="tel"
            onChange={handleFieldChange}
            value={fields.confirmationCode}
          />
          <HelpBlock>Please check your email for the code.</HelpBlock>
        </FormGroup>
        <FormGroup controlId="newPassword" bsSize="large">
          <ControlLabel>New Password</ControlLabel>
          <FormControl
            type="password"
            value={fields.newPassword}
            onChange={handleFieldChange}
        />
        </FormGroup>
        <FormGroup controlId="passwordConfirmation" bsSize="large">
          <ControlLabel>Confirm New Password</ControlLabel>
          <FormControl
            type="password"
            value={fields.passwordConfirmation}
            onChange={handleFieldChange}
        />
        </FormGroup>
        <LoaderButton
          block
          type="submit"
          bsSize="large"
          isLoading={isConfirmingCode}
          disabled={!validateConfirmationCodeForm()}
        >
          Verify
        </LoaderButton>
      </form>
    );
  }

  function renderPasswordResetForm() {
    return(
      <form onSubmit={handlePasswordResetSubmit}>
        <FormGroup controlId="email" bsSize="large">
          <ControlLabel>Email</ControlLabel>
          <FormControl
            autoFocus
            type="email"
            value={fields.email}
            onChange={handleFieldChange}
        />
        </FormGroup>
        <LoaderButton
          block
          type="submit"
          bsSize="large"
          isLoading={isSendingPasswordReset}
          disabled={!validatePasswordResetForm()}
        >
          Reset
        </LoaderButton>
      </form>
    )
  }

  return( 
    <div className="ResetPassword">
      {renderCurrentForm()}
    </div>
  );

}