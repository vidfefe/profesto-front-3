import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import {
  GridEventListener,
  GridRenderEditCellParams,
  useGridApiContext,
} from '@mui/x-data-grid-premium';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

type EditCellProps = Pick<GridRenderEditCellParams, 'value'> & {
  allowNegative?: boolean;
  onEditStop: (value: number) => void;
  onlyNegative?: boolean;
  custom?: boolean;
};

export const EditCell = ({
  allowNegative = true,
  value,
  onEditStop,
  onlyNegative,
  custom,
}: EditCellProps): ReactElement => {
  const apiRef = useGridApiContext();
  const [editValue, setEditValue] = useState<number>(value);

  const handleEditStop: GridEventListener<'cellEditStop'> = useCallback(
    (params) => {
      const initialValue = custom ? params.value.deduction_amount : params.value;
      if (initialValue === editValue) return false;
      onEditStop(editValue);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editValue]
  );

  useEffect(() => {
    const unregister = apiRef.current.subscribeEvent('cellEditStop', handleEditStop);
    return () => unregister();
  }, [apiRef, handleEditStop]);

  return (
    <CustomNumericFormat
      autoFocus
      allowNegative={allowNegative}
      onValueChange={(values) => {
        const value = Number(values.value || 0);
        setEditValue(value * (onlyNegative && value > 0 ? -1 : 1));
      }}
      value={editValue}
      decimalSeparator="."
      decimalScale={2}
      valueIsNumericString
    />
  );
};

const CustomNumericFormat = styled(NumericFormat)`
  width: 100%;
  margin: 0 9px;
  padding-right: 10px;
  text-align: end;
  border: none;
  background: var(--light-purple);
  height: 40px;
`;
