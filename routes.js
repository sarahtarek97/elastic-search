const express = require("express");
const router = express.Router();
const elasticsearch = require("elasticsearch");
const client = new elasticsearch.Client({
  host: "localhost:9200",
  log: "trace",
});

const workouts = [
  { id: 1, type: "Weight", duration: 45, date: "02/09/2022" },
  { id: 2, type: "Run", duration: 30, date: "02/09/2022" },
];

router.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

router.get("/workout", (req, res) => {
  return res.status(200).send({
    message: "GET workouts call succeded",
    workout: workouts,
  });
});

router.get("/workout/:id", (req, res) => {
  let workout;

  client.get(
    {
      index: "workout",
      type: "mytype",
      id: req.params.id,
    },
    function (err, resp, status) {
      if (err) {
        console.log("err:", err);
      } else {
        workout = resp._source;
        console.log("Workout://", workout);
        if (!workout) {
          return res.status(400).send({
            message: "workouts is not found",
          });
        }
        return res.status(200).send({
          message: "GET workouts call succeded",
          workout: workout,
        });
      }
    }
  );
});

router.post("/workout", (req, res) => {
  if (!req.body.id) {
    return res.status(400).send({
      message: "ID is required",
    });
  }

  client.index(
    {
      index: "workout",
      type: "mytype",
      id: req.body.id,
      body: req.body,
    },
    function (err, resq, status) {
      if (err) {
        console.log("ooo");
        console.log(err);
      } else {
        return res.status(200).send({
          message: "POST: saved in ELK success",
        });
      }
    }
  );
});

module.exports = router;
