import { useEffect, useState } from 'react';

import { API_KEY, CLIENT_ID } from '../gapi-auth.local';

const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
];
const SCOPES = 'https://www.googleapis.com/auth/drive';

const gapi = window.gapi;

export function useGDrive() {
  const [isSignedIn, setIsSignedIn] = useState(null);

  useEffect(() => {
    gapi.load('client:auth2', initClient);
  }, []);

  function initClient() {
    gapi.client
      .init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      })
      .then(
        () => {
          const authInstance = gapi.auth2.getAuthInstance();
          authInstance.isSignedIn.listen(setIsSignedIn);
          setIsSignedIn(authInstance.isSignedIn.get());
        }).catch(error => console.error('gapi init', error));
  }

  // function updateSigninStatus(isSignedIn) {
  //   if (isSignedIn) {
  //     authorizeButton.style.display = 'none';
  //     signoutButton.style.display = 'block';
  //     listFiles();
  //   } else {
  //     authorizeButton.style.display = 'block';
  //     signoutButton.style.display = 'none';
  //   }
  // }

  function signIn() {
    gapi.auth2
      .getAuthInstance()
      .signIn()
      .catch(error => console.error('gapi signin', error));
  }

  function signOut() {
    gapi.auth2
      .getAuthInstance()
      .signOut()
      .catch(error => console.error('gapi signout', error));
  }

  function listFiles(id, orderBy) {
    return gapi.client.drive.files
      .list({
        q: `"${id}" in parents and trashed = false`,
        fields:
          'nextPageToken, files(id, mimeType, iconLink, thumbnailLink, name, owners(displayName, me), modifiedTime, size)',
        orderBy: 'folder, ' + orderBy,
        pageSize: 20,
      })
      .then(response => response.result.files || [])
      .catch(error => console.error('error listing files', error));
  }

  return { isSignedIn, signIn, signOut, listFiles };
}
