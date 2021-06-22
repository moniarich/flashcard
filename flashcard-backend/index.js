const express = require("express");
const app = express();
const cors = require("cors");
const { v4 } = require("uuid");
const session = require("express-session");
const DynamoDBStore = require("connect-dynamodb")(session);
const mysql = require("./mysql");
const fs = require("fs");
const bb = require("express-busboy");
const mimetype = require("mime-types");
const path = require("path");
const AWS = require("aws-sdk");
const serverless = require("serverless-http");

AWS.config.update({
  region: "us-east-1",
});
const s3 = new AWS.S3();

const docClient = new AWS.DynamoDB.DocumentClient();

app.use("/public", express.static(__dirname + "/tmp"));

var corsOptions = {
  origin: "http://flashcard-monika.s3-website-us-east-1.amazonaws.com",
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
app.use(express.json());

const port = process.env.PORT || 3001;
const sess = {
  secret: "keyboard cat",
  cookie: {},
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sess.cookie.secure = true; // serve secure cookies
}

app.use(
  session({
    store: new DynamoDBStore({
      table: "session",
      readCapacityUnits: 1,
      writeCapacityUnits: 1,
    }),
    genid: function (req) {
      return v4(); // use UUIDs for session IDs
    },
    secret: "keyboard cat",
    cookie: { maxAge: 6000000 },
    resave: true,
    proxy: true,
    saveUninitialized: true,
  })
);

app.get("/flashcard", async (req, res) => {
  if (!req.session.first) {
    const params = {
      TableName: "flashcard",
      Item: {
        id: v4(),
        userid: req.sessionID,
        word: "Misguide",
        word_type: "verb",
        definition: "to guide or direct wrongly or badly",
        example_sentence:
          "a long survey that can only baffle and misguide the general reader",
        image: "tmp/misguide.jpeg",
      },
    };
    try {
      await docClient.put(params).promise();
    } catch (e) {
      res.status(500).end(JSON.stringify({ error: e.message }));
      return;
    }
  }

  req.session.first = true;

  const params = {
    TableName: "flashcard",
    IndexName: "userid",
    ExpressionAttributeNames: {
      "#userid": "userid",
    },
    ExpressionAttributeValues: {
      ":userid": req.sessionID,
    },
    KeyConditionExpression: "#userid = :userid",
  };

  try {
    const rows2 = await docClient.query(params).promise();
    res.status(200).end(JSON.stringify(rows2.Items));
  } catch (e) {
    res.status(500).end(JSON.stringify({ error: e.message }));
  }
});

const publicDir = "/tmp";

const acceptedExtension = {
  "image/jpeg": true,
  "image/pjpeg": true,
  "image/webp": true,
  "image/png": true,
  "image/svg+xml": true,
  "image/gif": true,
  "image/vnd.microsoft.icon": true,
};

bb.extend(app, {
  upload: true,
  path: publicDir,
  allowedPath: /./,
  // mimeTypeLimit: [],
});
app.post("/upload", async (req, res) => {
  console.log("hhhhhhhh");
  if (acceptedExtension[req.files.file.mimetype] !== true) {
    res.setHeader("content-type", "application/json");
    res.status(400).end(
      JSON.stringify({
        message: "The file extension you have entered is not supported",
      })
    );
    return;
  }
  try {
    const file = fs.createReadStream(req.files.file.file);
    const key = (req.files.file.file || "").slice(1);
    await s3
      .putObject({
        Bucket: "flashcard-monika",
        Key: key,
        Body: file,
        ACL: "public-read",
        ContentType: req.files.file.mimetype,
      })
      .promise();

    res.status(200).end(
      JSON.stringify({
        image: key,
      })
    );
  } catch (e) {
    res.status(500).end(
      JSON.stringify({
        message: "Sorry, the file was not uploaded",
      })
    );
  }
});

app.post("/flashcard", async (req, res) => {
  const body = req.body.flashcard;
  const params = {
    TableName: "flashcard",
    IndexName: "userid",
    ExpressionAttributeNames: {
      "#userid": "userid",
    },
    ExpressionAttributeValues: {
      ":userid": req.sessionID,
    },
    KeyConditionExpression: "#userid = :userid",
  };
  try {
    const rows2 = await docClient.query(params).promise();
    res.status(200).end(JSON.stringify(rows2.Items));
  } catch (e) {
    res.status(500).end(JSON.stringify({ error: e.message }));
  }
  const paramss = {
    TableName: "flashcard",
    Item: {
      id: v4(),
      userid: req.sessionID,
      word: body.word,
      word_type: body.word_type,
      definition: body.definition,
      example_sentence: body.example_sentence,
      image: body.image,
    },
  };
  try {
    await docClient.put(paramss).promise();
  } catch (e) {
    res.status(500).end(JSON.stringify({ error: e.message }));
    return;
  }
});

app.put("/flashcard", async (req, res) => {
  const body = req.body.flashcard;
  const params = {
    TableName: "flashcard",
    Key: {
      id: body.id,
    },
    UpdateExpression:
      "set #word=:word, #word_type=:word_type, #definition=:definition, #example_sentence=:example_sentence, #image=:image ",
    ExpressionAttributeNames: {
      "#word": "word",
      "#word_type": "word_type",
      "#definition": "definition",
      "#example_sentence": "example_sentence",
      "#image": "image",
    },
    ExpressionAttributeValues: {
      ":word": body.word,
      ":word_type": body.word_type,
      ":definition": body.definition,
      ":example_sentence": body.example_sentence,
      ":image": body.image,
    },
    ReturnValues: "UPDATED_NEW",
  };

  try {
    const rows2 = await docClient.update(params).promise();
    res.status(200).end(JSON.stringify({ message: "updated" }));
  } catch (e) {
    res.status(500).end(JSON.stringify({ error: e.message }));
  }
});

app.delete("/flashcard/:id", async (req, res) => {
  const paramss = {
    TableName: "flashcard",
    Key: {
      id: req.params.id,
    },
  };

  try {
    const rows2 = await docClient.delete(paramss).promise();
    res.status(200).end(JSON.stringify(rows2.Items));
  } catch (e) {
    res.status(500).end(JSON.stringify({ error: e.message }));
  }
});

module.exports.handler = serverless(app);
