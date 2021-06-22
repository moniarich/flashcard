import React, { Fragment, useEffect, useState } from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import CardMedia from "@material-ui/core/CardMedia";
import AppBar from "@material-ui/core/AppBar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Toolbar from "@material-ui/core/Toolbar";
import Fab from "@material-ui/core/Fab";
import List from "@material-ui/core/List";
import AddIcon from "@material-ui/icons/Add";
import Tooltip from "@material-ui/core/Tooltip";
import Grid from "@material-ui/core/Grid";
import { Container } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import CardHeader from "@material-ui/core/CardHeader";
import EditCard from "./Editcard";
import { Url } from "./config";
import axios from "axios";

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 400,
    maxWidth: 400,
    minHeight: 500,
    maxHeight: 500,
    transition: "150ms",
    transformStyle: "preserve-3d",
  },
  media: {
    height: 0,
    paddingTop: "60%", // 16:9
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
  text: {
    padding: theme.spacing(2, 2, 0),
    color: "#3f51b5",
  },
  paper: {
    height: "100%",
  },
  list: {
    marginBottom: theme.spacing(12),
  },
  subheader: {
    backgroundColor: theme.palette.background.paper,
  },
  appBar: {
    top: "auto",
    bottom: 0,
  },
  grow: {
    flexGrow: 1,
  },
  fabButton: {
    position: "absolute",
    zIndex: 1,
    top: -30,
    left: 0,
    right: 0,
    margin: "0 auto",
  },
}));

const Flashcard = (props) => {
  const card = props.cards;
  const setMode = props.setMode;
  const classes = useStyles();
  const setCard = props.setCard;
  const deleteCard = props.deleteCard;

  return (
    <React.Fragment>
      <Card className={classes.root} variant="outlined">
        {card.mode === Mode.Edit ? (
          <Fragment>
            <EditCard
              setMode={setMode}
              isNew={card.id === 0}
              remove={props.remove}
              postFlashcard={props.postFlashcard}
              setCard={setCard}
              card={card}
              putUpdate={props.putUpdate}
            />
          </Fragment>
        ) : (
          <Fragment>
            <CardHeader
              action={
                <Fragment>
                  <Fab color="secondary" aria-label="delete" size="small">
                    <DeleteIcon onClick={() => deleteCard(Mode)} />
                  </Fab>
                  <Fab color="secondary" aria-label="edit" size="small">
                    <EditIcon onClick={() => setMode(Mode.Edit)} />
                  </Fab>
                </Fragment>
              }
            />
            {card.mode === Mode.Back ? (
              <Fragment>
                <CardContent>
                  <Typography
                    className={classes.title}
                    color="textSecondary"
                    gutterBottom
                  >
                    Word of the Day
                  </Typography>
                  <Typography variant="h5" component="h2">
                    {card.word}
                  </Typography>
                  <Typography className={classes.pos} color="textSecondary">
                    {card.word_type}
                  </Typography>
                  <Typography variant="body2" component="p">
                    {card.definition}
                    <br />
                    {card.example_sentence}
                  </Typography>
                </CardContent>
                <CardActions className={classes.rotate}>
                  <Button
                    size="small"
                    onClick={() => setMode(Mode.Front)}
                    alignItems="flex-end"
                  >
                    rotate
                  </Button>
                </CardActions>
              </Fragment>
            ) : (
              <Fragment>
                <CardContent>
                  <CardMedia
                    className={classes.media}
                    image={`/${card.image}`}
                  />
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => setMode(Mode.Back)}
                    alignItems="flex-end"
                  >
                    rotate
                  </Button>
                </CardActions>
              </Fragment>
            )}
          </Fragment>
        )}
      </Card>
    </React.Fragment>
  );
};

export const Mode = {
  Front: "front",
  Back: "back",
  Edit: "edit",
};

const Flashcards = (props) => {
  const [message, setMessages] = useState({ type: "", text: "" });
  const [cards, setCards] = useState([]);
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const formData = props.formData;
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  async function fetchFlashcard() {
    const response = await axios.get(`${Url}/flashcard`);

    setCards(response.data.map((card) => ({ ...card, mode: Mode.Front })));
    setMessages({ type: "", text: "" });
  }

  const fetchUpdateCard = async (c) => {
    try {
      const response = await axios.post(`${Url}/flashcard`, {
        flashcard: c,
      });
      if (response.status == 200) {
        setMessages({ type: "success", text: "Card was added" });
        fetchFlashcard();
      } else {
        setCards(
          cards.map((card) =>
            card.id === c.id ? { ...response.data, mode: Mode.Front } : card
          )
        );
        setMessages({ type: "danger", text: response.data.message });
      }
    } catch (e) {
      setMessages({ type: "danger", text: e.message });
    }
  };

  const updateCard = async (c) => {
    try {
      const response = await axios.put(`${Url}/flashcard`, {
        flashcard: c,
      });

      if (response.status == 200) {
        setMessages({ type: "success", text: "success add to card" });
        fetchFlashcard();
      } else {
        setMessages({ type: "danger", text: response.data.message });
      }
    } catch (e) {
      setMessages({ type: "danger", text: e.message });
    }
  };

  const deleteCard = async (c) => {
    try {
      const response = await axios.delete(`${Url}/flashcard/${c.id}`);

      if (response.status == 200) {
        fetchFlashcard();
      } else {
        setMessages({ type: "danger", text: response.data.message });
      }
    } catch (e) {
      setMessages({ type: "danger", text: e.message });
    }
  };
  useEffect(() => {
    fetchFlashcard();
  }, []);

  console.log(cards);

  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="lg">
        <Typography className={classes.text} variant="h5" gutterBottom>
          My Flashcard
        </Typography>
        <List className={classes.list}>
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="center"
            spacing={2}
          >
            {cards.map((c) => {
              return (
                <React.Fragment>
                  <Grid item xs={4}>
                    <Flashcard
                      cards={c}
                      setMode={(mode) => {
                        setCards(
                          cards.map((card) =>
                            card.id === c.id ? { ...c, mode } : card
                          )
                        );
                      }}
                      remove={() =>
                        setCards(cards.filter((card) => card.id !== c.id))
                      }
                      setCard={(updatedCard) =>
                        setCards(
                          cards.map((fillcard) =>
                            fillcard.id === c.id ? updatedCard : fillcard
                          )
                        )
                      }
                      postFlashcard={() => {
                        fetchUpdateCard(c);
                      }}
                      putUpdate={() => {
                        updateCard(c);
                      }}
                      deleteCard={() => {
                        deleteCard(c);
                      }}
                    />
                  </Grid>
                </React.Fragment>
              );
            })}
          </Grid>
        </List>

        <AppBar position="fixed" color="primary" className={classes.appBar}>
          <Toolbar>
            <Tooltip title="Add" aria-label="add">
              <Fab
                color="secondary"
                aria-label="add"
                className={classes.fabButton}
              >
                <AddIcon
                  onClick={(e) => {
                    setCards([
                      ...cards,
                      {
                        id: 0,
                        word: "",
                        word_type: "",
                        definition: "",
                        example_sentence: "",
                        image: "",
                        mode: Mode.Edit,
                      },
                    ]);

                    setOpen(true);
                  }}
                />
              </Fab>
            </Tooltip>
            <div className={classes.grow} />
          </Toolbar>
        </AppBar>
      </Container>
    </React.Fragment>
  );
};
export default Flashcards;
