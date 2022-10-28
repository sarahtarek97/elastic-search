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

router.post("/search/:keyword", async (req, res) => {
  const { keyword } = req.params;
  const playerData = [];

  await client.indices.refresh({ index: "workout" });

  const { body } = await client.search({
    index: "workout",
    body: {
      query: {
        match: {
          "_doc.id": { query: keyword, fuzziness: "auto" },
        },
      },
      sort: { "_doc.id": "desc" },
      highlight: {
        pre_tags: ["<strong>"],
        post_tags: ["</strong>"],
        fields: {
          "_doc.id": {},
        },
      },
    },
  });

  if (body.hits.hits.length == 0) {
    console.log("No Match");
  } else {
    body.hits.hits.forEach((el) => {
      playerData.push(el._source._doc);
    });
  }

  return res.status(200).json({
    message: "success",
    data: playerData,
  });
});

module.exports = router;
