// src/home.tsx
import { Outlet, Link, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

function Home() {
  const { logout } = useAuth0();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout({});
    setTimeout(() => {
      navigate('/');
    }, 0);  
  };

  axios.post('http://localhost:3000/api/add-user');

  return (
    <div>
      <AppBar>
        <Toolbar>
          <Grid container justifyContent="space-between" alignItems="center">
          <Grid>
          <Button color="inherit" component={Link} to="/dcode/problems">Problems</Button>
          <Button color="inherit" component={Link} to="/dcode/placement">Placement</Button>
          <Button color="inherit" component={Link} to="/dcode/about">About</Button>
          </Grid>
          <Grid sx={{display: "flex", justifyContent: "center", height: 35, width: 80, borderRadius: "8px", bgcolor: "#ee4444"}}>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
          </Grid>
          </Grid> 
        </Toolbar>
      </AppBar>
      <Container>
        <Outlet />
      </Container>
    </div>
  );
}

export default Home;
