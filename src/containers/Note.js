import React, { useRef, useState, useEffect } from "react";
import { API, Storage } from "aws-amplify";
import config from "../config";
import LoaderButton from "../components/LoaderButton";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import "./Note.css";
import { s3Upload } from "../libs/awsLib";

function validateForm(content) {
  // Out of the Notes function scope so it can be tested outside of this scope too
  return content.length > 0; 
}

function stripLeadingTimestamp(str) {
  // when saving the file we added a timestamp at the beginning.
  // we strip it off again. 
  // TODO review this hackery
  return str.replace(/^\w+-/, "");
}

export default function Note(props) {
  const file = useRef(null);
  const [note, setNote] = useState(null);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);


  useEffect( () => {
    function loadNote() {
      return API.get("notes", `/notes/${props.match.params.id}`);
    }

    async function onLoad() {
      try {
        const note = await loadNote();
        const { content, attachment } = note;

        if (attachment) {
          note.attachmentURL = await Storage.vault.get(attachment); 
        }

        setContent(content);
        setNote(note);
      } catch (e) {
        console.error(e);
        alert(e);
      }
    }
    onLoad();

  }, [props.match.params.id]);

  function handleFileChange(event) {
    file.current = event.target.files[0];
  }

  function saveNote(note) {
    return API.put('notes', `/notes/${props.match.params.id}`, {
      body: note
    });
  }


  async function handleSubmit(event) {
    // TODO doesn't delete old attachment or check whether the attachment is the same
    event.preventDefault();
    let attachment;

    if (file.current && file.current.size > config.MAX_ATTACHMENT_SIZE) {
      alert(
        `Please pick a file smaller than 
        ${config.MAX_ATTACHMENT_SIZE / 1000000} MB.`
      );
      return;
    }

    setIsLoading(true);
    try {
      if (file.current) {
        attachment = await s3Upload(file.current);
      }

      await saveNote({
        content,
        attachment: attachment || note.attachment
      });
      setIsLoading(false);
      props.history.push("/");
    } catch (e) {
      setIsLoading(false);
      console.error(e);
      alert(e);
    }
  }

  function deleteNote() {
    return API.del("notes",
    `/notes/${props.match.params.id}`);
  }

  async function handleDelete(event) {
    // TODO doesn't delete the attachment
    event.preventDefault();

    const confirmed = window.confirm("Delete this precious note? Really?");

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteNote();
      setIsDeleting(false);
      props.history.push("/")
    } catch (e) {
      setIsDeleting(false);
      alert(e);
    }
  }

  return(
    <div className="Notes">
      {note && (
        <form onSubmit={handleSubmit}>
          <FormGroup controlId="content">
            <FormControl 
              value={content}
              componentClass="textarea"
              onChange={e => setContent(e.target.value)}
            />
          </FormGroup>
          {note.attachment && (
            <FormGroup>
              <ControlLabel>Attachment</ControlLabel>
              <FormControl.Static>
                <a 
                  target="_blank"
                  rel="noopener noreferrer"
                  href={note.attachmentURL}
                >
                  {stripLeadingTimestamp(note.attachment)}
                </a> 
              </FormControl.Static>
            </FormGroup>
          )}
            <FormGroup controlId="file">
              {!note.attachment && 
              <ControlLabel>Attachment</ControlLabel>}
              <FormControl onChange={handleFileChange} type="file" />
            </FormGroup>
            <LoaderButton
              block
              type="submit"
              bsSize="large"
              isLoading={isLoading}
              disabled={!validateForm(content)}
            > 
              Save
            </LoaderButton>
            <LoaderButton
              block
              type="submit"
              bsSize="large"
              bsStyle="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
            > 
              Delete
            </LoaderButton>

        </form>
      )}
    </div>
  )
}