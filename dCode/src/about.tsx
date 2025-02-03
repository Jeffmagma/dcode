import './App.css';
import { Box} from "@mui/material";

function About() {
  return (
    <div className="App" style={{ width: '130vh', height: '100vh', paddingTop : '10vh', display: 'flex', flexDirection: 'column' }}>
      <Box>
      <h2>About Us</h2>
      <h3>dcode is an education application that allows users to practice and enhance their code comprehension skills.</h3>
      </Box>
      <Box sx ={{paddingTop : '10vh', }}>
      <h2>Feature</h2>
      <h3>Our application will support questions of varying difficulty, and each question will be tagged with an appropriate label. </h3>
      </Box>
      
    </div>
  );
}

export default About;
