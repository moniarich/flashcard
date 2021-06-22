import React, { Fragment, useState } from "react";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import CardContent from "@material-ui/core/CardContent";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import CancelIcon from "@material-ui/icons/Cancel";
import { Mode } from "./Flashcards";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import CssBaseline from "@material-ui/core/CssBaseline";
import Box from "@material-ui/core/Box";
import { Container } from "@material-ui/core";
import { Url } from "./config";
import axios from "axios";

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 400,
    maxWidth: 400,
    minHeight: 300,
    maxHeight: 300,
    transition: "150ms",
    transformStyle: "preserve-3d",
    marginTop: "5%",
  },

  media: {
    height: 0,
    paddingTop: "56.25%", // 16:9
  },

  title: {
    fontSize: 14,
  },
  text: {
    paddingTop: "10%",
    paddingBottom: "10%",
  },
  pos: {
    marginBottom: 12,
  },
}));

// //
// <TextareaAutosize
// value={card.image}
// aria-label="minimum height"
// rowsMin={3}
// placeholder="image url"
// onChange={(e) => setCard({ ...card, image: e.target.value })}/>
// :

const EditCard = (props) => {
  const classes = useStyles();
  const {
    setMode,
    isNew,
    remove,
    card,
    postFlashcard,
    setCard,
    putUpdate,
  } = props;
  const [message, setMessages] = useState({ type: "", text: "" });
  // const [presignedUrl, setPresignedUrl] = useState({ text: "" });
  console.log(card, "image");
  const uploadImage = async (formData) => {
    try {
      const response = await fetch(`${Url}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setCard({ ...card, image: data.image });

      if (!response.ok) {
        throw new Error(data.message);
      }
      setMessages({ type: "image was uploaded", text: data.message });
      // setPresignedUrl({ text: data.presignedUrl });
    } catch (e) {
      setMessages({ type: "error", text: e.message });
    }
  };
  return (
    <Fragment>
      <CssBaseline />
      <CardContent>
        <Container maxWidth="xs">
          <Button
            size="small"
            onClick={() => (isNew ? remove() : setMode(Mode.Front))}
            alignItems="flex-end"
          >
            <CancelIcon />
          </Button>
          <Typography
            className={classes.title}
            color="textSecondary"
            gutterBottom
          >
            Word of the Day
          </Typography>
          <Box display="flex" flexDirection="column">
            <TextareaAutosize
              rowsMax={3}
              rowsMin={3}
              value={card.word}
              aria-label="empty textarea"
              placeholder="word"
              onChange={(e) => setCard({ ...card, word: e.target.value })}
            />

            <TextareaAutosize
              rowsMax={5}
              value={card.word_type}
              rowsMin={5}
              aria-label="empty textarea"
              placeholder="word type e.g noun"
              onChange={(e) => setCard({ ...card, word_type: e.target.value })}
            />
            <TextareaAutosize
              rowsMax={5}
              value={card.definition}
              aria-label="minimum height"
              rowsMin={5}
              placeholder="definition"
              onChange={(e) => setCard({ ...card, definition: e.target.value })}
            />
            <TextareaAutosize
              rowsMax={5}
              value={card.example_sentence}
              aria-label="minimum height"
              rowsMin={5}
              placeholder="example sentence"
              onChange={(e) =>
                setCard({ ...card, example_sentence: e.target.value })
              }
            />
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              m={2}
              p={1}
              flexDirection="column"
            >
              <label htmlFor="upload-photo">
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="upload-photo"
                  name="upload-photo"
                  type="file"
                  onChange={(e) => {
                    const formData = new FormData();
                    formData.append("file", e.target.files[0]);

                    uploadImage(formData);
                  }}
                />
                <Fab
                  color="primary"
                  size="small"
                  component="span"
                  aria-label="add"
                  variant="extended"
                >
                  <AddIcon /> image
                </Fab>
              </label>

              <Button
                variant="contained"
                color="secondary"
                size="small"
                style={{
                  margin: "10px",
                }}
                onClick={() => (card.id === 0 ? postFlashcard() : putUpdate())}
              >
                Save
              </Button>
            </Box>
          </Box>
        </Container>
      </CardContent>
    </Fragment>
  );
};
export default EditCard;
