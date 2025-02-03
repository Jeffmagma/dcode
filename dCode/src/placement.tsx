// placement.tsx
import { Box, Button, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const Placement: React.FC = () => {
  const [problemEasy, setProblemEasy] = useState<string>("");
  const [problemMedium, setProblemMedium] = useState<string>("");
  const [problemHard, setProblemHard] = useState<string>("");

  const [promptEasy, setPromptEasy] = useState("");
  const [promptMedium, setPromptMedium] = useState("");
  const [promptHard, setPromptHard] = useState("");

  const [testsEasy, setTestsEasy] = useState<string>("");
  const [testsMedium, setTestsMedium] = useState<string>("");
  const [testsHard, setTestsHard] = useState<string>("");

  React.useEffect(() => {
    const fetchProblems = async (id: number) => {
      try {
        const fetchedProblems = await axios.get(
          `http://localhost:3000/api/problems/${id}`
        );
        if (id === 1) {
          setProblemEasy(fetchedProblems.data[0].code);
          setTestsEasy(fetchedProblems.data[0].tests);
        } else if (id === 2) {
          setProblemMedium(fetchedProblems.data[0].code);
          setTestsMedium(fetchedProblems.data[0].tests);
        } else {
          setProblemHard(fetchedProblems.data[0].code);
          setTestsHard(fetchedProblems.data[0].tests);
        }
      } catch (error) {
        console.error("Error fetching problems: ", error);
      }
    };

    fetchProblems(1);
    fetchProblems(2);
    fetchProblems(3);
  }, []);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const userResponse = await axios.get("http://localhost:3000/api/user");
      const auth0_user_id = userResponse.data.id;

      if (!auth0_user_id) {
        alert("User ID is missing.");
        return;
      }

      await axios.post("http://localhost:3000/api/users/placement-complete", {
        auth0_user_id: String(auth0_user_id),
      });

    } catch (error: any) {
      console.error("Error handling submit: " + error);
    }
    navigate("/dcode/result", {
      state: {
        promptEasy,
        promptMedium,
        promptHard,
        testsEasy,
        testsMedium,
        testsHard,
      },
    });
  };

  return (
    <div className="App">
      {/* Header */}
      <Typography
        variant="h4"
        gutterBottom
        style={{
          position: "absolute",
          top: "12%",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        Placement Test
      </Typography>

      <form onSubmit = {handleSubmit}>
      {/* Problem 1 */}
      <Box
       mt={10}
        sx={{
          gap: 2,
          display: "flex",
          alignItems: "center",
          height: "35vh",
          flexDirection: "row",
        }}
      >
        <Box
          sx={{
            width: 25,
            height: 25,
            bgcolor: "primary.main",
            color: "white",
            borderRadius: "4px",
          }}
        >
          <Typography variant="body1">{1}</Typography>
        </Box>

        <Box width = "100%" component="pre" bgcolor="black" p={4} borderRadius={4}>
          <Box>
              <pre
                style={{
                  fontSize: "18px",
                  width: "100%",
                  whiteSpace: "pre-wrap",
                  color: 'white',
                }}
              >
                {problemEasy}
              </pre>
            </Box>
        </Box>
      </Box>
      <Box
        sx={{
          width : 600,
        }}
      >
        <TextField
          fullWidth
          id="description"
          label="Type your function description in plain English below"
          multiline
          minRows={4}
          maxRows={10}
          InputProps={{
            style: {
              color: "black",
            },
          }}
          onChange = {(e) => setPromptEasy(e.target.value)}
        />
      </Box>
      {/* Problem 2 */}
      <Box
        sx={{
          gap: 2,
          display: "flex",
          alignItems: "center",
          height: "35vh",
          flexDirection: "row",
        }}
      >
        <Box
          sx={{
            width: 25,
            height: 25,
            bgcolor: "primary.main",
            color: "white",
            borderRadius: "4px",
          }}
        >
          <Typography variant="body1">{2}</Typography>
        </Box>

        <Box width = "100%" component="pre" bgcolor="black" p={4} borderRadius={4}>
          <Box>
              <pre
                style={{
                  fontSize: "18px",
                  width: "100%",
                  whiteSpace: "pre-wrap",
                  color: 'white',
                }}
              >
                {problemMedium}
              </pre>
            </Box>
        </Box>
      </Box>
      <Box
        sx={{
          width : 600,
        }}
      >
        <TextField
          fullWidth
          id="description"
          label="Type your function description in plain English below"
          multiline
          minRows={4}
          maxRows={10}
          InputProps={{
            style: {
              color: "black",
            },
          }}
          onChange = {(e) => setPromptMedium(e.target.value)}
        />
      </Box>
      {/* Problem 3 */}
      <Box
        sx={{
          gap: 2,
          display: "flex",
          alignItems: "center",
          height: "35vh",
          flexDirection: "row",
        }}
      >
        <Box
          sx={{
            width: 25,
            height: 25,
            bgcolor: "primary.main",
            color: "white",
            borderRadius: "4px",
          }}
        >
          <Typography variant="body1">{3}</Typography>
        </Box>


        <Box width={480} component="pre" bgcolor="black" p={4} borderRadius={4}>
   
          <Box>
              <pre
                style={{
                  fontSize: "18px",
                  width: "100%",
                  whiteSpace: "pre-wrap",
                  color: 'white',
                }}
              >
                {problemHard}
              </pre>
            </Box>
        </Box>
      </Box>
      <Box
        sx={{
          width : 600,
        }}
      >
        <TextField
          fullWidth
          id="description"
          label="Type your function description in plain English below"
          multiline
          minRows={4}
          maxRows={10}
          InputProps={{
            style: {
              color: "black",
            },
          }}
          onChange = {(e) => setPromptHard(e.target.value)}
        />
      </Box>

      {/* Submit Button */}
      <Button 
      type="submit" 
      variant="contained" 
      sx={{ mt: 7, mb: 2}}>
        End Test and Submit
      </Button>
      </form>
    </div>
  );
};

export default Placement;
