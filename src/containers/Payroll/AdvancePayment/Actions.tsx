import React, { useState } from 'react';
import { Tooltip } from '@mui/material';
import { GridActionsCellItem, GridRowParams } from '@mui/x-data-grid-premium';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ReactComponent as TrashCanIcon } from 'assets/svg/trash-can-circle.svg';

import { DeleteEmployee } from './modals/DeleteEmployee';

type ActionsProps = {
  row: GridRowParams['row'];
};

export const Actions = ({ row }: ActionsProps) => {
  const { t } = useTranslation();

  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <GridActionsCellItem
        className={'actionButton'}
        icon={
          <Tooltip title={t('globaly.lowercase_delete')} disableInteractive arrow>
            <StyledActionIcon as={TrashCanIcon} />
          </Tooltip>
        }
        label={t('globaly.lowercase_delete')}
        onClick={() => setOpenModal(true)}
        sx={{ padding: '3.5px', '&:hover': { backgroundColor: 'transparent' } }}
      />
      {openModal && <DeleteEmployee id={row.id} onClose={() => setOpenModal(false)} />}
    </>
  );
};

const StyledActionIcon = styled.svg`
  width: 22px;
  height: 22px;
  circle {
    fill: var(--white);
  }
  path:not(#Vector, #Vector-2) {
    fill: var(--black);
  }

  &:hover {
    circle {
      fill: #396;
    }
    path:not(#Vector, #Vector-2) {
      fill: var(--white);
    }
    #Vector,
    #Vector-2 {
      stroke: var(--white);
    }
  }
`;
