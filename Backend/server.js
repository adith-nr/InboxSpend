import express from "express"
import cors from "cors"
import {spawn} from "child_process"
import {fileURLToPath} from 'url'
import fs from 'fs'
import path from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
app.use(cors());
app.use(express.json())

app.post('/find',(req,res)=>{
    const dt = req.body.date
    const email=req.body.email
    const password=req.body.password
    const opr_bank = req.body.opr_bank
    const ID_customer = req.body.CustomerID

    const script = {
        "KTK" : "read.py",
        "CNR" : "canara.py"
    }

    console.log(dt)
    // console.log(email, password, ID_customer)

    const credentials = {
        Email: email,
        Password: password,
        CustomerID: ID_customer
    };

    console.log(credentials)

    const filePath=path.join(__dirname,'date1.txt')
    fs.writeFile(filePath,dt,(err)=>{
        if(err){
            console.log("Error in creating file")
            // return res.status(500).json({ error: "File write failed" });
        }
        else{
            console.log("File Created Successfully!")
            // return res.status(200).json({ message: "File written successfully" }); 
        }
    })

    
    
    const filePath2 = path.join(__dirname, 'Cred.json'); // Change to .json file
    
    fs.writeFile(filePath2, JSON.stringify(credentials, null, 4), (err) => {
        if (err) {
            console.log("Error in creating file");
        } else {
            console.log("File Created Successfully!");
        }
    });
    
    const pythonRun = spawn( "python", [script[opr_bank]]);

    let result;

    

    pythonRun.stdout.on("data",(data)=>{
        result=Buffer(data).toString()
        if(result=="Wrong Credentials "){
            return res.status(404).json({ error: "File write failed" });
        }
    })
    
    pythonRun.on("close",(code)=>{
        if(code==0){
            const jsonData=JSON.parse(result)
            console.log(result)

            return res.json(jsonData);
        }
        else{
            return res.status(404).json({error:"Python script not executed"})
        }
    })
    
})
app.get('/',(req,res)=>{
    res.send("Backend is working!")
})


app.listen(4000,()=>{
    console.log(`Server running on port 4000`);
})