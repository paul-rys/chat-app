import Head from 'next/head';
import Image from 'next/image';
import styles from '../../styles/Home.module.css';

import React, {useEffect, useState, useMemo} from 'react';
import {useRouter} from 'next/router';
import firebase from '../../firebase/index';
import {Autocomplete, TextField, CircularProgress, Button} from '@mui/material';
import moment from 'moment';
import {throttle} from 'lodash';
import {componentStyles} from '../../styles/jsStyles';

import getUsers from '../api/getUsers';
import querySearch from '../api/querySearch';
import sendGcMessage from '../api/sendGcMessage';
// 3:11:50 in training video
// test
const CreateGc = () => {
  const [options, setOptions] = useState([]);
  const [searchValue, setSearchValue] = useState();
  const [loading, setLoading] = useState(false);
  const [gcTitle, setGcTitle] = useState('');
  const [gcCreator, setGcCreator] = useState('');
  const [gcMessage, setGcMessage] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [currUID, setCurrUID] = useState(null);

  const fetch = useMemo(
    () =>
      throttle((req, callback) => {
        setLoading(true);
        querySearch(req, callback);
      }, 500),
    [],
  );

  useEffect(() => {
    // first object inside the members array is the creator and will always be.
    firebase().auth.onAuthStateChanged(user => {
      if (user) {
        setCurrUID(user.uid);
      }
      setGcCreator(getUsers().then(users => users[0].creator));
    });

    let active = true;

    if (inputValue === '') {
      setLoading(true);
      getUsers()
        .then(a => {
          setOptions(a ? a : []);
          setLoading(false);
          return undefined;
        })
        .catch(e => {
          setLoading(true);
          console.error(e);
          alert('error fetching data');
        });
    }

    fetch({input: inputValue}, result => {
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
  }, [searchValue, inputValue, fetch]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Hello World</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.description}>Create Group Chat</h1>

        <TextField
          id="t1"
          label="GC Title"
          variant="outlined"
          onChange={e => {
            setGcTitle(e.target.value);
          }}
        />

        <TextField
          id="t11"
          label="message"
          variant="outlined"
          onChange={e => {
            setGcMessage(e.target.value);
          }}
        />

        <Autocomplete
          id="multi-auto"
          loading={loading}
          filterSelectedOptions
          includeInputInList
          filterOptions={x => x}
          multiple
          limitTags={3}
          options={options}
          getOptionLabel={option => option.fullName}
          value={searchValue}
          defaultValue={searchValue}
          onChange={(e, newValue) => {
            setOptions(newValue ? [newValue, ...options] : options);
            setSearchValue(newValue);
          }}
          onInputChange={(e, newInputValue) => {
            setInputValue(newInputValue);
          }}
          renderInput={params => (
            <TextField
              {...params}
              required
              id="id-ibe"
              label="Members"
              variant="outlined"
              sx={{
                width: 200,
              }}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />

        <Button
          style={componentStyles.primaryButton}
          onClick={() => sendGcMessage(gcTitle, gcCreator, searchValue)}>
          <h1>Ok</h1>
        </Button>
      </main>
    </div>
  );
};

export default CreateGc;
