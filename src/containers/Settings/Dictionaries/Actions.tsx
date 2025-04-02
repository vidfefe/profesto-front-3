import React from 'react';
import { Tooltip } from '@mui/material';
import { GridActionsCellItem } from '@mui/x-data-grid-premium';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ReactComponent as EditIcon } from 'assets/svg/pen-circle.svg';
import { ReactComponent as TrashCanIcon } from 'assets/svg/trash-can-circle.svg';

interface ActionsProps {
  onDelete?: () => void;
  onEdit: () => void;
}

export const Actions = ({ onDelete, onEdit }: ActionsProps) => {
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex' }}>
      <GridActionsCellItem
        className="actionButton"
        icon={
          <Tooltip title={t('globaly.edit')} disableInteractive arrow>
            <StyledIcon as={EditIcon} />
          </Tooltip>
        }
        label={t('globaly.edit')}
        onClick={onEdit}
        sx={{ padding: '3.5px', '&:hover': { backgroundColor: 'transparent' } }}
      />
      {onDelete &&
        <GridActionsCellItem
          className="actionButton"
          icon={
            <Tooltip title={t('globaly.lowercase_delete')} disableInteractive arrow>
              <StyledIcon as={TrashCanIcon} />
            </Tooltip>
          }
          label={t('globaly.lowercase_delete')}
          onClick={onDelete}
          sx={{ padding: '3.5px', '&:hover': { backgroundColor: 'transparent' } }}
        />
      }
    </div>
  );
};

const StyledIcon = styled.svg`
  width: 22px;
  height: 22px;
  &:hover {
    & * circle {
      fill: #396;
    }
    path {
      fill: #fff;
    }
  }
`;
