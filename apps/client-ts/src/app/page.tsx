"use client"

import React from 'react'
import { useRouter } from "next/navigation";


const Index = () => {


    const Router = useRouter();
    Router.replace('/connections')
    
  return (
    <>
    </>
  )
}

export default Index