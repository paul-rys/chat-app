import Head from 'next/head'
import Image from 'next/image'
import styles from '../../styles/Home.module.css'

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import firebase from '../../firebase/index';
import { Autocomplete, TextField, CircularProgress} from '@mui/material';
import moment from 'moment';
import { eq, throttle } from 'lodash';
import { DataGrid } from '@mui/x-data-grid';


// 3:11:50 in training video
// test
export default function Dashboard() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [currUID, setCurrUID] = useState();
  const [cols, setCols] = useState([
    {
      headerName : "Title",
      field: "gcTitle",
      width: 400
    }, 
    {
      headerName : "message Id",
      field: "msgId",
      width: 200
    }, 
  ]);
  
  const handleClicks = (data) => {
    router.push({ 
      pathname: `view-chat/${data.id}`,
      query: {
        ...data,
      }
    })

    return null;
  }
  useEffect(() => {
      firebase().auth.onAuthStateChanged((user) => {
        if (user) {
          setCurrUID(user.uid);
        }});
    }, [])
  
  const getData = async () => {
    const {db, ref, get, child} = firebase();

    const dbRef = ref(db);
    
    const getVal = await get(child(dbRef, "gc"));

    const extractVal = getVal.val();
    
    const formattedData = Object.entries(extractVal).map(a => ({
      id: a[0],
      ...a[1],
    }))
    
    setRows(formattedData);
  }
  
  useEffect(() => {
    if (currUID) getData();
  }, [currUID])

  return (
    <div className={styles.container}>
      <Head>
        <title>Hello World</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>

        <h1 className={styles.description}>
          Available group chats for you
        </h1>

        <div style={{ height: 340, width: '100%', marginTop: 20}}>
            <DataGrid 
              rows={rows} 
              columns={cols} 
              pageSize={20} 
              rowsPerPageOptions={[20]}
              hideFooter
              onCellClick={(event, details)=> { 
                console.log({event, details})
                handleClicks(event.row)
              }}
            />
        </div>

      </main>
    </div>
  )
}
