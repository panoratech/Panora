"use client"

import React,{useEffect} from 'react'
import { useRouter } from "next/navigation";


const Home = () => {


    const Router = useRouter();

    useEffect(() => {

    Router.replace('/connections')


    },[])
    
  return (
    <>
    </>
  )
}

export default Home