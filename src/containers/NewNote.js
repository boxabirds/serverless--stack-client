import React, { useRef, useState } from "react";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import config from "../config";
import "./NewNote.css";

import { API } from "aws-amplify";
import { s3Upload } from "../libs/awsLib";

// All validation functions moved outside the default function
// to make it easier to test. 
function validateNewNote(content) {
  return content.length > 0;
}

export default function NewNote(props) {
  const file = useRef(null);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleFileChange(event) {
    // Just take the first attachment
    file.current = event.target.files[0];
  }

  async function handleNewNote(event) {
    event.preventDefault();
    if( file.current && file.current.size > config.MAX_ATTACHMENT_SIZE) {
      alert(`Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE / 1000000} MB`);
      return;
    }
    setIsLoading(true);

    try {
      const attachment = file.current
        ? await s3Upload(file.current)
        : null;

      await createNote({ content, attachment });
      setIsLoading(false);
      props.history.push("/");

    } catch (e) {
      setIsLoading(false);
      console.log("note save failed: " + e);
      alert(e);
    }
  }

  function createNote(note) {
    // Call AWS Amplify client wrapper for Gateway API
    return API.post("notes", "/notes", {
      body: note
    });
  }


  return (
    <div className="NewNote">
      <form onSubmit={handleNewNote}>
        <FormGroup controlId="content">
          <FormControl 
            value={content}
            componentClass="textarea"
            onChange={e=>setContent(e.target.value)}
          />
        </FormGroup>
        <FormGroup controlId="file">
          <ControlLabel>Attachment</ControlLabel>
          <FormControl onChange={handleFileChange} type="file" />
        </FormGroup>
        <LoaderButton
          block
          type="submit"
          bsSize="large"
          bsStyle="primary"
          isLoading={isLoading}
          disabled={!validateNewNote(content)}
        >
          Create
        </LoaderButton>
      </form>
    </div>
  );
}