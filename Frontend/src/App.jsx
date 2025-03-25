import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Details from './comp/Details'
import {createBrowserRouter,RouterProvider} from "react-router-dom"
import Home from './comp/Home'
import Signup from './comp/SignUp'
import Login from './comp/Login'

const router=createBrowserRouter([
  {path:"/",element:<Home/>},
  {path:"/signup",element:<Signup/>},
  {path:"/login",element:<Login/>},
  {path:"/profile",element:<Details/>}
])

function App() {
  return(
    <div className='cont'>
      <RouterProvider router={router}/>
    </div>
  )
}

export default App
