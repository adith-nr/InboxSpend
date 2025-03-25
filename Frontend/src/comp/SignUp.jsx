import React, { useState } from 'react'
import Button from "@mui/material/Button";
import Input from "@mui/material/Input";
import { Link,useNavigate } from 'react-router-dom'
import './SignUp.css'
function Signup() {

    const [data,setData]= useState({

        email:"",
        appPass:"",
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
            const res = await fetch("http://localhost:4000/signup",{
                method:"POST",
                headers:{ "Content-Type": "application/json" },
                body:JSON.stringify(data)
            })
            if(res.ok){
                 const resdata = res.json()
                 console.log(resdata.message)
                 alert("User Registered!")
                 navigate('/login')
            }
            
        } catch (error) {
            console.log(error)
            setError(true)
        }
    }
  return (
    
        <div className="formContainer">
            
                {/* <Link to='/login'>
                    <Button variant='contained'>Sign In</Button>
                </Link> */}
           
           
                <form action="" onSubmit={handleSubmit} id='left'>
                    <h2 id='crT'>Create Account</h2>

                    <label htmlFor="email">Enter Email</label>
                    <Input type="email" name="email" value={data.email} onChange={handleChange} />

                    <label htmlFor="appPass">Enter App Password</label>
                    <Input type="text" name="appPass" value={data.appPass} onChange={handleChange} />
                   
                    <label htmlFor="password">Enter password</label>
                    <Input type="password" name="password" value={data.password} onChange={handleChange}/>
                    <Button type='submit' variant='contained' id='sibtn'>Sign Up</Button>
                     <Link to='/login' id='new'>
                        Existing User? Login
                     </Link>
                </form>
                
                {/* {error ? (
                    <div>
                        Error!
                    </div>
                ):(
                    <div></div>
                )} */}
          
       
        </div>
  )
}

export default Signup
