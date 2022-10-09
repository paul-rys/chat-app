import Head from 'next/head'
import Image from 'next/image'
import styles from '../../styles/Home.module.css'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import firebase from '../../firebase/index';
import { TextField } from '@mui/material';



// 3:11:50 in training video
// test
export default function Dashboard() {
  const router = useRouter();
  const [email, setEmail]= useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const handleEmailChange = (e) => {
    setEmail(e.target.value)
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
  }

  const createUser = async () => {
    const firebaseAuth = firebase().auth;
    await firebase()
          .createUserWithEmailAndPassword(firebaseAuth, email, password)
          .catch((e) => {
            console.log({e}) 
            setError(e.code)
          });

    router.push("/");
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Hello World</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>

        <h1 className={styles.title}>
          Welcome to User Screen
        </h1>

        <TextField 
          id = 't1'
          label = 'email address'
          variant = 'outlined'
          value={email}
          onChange = {handleEmailChange}
        /> 
        

        <TextField 
          id = 't2'
          label = 'password'
          value={password}
          variant = 'outlined'
          onChange = {handlePasswordChange}
        /> 

        <p> {error ? error : ""} </p>




        <button style={{padding: 20}} onClick = {createUser}>
            <h1>Create User</h1>
        </button>

      </main>

    </div>
  )
}
