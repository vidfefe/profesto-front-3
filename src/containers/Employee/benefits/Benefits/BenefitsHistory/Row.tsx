import React, { useState } from 'react';
import { TableCell, TableRow } from '@mui/material';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ReactComponent as EditIcon } from 'assets/svg/pen-circle.svg';
import { ReactComponent as TrashCanIcon } from 'assets/svg/trash-can-circle.svg';

import { dateFormat } from 'lib/DateFormat';
import { EmployeeBenefit, Person } from 'types';
import PermissionGate from 'permissions/PermissionGate';
import { DeleteModal } from '../../DeleteModal';
import { Edit } from '../modals';

interface RowProps {
  disabled: boolean;
  item: EmployeeBenefit;
  person: Person;
  refreshData: () => void;
}

export const Row = ({ disabled, item, person, refreshData }: RowProps) => {
  const { t } = useTranslation();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  return (
    <TableRow
      hover={disabled ? false : true}
      key={item.id}
      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
    >
      <TableCell className={item.status}>
        {<span className="dot"></span>} {dateFormat(item.start_on)}
      </TableCell>
      <TableCell className={item.status}>{item.benefit.name}</TableCell>
      <TableCell className={item.status}>{item.benefit.benefit_type.name}</TableCell>
      <TableCell className={item.status}>{item.benefit.coverage_type.name}</TableCell>
      <TableCell className={item.status}>
        {`
          ${item.benefit.currency.symbol}
          ${Number(item.benefit.total_cost).toFixed(2)}`}
      </TableCell>
      <TableCell className={item.status}>
        {`
          ${item.benefit.currency.symbol}
          ${Number(item.benefit.employee_pays).toFixed(2)} / ${
          item.benefit.currency.symbol
        } ${Number(item.benefit.company_pays).toFixed(2)}`}
      </TableCell>
      <TableCell className={item.status}>
        {item.end_date ? dateFormat(item.end_date) : '-'}
      </TableCell>
      <TableCell className={item.status}>
        <div className="action-block">
          <PermissionGate action="edit" on="dependent">
            {disabled ? null : (
              <>
                <StyledEditIcon onClick={() => setEditModalOpen(true)} />
                <StyledTrashIcon onClick={() => setDeleteModalOpen(true)} />
              </>
            )}
          </PermissionGate>
        </div>
      </TableCell>
      {deleteModalOpen && (
        <td>
          <DeleteModal
            onModalClose={() => setDeleteModalOpen(false)}
            recordId={item.id}
            title={t('benefits.modal.delete_employee_benefit')}
            endpoint={'/employee_benefit'}
            refreshData={refreshData}
            resource={t('benefits.benefit.employee_benefit')}
          />
        </td>
      )}
      {editModalOpen && (
        <td>
          <Edit
            item={item}
            person={person}
            onCloseModal={() => setEditModalOpen(false)}
            refreshData={refreshData}
          />
        </td>
      )}
    </TableRow>
  );
};

const StyledEditIcon = styled(EditIcon)`
  cursor: pointer;
  margin-right: 5px;
`;

const StyledTrashIcon = styled(TrashCanIcon)`
  cursor: pointer;
  margin-right: 0;
`;
