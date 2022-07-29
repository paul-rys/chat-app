
import Head from 'next/head'
import Image from 'next/image'
import styles from '../../styles/Home.module.css'

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import firebase from '../../firebase/index';
import { Autocomplete, TextField, CircularProgress} from '@mui/material';
import moment from 'moment';
import { throttle } from 'lodash';


// 3:11:50 in training video
// test
export default function Dashboard() {
  const router = useRouter();
  const [email, setEmail]= useState("");
  const [password, setPassword] = useState("");
  const [options, setOptions] = useState([]);
  const [searchValue, setSearchValue] = useState();
  const [loading, setLoading] = useState(false);
  const [gcTitle, setGcTitle] = useState("");
  const [gcMessage, setGcMessage] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [currUID, setCurrUID] = useState(null);

  useEffect(() => {
      firebase().auth.onAuthStateChanged((user) => {
        if (user) {
          setCurrUID(user.uid);
        }});
    }, [])

  const fetchData = async () => {
    const { db, ref, get, child } = firebase();
    const dbRef = ref(db);

    const getVal = await get(child(dbRef, 'users')).catch(e => console.log({e}));


    const extractData = getVal.val();

    // return formatted extractData
    return Object.entries(extractData).map(a => ({
        id : a[0],
        ...a[1],
    }));
  }

  const querySearch = async (req, callback) => {
      const {db, ref, get, limitToLast, query, orderByChild, startAt, endAt} = firebase();

      const myRes = [];

      const sKey = req.input.toLowerCase();

      const getData = await get(
        query(ref(db, 'users')),
        ...[
          orderByChild('fullName'),
          startAt(sKey),
          endAt(sKey + "\uf8ff"),
          limitToLast(10)
        ]
      )

      getData.forEach((a) => {
        myRes.push(a.val());
      })

      callback(myRes);
  }

  const fetch = useMemo(() => throttle((req, callback) => {
      setLoading(true);
      querySearch(req, callback)
  }, 500), []
  )

  useEffect(() => {
    let active = true;

    if (inputValue === "") {
      setLoading(true);
      fetchData().then((a) => {
        setOptions(a ? a : []);
        setLoading(false);
        return undefined;
      }).catch(e => {
        setLoading(true);
        console.error(e);
        alert("error fetching data")
      })
    }

    fetch({ input: inputValue }, (result) => {
      if (active) {
        let newOptions = [];
        if (result) {
          newOptions = [...result];
        }
        setOptions(newOptions);
      }
      setLoading(false);
    });

    (() => {
      active = false;
    })();

  }, [searchValue, inputValue, fetch])
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Hello World</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>

        <h1 className={styles.title}>
          Welcome to Create Group Chat Screen
        </h1>

        <TextField
          id = "t1"
          label = "GC Title"
          variant = "outlined"
          onChange = {(e) => {
            setGcTitle(e.target.value);
          }}
        />

        <TextField
          id = "t11"
          label = "message"
          variant = "outlined"
          onChange = {(e) => {
            setGcMessage(e.target.value);
          }}
        />

        <Autocomplete
          id = "multi-auto"
          loading = {loading}
          filterSelectedOptions
          includeInputInList
          filterOptions={(x) => x}
          multiple
          limitTags= {3}
          options = {options}
          getOptionLabel = {option => option.fullName}
          value = {searchValue}
          defaultValue = {searchValue}
          onChange = {(e, newValue) => {
            setOptions(newValue ? [newValue, ...options] : options);
            setSearchValue(newValue);
          }}
          onInputChange = {(e, newInputValue) => {
            setInputValue(newInputValue);
          }}
          renderInput = {(params) => ( 
            <TextField
              {...params}
              required
              id = "id-ibe"
              label = "Members"
              variant = "outlined"
              sx = {{
                width: 500 
              }}
              InputProps = {{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {
                      loading ? (
                        <CircularProgress color = 'inherit' size = {20}/>
                      ) : null
                    }
                    { params.InputProps.endAdornment }
                  </>
                )
              }}
            />
          )}
        />



        <button style={{padding: 20}} onClick = {async () => {
          const {db, ref, set, update} = firebase();

          const result = searchValue.reduce((unique, o) => {
              if (!unique.some(obj => obj.id === o.id)) unique.push(o);
              return unique;
          }, [])

          const members = {};
          
          result.forEach((a) => {
            members[a.id] = true
          })

          console.log({ members });

          
          const id = `${moment().valueOf()}`
          
          const constructValue = {
            gcTitle: gcTitle,
            id: id,
            members: { ...members }
          }

          console.log({ constructValue });

          await set(ref(db, 'gc/' + id), constructValue).catch(e => console.error(e));

          const messageId = `msg-${id}`

          await set(ref(db, `messages/${id}/${messageId}`), {
              senderId: currUID,
              message: gcMessage
          }).catch(e => console.error(e))

          await update(ref(db, 'gc/' + id), {
            msgId: messageId,
          }).catch(e => console.error(e));

          alert('sent message');
        }}>
            <h1>Create Gc</h1>
        </button>

      </main>
    </div>
  )
}
