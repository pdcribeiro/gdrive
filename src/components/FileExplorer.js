import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { BreadCrumbTrail } from './BreadCrumbTrail';

export function FileExplorer({ gdrive }) {
  const [path, setPath] = useState([{ id: 'root', name: 'My Drive' }]);
  const [files, setFiles] = useState(null);
  const [selected, setSelected] = useState(null);

  const fetchFolder = useCallback(
    id => {
      setFiles(null);
      setSelected(null);
      gdrive.listFiles(id, 'name').then(setFiles);
    },
    [gdrive]
  );

  const open = useCallback(
    file => {
      if (isFolder(file)) {
        window.history.pushState({}, '', file.id);
        setPath(path => {
          const pathIdx = path.indexOf(file) + 1;
          return pathIdx ? path.slice(0, pathIdx) : path.concat(file);
        });
        fetchFolder(file.id);
      }
    },
    [fetchFolder]
  );

  function isFolder(file) {
    return (
      file.mimeType === 'application/vnd.google-apps.folder' ||
      file.id === 'root'
    );
  }

  useEffect(() => {
    window.history.replaceState({}, '', 'root');
    fetchFolder('root');
    // fetchFolder(getLocation());

    window.addEventListener('popstate', handleGoBack);

    function handleGoBack() {
      setPath(path => path.slice(0, -1));
      fetchFolder(getLocation());
    }

    return () => {
      window.removeEventListener('popstate', handleGoBack);
    };
  }, [fetchFolder]);

  function getLocation() {
    return window.location.pathname.substring(1) || 'root';
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    function handleKeyDown(event) {
      if (event.key === 'ArrowDown') {
        setSelected(s => (s !== null && s < files.length - 1 ? s + 1 : 0));
      } else if (event.key === 'ArrowUp') {
        setSelected(s => (s !== null && s > 0 ? s - 1 : files.length - 1));
      } else if (event.key === 'Enter') {
        open(files[selected]);
      } else if (event.key === 'Backspace' && path.length > 1) {
        window.history.back();
      } else {
        return;
      }
      event.preventDefault();
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [path, files, selected, open]);

  return (
    <>
      <BreadCrumbTrail path={path} open={open} />
      {files && (
        <StyledUnorderedList>
          {files.map((file, idx) => (
            <StyledListItem
              key={file.id}
              selected={idx === selected}
              onClick={() => selected !== idx && setSelected(idx)}
              onDoubleClick={() => open(file)}
            >
              {file.name}
            </StyledListItem>
          ))}
          {files.length === 0 && <li style={{color: '#aaa'}}>empty</li>}
        </StyledUnorderedList>
      )}
    </>
  );
}

const StyledUnorderedList = styled.ul`
  padding-left: 10px;
`;

const StyledListItem = styled.li`
  ${props => (props.selected ? 'background-color: #eee;' : '')}
  padding: 10px;
  border-top: 1px solid black;
  line-height: 1.5;
  user-select: none;
`;
