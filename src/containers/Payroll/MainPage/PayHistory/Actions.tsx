import React, { useMemo, useState } from 'react';
import { Tooltip } from '@mui/material';
import { GridActionsCellItem, GridRowParams } from '@mui/x-data-grid-premium';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { ReactComponent as MagnifierIcon } from 'assets/svg/actions_circle/magnifier.svg';
import { ReactComponent as CloseIcon } from 'assets/svg/actions_circle/x.svg';
import { ReactComponent as ExportIcon } from 'assets/svg/export-icon_circle.svg';

import { CancelModal } from './CancelModal';
import { getPeriod, toFormattedDate } from 'utils/date';
import { PaymentDocumentStatus, PaymentDocumentType } from 'types';
import { useExport } from 'containers/Payroll/hooks/useExport';

type ActionsProps = {
  row: GridRowParams['row'];
};

export const Actions = ({ row }: ActionsProps) => {
  const { t } = useTranslation();
  const history = useHistory();

  const documentType = row.payment_document_type.id as PaymentDocumentType;

  const { exportDocument } = useExport({ id: row.id, documentType });

  const [openModal, setOpenModal] = useState(false);

  const config = useMemo(() => {
    switch (documentType) {
      case PaymentDocumentType.REGULAR_PAYROLL:
        return {
          view: () => history.push(`/payroll/${row.id}`, { step: 3 }),
          period: getPeriod(row.period_start, row.period_end),
        };
      case PaymentDocumentType.ADVANCE_PAYMENT:
        return {
          view: () => history.push(`/advance_payment_document/${row.id}`),
          period: toFormattedDate(row.payment_date, 'd MMM, yyyy'),
        };
      default:
        return {
          view: undefined,
          period: '',
        };
    }
  }, [documentType, history, row]);

  return (
    <>
      <div style={{ display: 'flex' }}>
        <GridActionsCellItem
          className={'actionButton'}
          icon={
            <Tooltip title={t('timeOff.view')} disableInteractive arrow>
              <StyledActionIcon as={MagnifierIcon} />
            </Tooltip>
          }
          label={t('timeOff.view')}
          onClick={config.view}
          sx={{
            padding: '2px',
            '&:hover': { backgroundColor: 'transparent' },
          }}
        />
        <GridActionsCellItem
          className={'actionButton'}
          icon={
            <Tooltip title={t('components.dataGrid.export')} disableInteractive arrow>
              <StyledActionIcon as={ExportIcon} />
            </Tooltip>
          }
          label={t('components.dataGrid.export')}
          onClick={() => exportDocument()}
          sx={{
            padding: '2px',
            '&:hover': { backgroundColor: 'transparent' },
          }}
        />
        {row.payment_document_status.id !== PaymentDocumentStatus.CANCELLED && (
          <GridActionsCellItem
            className={'actionButton'}
            icon={
              <Tooltip title={t('globaly.lowercase_cancel')} disableInteractive arrow>
                <StyledActionIcon as={CloseIcon} />
              </Tooltip>
            }
            label={t('globaly.lowercase_cancel')}
            onClick={() => setOpenModal(true)}
            sx={{ padding: '2px', '&:hover': { backgroundColor: 'transparent' } }}
          />
        )}
      </div>
      {openModal && (
        <CancelModal
          id={row.id}
          documentType={documentType}
          onClose={() => setOpenModal(false)}
          period={config.period}
        />
      )}
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
