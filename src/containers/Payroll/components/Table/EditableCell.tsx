import React, { CSSProperties, useMemo } from 'react';
import { GridRenderCellParams, useGridApiContext } from '@mui/x-data-grid-premium';

import { currencyFormatter } from 'utils/number';
import styled from 'styled-components';
import { footerRowId } from './consts';

export const EditableCell = ({
  params,
  changeable = true,
  currency,
}: { params: GridRenderCellParams } & { changeable?: boolean; currency?: string }) => {
  const apiRef = useGridApiContext();
  const { id, field, value } = params;
  const isFooterCell = id === footerRowId;

  const style = useMemo(() => {
    const result: CSSProperties = {};
    if (isFooterCell || !changeable) result.background = 'unset';
    if (value < 0) result.color = 'var(--red)';
    return result;
  }, [changeable, isFooterCell, value]);

  return (
    <Container
      onClick={isFooterCell ? undefined : () => apiRef.current.startCellEditMode({ id, field })}
      style={style}
    >
      {value ? currencyFormatter({ currency, amount: value }) : '-'}
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  text-align: end;
  padding-right: 10px;
  background: var(--light-purple);
  height: 40px;
  line-height: 40px;
`;
