import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 400,
    maxWidth: 400,
    minHeight: 300,
    maxHeight: 300,
    transition: "150ms",
    transformStyle: "preserve-3d",
    marginTop: "15%",
  },
}));

const AddNew = (props) => {
  const classes = useStyles();

  const {setUpdateCard, card, postFlashcard} = props;
  
  return (
    <React.Fragment>
      <Grid
        className={classes.root}
        container
        direction="column"
        justify="space-between"
        alignItems="center"
      >
        <TextareaAutosize aria-label="empty textarea" placeholder="word" onChange={(e)=> postFlashcard({...card,word: e.target.value})}/>
        <TextareaAutosize
          aria-label="empty textarea"
          placeholder="word type e.g noun"
          onChange={(e)=> postFlashcard({ ...card, word_type: e.target.value })}
        />
        <TextareaAutosize
          aria-label="minimum height"
          rowsMin={3}
          placeholder="definition"
          onChange={(e)=> postFlashcard({...card,definition: e.target.value})}
        />
        <TextareaAutosize
          aria-label="minimum height"
          rowsMin={3}
          placeholder="example sentence"
          onChange={(e)=> postFlashcard({...card,example_sentence: e.target.value})}
        />
        <TextareaAutosize
          aria-label="minimum height"
          rowsMin={3}
          placeholder="image url"
          onChange={(e)=> postFlashcard({...card,image: e.target.value})}
        />
        <Button
          variant="contained"
          color="primary"
          onChange={()=> setUpdateCard(card)}
        >
          Save
        </Button>
      </Grid>
    </React.Fragment>
  );
};
export default AddNew;
