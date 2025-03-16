import React, { useState } from 'react'
import './Details.css'
 import Input from "@mui/material/Input";
import Button from "@mui/material/Button";
import { PieChart } from '@mui/x-charts/PieChart'
import { BarLoader } from "react-spinners";

function Details() {
    const [Dt,setDt]=useState("")
    const [response,setResponse]=useState()
    const [err,setErr]=useState(false)
    const [loading,setLoading]=useState(false)
    const [email,setEmail]=useState("")
    const [password,setPass]=useState("")
    const [showInput,setShowInput]=useState(true)
    function formatDate(dateG){
        const [year,month,day]=dateG.split('-')
        const monthName=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
        let formatDate=`${day}-${monthName[parseInt(month-1)]}-${year}`
        return formatDate
    }


    async function handleClick() {
        setLoading(true)
        const FDate=formatDate(Dt)
        const data = {date:FDate,email,password}
        try {
            const backendUrl = "https://backendinboxspend.onrender.com";
           
           // const res = await fetch("http://localhost:4000/find",{
            const res = await fetch(`${backendUrl}/find`,{
                method:"POST",
                headers:{ "Content-Type": "application/json" },
                body:JSON.stringify(data)
            })
            const ans = await res.json()
            console.log(ans)
            setResponse(ans)
            console.log("Success") 
            setLoading(false)
            setErr(false)    
            setShowInput(false)       

        } catch (error) {
            console.log("Error ",error)
            setErr(true)
        }
    }
  return (
    <div className='container'>

            {showInput && !loading ? (
                <div>
                    <div className="welcome">
                        <h2 className='heading'>Welcome Back Amigo!</h2>
                        <p>Ready To Check where your money went ;)</p>
                    </div>
                    <div className="det">
                        <label htmlFor="date">Enter Date from when you want the records: </label>
                        <Input id='datePicker' type="date" name="date"  value={Dt} onChange={(e)=>{setDt(e.target.value)}} />
                            <br />
                            <label htmlFor="">Enter Gmail id</label>
                        <Input type="email" id='email' name='email' value={email} onChange={(e)=>{setEmail(e.target.value)}}/>
                        <br />
                        <label htmlFor="pass">Enter App password</label>
                        <Input type="password" id='password' name='password' value={password} onChange={(e)=>{setPass(e.target.value)}}/>
                        <br />
                        <Button variant="contained" id="sbtn" onClick={handleClick} disabled={email=="" || password=="" ? true:false}>Submit</Button>

                    </div>

                </div>
            ):(
                <div></div>
            )}
       
        <div className="load">
          {loading && !err ? (
            <div id='showLoad'>
                 <h2 style={{color:"white"}}>Loading... Just like saving money, it takes patience!</h2>
                 <BarLoader color="#36d7b7" width={200} />
            </div>
           
            
          ):(
            <div></div>
          )}
        </div>
        <div className="output">
            {response  && !loading && !response.error && !err ? (
                <div className="show">
                     Since {formatDate(Dt)} -
                     <div className="b1">
                        <div id='item'>Total Spent:{response.Total}Rs</div>
                        <div id='item'> Spent at Nescafe:{response.Nescafe}Rs</div>
                        <div id='item'>Spent at Night Canteen:{response.NC}Rs</div>
                        <div id='item'> Spent at Amul:{response.Amul}Rs</div>
                        <div id='item'>Spent at Gupta:{response.Gupta}Rs</div>
                        <div id='item'>Spent in Campus: {response.Nescafe+response.NC+response.Amul+response.Gupta}Rs</div>
                        
                     </div>
                  <div className="pie">
                     <h2 id='piet'>Pie chart of Money spent in Campus</h2>
                                        <PieChart id="piec"
                        series={[
                            {
                            data: [
                                { id: 0, value: response.Nescafe, label: 'Nescafe' },
                                { id: 1, value: response.NC, label: 'Night Canteen' },
                                { id: 2, value: response.Amul, label: 'Amul' },
                                {id: 3,value:response.Gupta,label:'Gupta'},
                               
                            ],
                            },
                        ]}
                        width={400}
                        height={400}
                        />
                  </div>
                   
                    
                </div>
            ):( 
                <div>
                    
                </div>
                
            )}
        </div>
        <div>
            {response && response.error ? (
                <h2>Wrong credentials</h2>
            ):(
                <div></div>
            )}
        </div>
        <div className="error">
            {err ? (
                <div>Unable To fetch</div>
            ):(
                <div></div>
            )}
        </div>
     
    </div>
  )
}

export default Details
