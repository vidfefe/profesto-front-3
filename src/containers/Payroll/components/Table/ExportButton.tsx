import React, { ReactElement } from 'react';

import { useExport } from 'containers/Payroll/hooks/useExport';
import { GridToolbarExportContainer } from '@mui/x-data-grid-premium';
import { PaymentDocumentType } from 'types';

type ExportButtonProps = {
  documentId: string | number;
  documentType: PaymentDocumentType;
};

export const ExportButton = ({ documentId, documentType }: ExportButtonProps): ReactElement => {
  const { exportDocument } = useExport({ id: documentId, documentType });

  return (
    <GridToolbarExportContainer onClick={() => exportDocument()}>
      <></>
    </GridToolbarExportContainer>
  );
};
