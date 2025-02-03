import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Typography,
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  LinearProgress,
} from "@mui/material";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import { useParams } from "react-router-dom";
import "./App.css";

const Problem: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [prompt, setPrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [result, setResult] = useState("");
  const [attempts, setAttempts] = useState<
    { score: number; attempt_date: string }[]
  >([]);
  const [showHistory, setShowHistory] = useState(false);
  const [problemTests, setProblemTests] = useState<any>(null);
  const [problemCode, setProblemCode] = useState<string>("");
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState<number>(0);
  const [passedTests, setPassedTests] = useState<number>(0);
  const actualOutputs: any[] = [];

  const exception1 =
    "Your description is a javascript code. Please describe the code in plain English.";
  const exception2 =
    "Your description is an invalid sentence. Please describe the code in plain English.";

  useEffect(() => {
    if (!id) {
      alert("Problem ID is missing.");
      return;
    }
    console.log("Problem ID:", id);

    const fetchProblems = async () => {
      try {
        const fetchedProblems = await axios.get(
          `http://localhost:3000/api/problems/${id}`
        );
        setProblemTests(fetchedProblems.data[0].tests);
        setProblemCode(fetchedProblems.data[0].code);
      } catch (error) {
        console.error("Error fetching problems: ", error);
      }
    };
    fetchProblems();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:3000/api/openai-test",
        {
          prompt,
        }
      );

      let trimmedCode = response.data.generatedCode;

      if (trimmedCode === "exception 1") {
        setGeneratedCode(exception1);
        setResult("");
        setScore(0);
        setShowResults(false);
        return;
      } else if (trimmedCode === "exception 2") {
        setGeneratedCode(exception2);
        setResult("");
        setScore(0);
        setShowResults(false);
        return;
      }
      let code = trimmedCode.split("```javascript");
      code = code[1].split("```");

      setGeneratedCode(code[0]);

      const response2 = await axios.post(
        "http://localhost:3000/api/test-generated-code",
        { generatedCode: code[0], id: id }
      );

      setResult(response2.data);

      const obj = response2.data;
      const totalTests = Object.keys(problemTests).length;
      let passedTestsCount = 0;
      for (let i = 1; i <= totalTests; i++) {
        if (
          obj.result[`actualOutput${i}`] === problemTests[`test${i}`].output
        ) {
          passedTestsCount++;
        }
      }
      const calculatedScore = Math.round((passedTestsCount / totalTests) * 100);
      setScore(calculatedScore);
      setPassedTests(passedTestsCount);

      const userResponse = await axios.get("http://localhost:3000/api/user");
      const auth0_user_id = userResponse.data;

      if (!id) {
        alert("Problem ID is missing.");
        return;
      }

      await axios.post("http://localhost:3000/api/problem-complete", {
        auth0_user_id: String(auth0_user_id),
        problem_id: parseInt(id, 10),
        score: calculatedScore,
        user_description: prompt,
        generated_code: code[0],
      });

      setShowResults(true);
    } catch (error) {
      setGeneratedCode("Error: " + (error as Error).message);
      alert("There was an error marking the problem as complete.");
    }
  };

  const handleViewHistory = async () => {
    try {
      const userResponse = await axios.get("http://localhost:3000/api/user");
      const auth0_user_id = userResponse.data;

      if (!id) {
        alert("Problem ID is missing.");
        return;
      }

      const attemptsResponse = await axios.get(
        `http://localhost:3000/api/user-problem-attempts/${auth0_user_id}/${id}`
      );
      setAttempts(attemptsResponse.data.reverse());
      setShowHistory(true);
    } catch (error) {
      console.error("Error fetching problem attempts:", error);
      alert("There was an error fetching the problem attempts.");
    }
  };

  async function save() {
    console.log('Saving code:', prompt);
    // Save the generated code, TODO get user id
    const response = await axios.get('/api/user');
    console.log(response.data);
    const userId = response.data.id;
    axios.post('/api/users/'+userId+'/add-saved-attempt', {
      problem_id: id,
      description: prompt
    })
      .then(response => {
        console.log('Code saved:', response.data);
      })
      .catch(error => {
        console.error('Error saving code:', error);
      });
  }
  
  const handleCloseHistory = () => {
    setShowHistory(false);
  };

  const getStatusColor = (score: number) => {
    return score === 100 ? "green" : "red";
  };

  const getStatusText = (score: number) => {
    return score === 100 ? "PASSED" : "FAILED";
  };

  const testResult = (testCase: number) => {
    const testIndex = testCase - 1;
    const testNumber = `test${testCase}`;
    const description = problemTests[testNumber].description;
    const expectedOutput = problemTests[testNumber].output;
    let actualOutput;
    if (
      typeof expectedOutput === "number" &&
      !Number.isInteger(expectedOutput)
    ) {
      const decimal = expectedOutput.toString().split(".");
      const digitNum = decimal[1].length;
      actualOutput = Number(actualOutputs[testIndex].toFixed(digitNum));
    } else {
      actualOutput = actualOutputs[testIndex];
    }
    const passed = actualOutput === expectedOutput ? "Pass" : "Fail";

    const text = `Test Case ${testCase} \n  Description: ${description} \n Inputs: [${problemTests[testNumber].input}] \n Expected Output: ${expectedOutput} \n Actual Output: ${actualOutput} \n Result: ${passed} \n \n`;
    return (
      <Typography variant="h6" style={{ whiteSpace: "pre-line",  color: 'white' }}>
        {text}
      </Typography>
    );
  };

  const displayResult = () => {
    if (result === "") {
      return result;
    }

    const text = JSON.stringify(result, null, 2);
    const obj = JSON.parse(text);

    actualOutputs.push(
      obj.result.actualOutput1,
      obj.result.actualOutput2,
      obj.result.actualOutput3,
      obj.result.actualOutput4,
      obj.result.actualOutput5
    );

    return (
      <Grid item>
        <Box component="pre" bgcolor="black" p={4} mt={4} borderRadius={4}>
          {testResult(1)}
        </Box>
        <Box component="pre" bgcolor="black" p={4} mt={4} borderRadius={4}>
          {testResult(2)}
        </Box>
        <Box component="pre" bgcolor="black" p={4} mt={4} borderRadius={4}>
          {testResult(3)}
        </Box>
        <Box component="pre" bgcolor="black" p={4} mt={4} borderRadius={4}>
          {testResult(4)}
        </Box>
        <Box component="pre" bgcolor="black" p={4} mt={4} borderRadius={4}>
          {testResult(5)}
        </Box>
      </Grid>
    );
  };

  return (
    <div className="App">
      {problemCode && (
        <Box
          component="pre"
          bgcolor="black"
          p={4}
          mt={10}
          borderRadius={4}
          sx={{
            color: "white",
            boxShadow: 3,
            fontFamily: "monospace",
            fontSize: "18px",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
        >
          {problemCode}
        </Box>
      )}
      <Typography variant="h5" mt={4}>
        Describe the code above in plain English.
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          multiline
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          variant="outlined"
          fullWidth
          margin="normal"
          InputProps={{
            style: {
              color: "black",
            },
          }}
        />
        {!showResults &&
          (generatedCode === exception1 || generatedCode === exception2) && (
            <>
              <Box bgcolor="black" p={4} mt={4} borderRadius={4}>
                <Typography variant="h5" style={{ color: 'white' }}>{generatedCode}</Typography>
              </Box>
            </>
          )}
        <Grid container spacing={2} justifyContent="center" mt={4}>
          <Grid item>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="warning"
              onClick={handleViewHistory}
            >
              View History
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="secondary" onClick={save}>
              Save
            </Button>
          </Grid>
        </Grid>
      </form>
      {showResults && (
        <>
          <Box
            mt={4}
            p={2}
            bgcolor={score === 100 ? "green" : "red"}
            borderRadius={2}
          >
            <Typography variant="h6" style={{ color: "white" }}>
              {score === 100 ? "All Tests Passed" : "Test Cases Failed"}
            </Typography>
            <Typography variant="h6" style={{ color: "white" }}>
              {score}%
            </Typography>
            <Typography variant="h6" style={{ color: "white" }}>
              {`${passedTests}/${Object.keys(problemTests).length}`}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={score}
            sx={{
              mt: 2,
              height: 13,
              borderRadius: 5,
              "& .MuiLinearProgress-bar": {
                bgcolor: "green",
              },
            }}
          />
          <Typography variant="h4" mt={4} style={{ color: 'black' }} >
            Generated JavaScript Code
          </Typography>
          <Box component="pre" bgcolor="black" p={4} mt={4} borderRadius={4} style={{ color: 'white' }} >
            {generatedCode}
          </Box>
          <Typography variant="h4" mt={4} style={{ color: 'black' }}>
            Test Case Results
          </Typography>
          {displayResult()}
        </>
      )}
      <Dialog
        open={showHistory}
        onClose={handleCloseHistory}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Previous Attempts
          <IconButton
            aria-label="close"
            onClick={handleCloseHistory}
            style={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {attempts.map((attempt, index) => (
            <Box
              key={index}
              p={2}
              border={1}
              borderColor="grey.300"
              borderRadius={4}
              mt={2}
            >
              <Typography>
                Status:{" "}
                <span style={{ color: getStatusColor(attempt.score) }}>
                  {getStatusText(attempt.score)}
                </span>
              </Typography>
              <Typography>Score: {attempt.score}</Typography>
              <Typography>
                Date: {new Date(attempt.attempt_date).toLocaleString()}
              </Typography>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistory} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Problem;
