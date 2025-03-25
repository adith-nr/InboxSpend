import React from 'react'
import './Home.css'
import Button from "@mui/material/Button";
import {Link} from "react-router-dom"
function Home() {
  return (
    <div className='containerH'>
        <div>
        <Link to={"/login"}>
          <Button variant='contained'>Login</Button>
        </Link>
        </div>
        
        <div>
        <Link to={"/signup"}>
          <Button variant='contained'>Sign Up</Button>
        </Link>
        </div>
      
      
    </div>
  )
}

export default Home
