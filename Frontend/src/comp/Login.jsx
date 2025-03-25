import React,{ useState } from 'react'
import './Login.css'
import { Link,useNavigate } from 'react-router-dom'

import Button from "@mui/material/Button";
import Input from "@mui/material/Input";
function Login() {
  const [data,setData]= useState({
          email:"",
          password:""
      }
      )
      const [error,setError]=useState(false)
      const navigate=useNavigate()
      
  
      function handleChange(e){
          setData({...data,[e.target.name]:e.target.value})
      }
      async function handleSubmit(e){
          e.preventDefault()
          try {
              const res = await fetch("http://localhost:4000/login",{
                  method:"POST",
                  headers:{ "Content-Type": "application/json" },
                  body:JSON.stringify(data)
              })
              const resdata = await res.json()
              if(res.ok){
                localStorage.setItem("token",resdata.token)
                //alert(resdata.token)
                alert(resdata.message)
                navigate("/profile")
              }
              else{
                alert(resdata.message)
              }
              
          } catch (error) {
              console.log(error)
              setError(true)
          }
      }
    return (
    
            <div className="container">
             
                 <form action="" onSubmit={handleSubmit} className='left'>
                      <h2>Login to your account</h2>
                      <label htmlFor="email">Email:</label>
                      <Input type="email" name="email" value={data.email} onChange={handleChange} id='inp'/>
                      <label htmlFor="password">Password:</label>
                      <Input type="password" name="password" value={data.password} onChange={handleChange} id='inp'/>
                      <Button variant="contained"type='submit' id='btn'>Sign In</Button>
                      <Link to='/signup' id='new'>
                        New here? SignUp
                      </Link>
                  </form>
            </div>
        
   
    )
  }
  
export default Login
