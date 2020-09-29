import React, { useCallback, useEffect, useRef, useState } from 'react';
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
        <StyledTable>
          <colgroup>
            <col style={{ width: '40%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '20%' }} />
          </colgroup>
          <thead>
            <tr>
              <th>Name</th>
              <th>Owner</th>
              <th>Last modified</th>
              <th>File size</th>
            </tr>
          </thead>
          <tbody>
            {files.length > 0 ? (
              files.map((file, idx) => (
                <File
                  key={file.id}
                  file={file}
                  first={idx === 0}
                  selected={idx === selected}
                  onClick={() => selected !== idx && setSelected(idx)}
                  onDoubleClick={() => open(file)}
                />
              ))
            ) : (
              <tr>
                <td style={{ color: 'grey' }}>empty</td>
              </tr>
            )}
          </tbody>
        </StyledTable>
      )}
    </>
  );
}

const StyledTable = styled.table`
  width: 100%;
  min-width: 1000px;
  border-collapse: collapse;
  text-align: left;
  user-select: none;

  th,
  td {
    padding: 10px 0;
  }
  th:first-child {
    padding-left: 10px;
  }
  th,
  td:not(:first-child) {
    color: grey;
  }
  td:first-child {
    padding-left: 25px;
  }
`;

function File({ file, first, selected, ...rest }) {
  const selfRef = useRef();

  useEffect(() => {
    if (selected) {
      const rect = selfRef.current.getBoundingClientRect();
      if (first && window.scrollY > 0) {
        window.scrollTo({ left: window.scrollX, top: 0, behavior: 'smooth' });
      } else if (rect.top < 0) {
        scrollBy(rect.top);
      } else if (rect.bottom > window.innerHeight) {
        scrollBy(rect.bottom - window.innerHeight);
      }
    }

    function scrollBy(offset) {
      window.scrollBy({ left: 0, top: offset, behavior: 'smooth' });
    }
  }, [first, selected]);

  const { iconLink, thumbnailLink, name, owners, modifiedTime, size } = file;
  return (
    <StyledTableRow ref={selfRef} selected={selected} {...rest}>
      <td>
        <img src={thumbnailLink || iconLink} alt="" />
        {name}
      </td>
      <td>{owners[0].me ? 'me' : owners[0].displayName}</td>
      <td>{new Date(modifiedTime).toDateString()}</td>
      <td>{size && size + ' bytes'}</td>
    </StyledTableRow>
  );
}

const StyledTableRow = styled.tr`
  ${props => (props.selected ? 'background-color: #eee;' : '')}
  border-top: 1px solid #eee;

  img {
    width: 20px;
    height: 20px;
    margin-right: 20px;
    vertical-align: middle;
  }
`;
