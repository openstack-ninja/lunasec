/*
 * Copyright 2021 by LunaSec (owned by Refinery Labs, Inc)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import { LunaSecConfigContext } from '@lunasec/react-sdk';
import { CssBaseline, makeStyles } from '@material-ui/core';
import { createStyles, Theme } from '@material-ui/core/styles';
import { StoreProvider } from 'easy-peasy';
import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom'; // Pages

import { Header } from './components/Header';
import { Home } from './components/Home';
import { Login } from './components/Login';
import { SideMenu } from './components/SideMenu';
import { Signup } from './components/Signup';
import { SecureDownloadDemo } from './components/secure-components/SecureDownloadDemo';
import { SecureInputDemo } from './components/secure-components/SecureInputDemo';
import { SecureParagraphDemo } from './components/secure-components/SecureParagraphDemo';
import { SecureTextAreaDemo } from './components/secure-components/SecureTextAreaDemo';
import { SecureUploadDemo } from './components/secure-components/SecureUploadDemo';
import { getStore } from './store';
import {} from '@lunasec/browser-common';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    main: {
      flexGrow: 1,
      padding: theme.spacing(3),
    },
    toolbar: theme.mixins.toolbar,
  })
);

interface DedicatedPassportReactAppProps {
  sessionAuthProvider: string;
}

export const DedicatedPassportReactApp = (props: DedicatedPassportReactAppProps) => {
  const classes = useStyles({});
  const { sessionAuthProvider } = props;

  return (
    <LunaSecConfigContext.Provider
      value={{
        lunaSecDomain: process.env.REACT_APP_SECURE_FRAME_URL ? process.env.REACT_APP_SECURE_FRAME_URL : '',
        sessionAuthProvider: sessionAuthProvider,
        authenticationErrorHandler: (e: Error) => {
          // setAuthError('Failed to authenticate with LunaSec. \n Is a user logged in?');
          console.error('AUTH ERROR FROM LUNASEC', e);
        },
      }}
    >
      <StoreProvider store={getStore()}>
        <BrowserRouter>
          <div className={classes.root}>
            <CssBaseline />
            <Header />
            <SideMenu />
            <main className={classes.main}>
              <div className={classes.toolbar} />
              <Switch>
                <Route exact path="/" component={Home} />
                <Route exact path="/login" component={Login} />
                <Route exact path="/signup" component={Signup} />
                <Route exact path="/secureinput" component={SecureInputDemo} />
                <Route exact path="/secureupload" component={SecureUploadDemo} />
                <Route exact path="/secureparagraph" component={SecureParagraphDemo} />
                <Route exact path="/securedownload" component={SecureDownloadDemo} />
                <Route exact path="/securetextarea" component={SecureTextAreaDemo} />
              </Switch>
            </main>
          </div>
        </BrowserRouter>
      </StoreProvider>
    </LunaSecConfigContext.Provider>
  );
};