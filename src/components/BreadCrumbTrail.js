import React from 'react';
import styled from 'styled-components';

export function BreadCrumbTrail({ path, open }) {
  function handleDoubleClick(folder) {
    if (folder !== path[path.length - 1]) {
      open(folder);
    }
  }

  return (
    <StyledUnorderedList>
      {path.map((folder, idx) => (
        <StyledListItem
          key={folder.id}
          onDoubleClick={() => handleDoubleClick(folder)}
        >
          {idx > 0 && <span> &gt; </span>}
          {folder.name}
        </StyledListItem>
      ))}
    </StyledUnorderedList>
  );
}

const StyledUnorderedList = styled.ul`
  margin: 20px 10px;
`;

const StyledListItem = styled.li`
  display: inline;
  font-size: 20px;
  user-select: none;
`;
