import React from 'react';

import { useGDrive } from './hooks/use-gdrive';
import { FileExplorer } from './components/FileExplorer';

function App() {
  const gdrive = useGDrive();

  if (gdrive.isSignedIn === null) return null;

  if (!gdrive.isSignedIn) {
    return <button onClick={gdrive.signIn}>Sign In</button>;
  }

  return (
    <>
      <button onClick={gdrive.signOut}>Sign Out</button>
      <FileExplorer default gdrive={gdrive} />
    </>
  );
}

export default App;
