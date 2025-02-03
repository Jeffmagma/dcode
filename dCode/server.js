import express from "express";
import pkg from "express-openid-connect";
import knex from "knex";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import cors from "cors";

const { auth, requiresAuth } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pg = knex({
  client: "pg",
  connection: {
    host: "db",
    password: "asdfasdf123123",
    port: 5432,
    user: "postgres",
    database: "example",
  },
});

const app = express();
app.use(cors());
app.use(express.json());

const frontend = path.join(__dirname, "dist");

app.use(express.static(frontend));

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: "your secret here",
  baseURL: "http://localhost:3000",
  clientID: "XUZuvE6pKXJ1di0ZaTnBNpfzxFswNHxI",
  issuerBaseURL: "https://dev-6omitcvbhwq5hvfk.us.auth0.com",
};
app.use(auth(config));

app.get("/api/problems", (req, res) => {
  pg("problems")
    .select()
    .then((problems) => {
      res.json(problems);
    });
});

app.get("/api/problems/:id", (req, res) => {
  pg("problems")
    .select()
    .where("problem_id", req.params.id)
    .then((problems) => {
      res.json(problems);
    });
});

app.get("/pg", function (req, res, next) {
  pg.raw("select VERSION() version")
    .then((x) => x.rows[0])
    .then((row) =>
      res.json({ message: `Hello from postgresql ${row.version}` })
    )
    .catch(next);
});

app.get("/api/db", function (req, res, next) {
  pg("users")
    .select()
    .then((users) => res.json({ users }))
    .catch(next);
});

app.get("/api/users", (req, res) => {
  pg("users")
    .select()
    .then((users) => {
      res.json(users);
    });
});

app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user, null, 2));
});

app.get('/api/user', (req, res) => {
  res.send({id: req.oidc.user.sub});
});

app.post("/api/users/placement-complete", (req, res) => {
  const {auth0_user_id} = req.body;

  if (!auth0_user_id) {
    return res.status(400).send("Missing auth0_user_id");
  }

  pg("users")
  .update({
    placement_test_taken: true
  })
  .where("auth0_user_id", auth0_user_id)
  .then(() => {
    res.status(200).send("Placement test status updated");
  })
  .catch((error) => {
    console.error("Error updating placement test status");
    res.status(500).send("Internal Server Error");
  })
});


app.post('/api/users/:id/add-saved-attempt', (req, res) => {
  const { id } = req.params;
  const { problem_id, description } = req.body;
  pg('users')
    .update({ saved_attempts: pg.raw('jsonb_set(??, ?, ?::jsonb)', ['saved_attempts', "{" + problem_id + "}", JSON.stringify(description)]) }).where('auth0_user_id', id)
    .then(() => {
      res.status(201).send("Saved attempt added");
    })
    .catch((error) => {
      console.error("Error inserting saved attempt:", error);
      res.status(500).send("Internal Server Error");
    });
});

app.get("/a", (req, res) => {
  console.log(req.oidc.isAuthenticated());
  res.send(req.oidc.isAuthenticated() ? "Logged in" : "Logged out");
});

app.get("/api/users/:id/saved-attempts", (req, res) => {
  const { id } = req.params;
  pg("users")
    .select("saved_attempts")
    .where("id", id)
    .then((users) => {
      res.json(users);
    });
});

app.get("/api/users/:id/saved-attempts/:problem_id", (req, res) => {
  const { id, problem_id } = req.params;
  pg("users")
    .select("saved_attempts")
    .where("id", id)
    .then((users) => {
      res.json(users);
    });
});

app.post("/api/add-user", requiresAuth(), (req, res) => {
  const auth0_user_id = req.oidc.user.sub;

  if (!auth0_user_id) {
    return res.status(400).send("Missing auth0_user_id");
  }

  pg("users")
    .insert({ auth0_user_id })
    .onConflict("auth0_user_id")
    .ignore()
    .then(() => {
      res.status(201).send("User added successfully");
    });
});

const OPENAI_API_KEY =
  "your openapi key here";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

const callOpenAI = async (prompt) => {
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Act like a javascript code generator. 
              You will be provided with a plain English sentence. 
              Your task is to generate a piece of JavaScript code with a function named foo.
              Check the following exceptions: 
              If the user input is a javascript code, then return "exception 1".
              Example: Me: "function foo(a, b) { return a + b; }", You: "exception 1".
              Example: Me: "What does it do? function foo(a, b) { return a + b; }", You: "exception 1".
              If the user input is unrelated to describing a code, then return "exception 2".
              Example: Me: "aaa", You: "exception 2".
              Example: Me: "Hi." You: "exception 2".
              Example: Me: "" You: "exception 2".`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 512,
        top_p: 1,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI API:", error.message);
  }
};

app.get("/profile", requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user, null, 2));
});

app.get("/api/user", (req, res) => {
  res.send(req.oidc.user.sub);
});

app.post("/api/users/placement", (req, res) => {
  const {auth0_user_id} = req.body;

  if (!auth0_user_id) {
    return res.status(400).send("Missing auth0_user_id");
  }

  pg("users")
    .select("placement_test_taken")
    .where("auth0_user_id", auth0_user_id)
    .then((users) => {
      res.json(users[0]);
    });
})


app.post("/api/openai-test", async (req, res) => {
  const { prompt } = req.body;
  try {
    // call OpenAI and get generated code
    const generatedCode = await callOpenAI(prompt);
    res.json({ generatedCode });
  } catch (error) {
    console.error("Error in /api/openai-test route:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/test-generated-code", async (req, res) => {
  const { generatedCode, id } = req.body;
  let fetchedTests;

  try {
    // (1) fetch problem
    const response = await axios.get(
      `http://localhost:3000/api/problems/${id}`
    );
    fetchedTests = response.data[0].tests;

    // (2) convert code string into javascript function
    const appendHelper = `return (${generatedCode})`;
    const foo = new Function(appendHelper)();

    // (4) run the generated function with stored input
    const outputs = [];
    const output1 = foo.apply(null, fetchedTests.test1.input);
    const output2 = foo.apply(null, fetchedTests.test2.input);
    const output3 = foo.apply(null, fetchedTests.test3.input);
    const output4 = foo.apply(null, fetchedTests.test4.input);
    const output5 = foo.apply(null, fetchedTests.test5.input);
    
    outputs.push(output1, output2, output3, output4, output5);

    const result = {
      actualOutput1: outputs[0],
      actualOutput2: outputs[1],
      actualOutput3: outputs[2],
      actualOutput4: outputs[3],
      actualOutput5: outputs[4],
    };

    res.json({ result });
  } catch (error) {
    console.error("Error in /api/openai-test route:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/problem-complete", requiresAuth(), (req, res) => {
  const { auth0_user_id, problem_id, score, user_description, generated_code } = req.body;
  const status = score === 100 ? "complete" : "incomplete";

  pg("user_problem_attempts")
    .insert({
      auth0_user_id,
      problem_id,
      status,
      score,
      user_description,
      generated_code,
    })
    .then(() => {
      res.status(201).send("Problem marked as complete");
    })
    .catch((error) => {
      console.error("Error inserting problem attempt:", error);
      res.status(500).send("Internal Server Error");
    });
});

app.get(
  "/api/user-problem-attempts/:auth0_user_id/:problem_id",
  requiresAuth(),
  (req, res) => {
    const { auth0_user_id, problem_id } = req.params;

    pg("user_problem_attempts")
      .select("status", "score", "attempt_date")
      .where({ auth0_user_id, problem_id })
      .then((attempts) => {
        res.json(attempts);
      })
      .catch((error) => {
        console.error("Error fetching user problem attempts:", error);
        res.status(500).send("Internal Server Error");
      });
  }
);

app.post("/api/problem-complete", requiresAuth(), (req, res) => {
  const { auth0_user_id, problem_id, score } = req.body;
  const status = "complete";

  pg("user_problem_attempts")
    .insert({
      auth0_user_id,
      problem_id,
      status,
      score,
    })
    .then(() => {
      res.status(201).send("Problem marked as complete");
    })
    .catch((error) => {
      console.error("Error inserting problem attempt:", error);
      res.status(500).send("Internal Server Error");
    });
});

app.get(
  "/api/user-problem-attempts/:auth0_user_id/:problem_id",
  requiresAuth(),
  (req, res) => {
    const { auth0_user_id, problem_id } = req.params;

    pg("user_problem_attempts")
      .select("status", "score", "attempt_date")
      .where({ auth0_user_id, problem_id })
      .then((attempts) => {
        res.json(attempts);
      })
      .catch((error) => {
        console.error("Error fetching user problem attempts:", error);
        res.status(500).send("Internal Server Error");
      });
  }
);

app.use("/", express.static(frontend));

app.use((req, res, next) => {
  res.sendFile(path.join(frontend, "index.html"));
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
