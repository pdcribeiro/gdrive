import React from 'react';
import styled from 'styled-components';

import { useGDrive } from './hooks/use-gdrive';
import { FileExplorer } from './components/FileExplorer';

function App() {
  const gdrive = useGDrive();

  if (gdrive.isSignedIn === null) return null;

  return (
    <>
      <StyledHeading>Google Drive</StyledHeading>
      {gdrive.isSignedIn ? (
        <StyledButton onClick={gdrive.signOut}>Sign Out</StyledButton>
      ) : (
        <StyledButton onClick={gdrive.signIn}>Sign In</StyledButton>
      )}
      {gdrive.isSignedIn && <FileExplorer default gdrive={gdrive} />}
    </>
  );
}

const StyledHeading = styled.h1`
  display: inline-block;
  margin: 10px;
`;

const StyledButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
`;

export default App;
