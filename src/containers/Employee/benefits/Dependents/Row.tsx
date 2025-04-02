import React, { useState } from 'react';
import { TableCell, TableRow, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ReactComponent as EditIcon } from 'assets/svg/pen-circle.svg';
import { ReactComponent as TrashCanIcon } from 'assets/svg/trash-can-circle.svg';

import { dateFormat } from 'lib/DateFormat';
import { usePermissionGate } from 'permissions/usePermissionGate';
import { DeleteModal } from '../DeleteModal';
import { EmployeeDependent, Person } from 'types';
import { Edit } from './modals';

interface RowProps {
  item: EmployeeDependent;
  person: Person;
  refreshData: () => void;
}

export const Row = ({ item, person, refreshData }: RowProps) => {
  const { t } = useTranslation();

  const { permissionObj, role } = usePermissionGate('dependent');

  const [isNumberVisible, setIsNumberVisible] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const inProgress = person?.onboarding?.onboarding_status?.id === 'in_progress';

  return (
    <TableRow hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell>{`${item.first_name} ${item.last_name}`}</TableCell>
      <TableCell>{item.relationship.name}</TableCell>
      <TableCell>
        <Tooltip
          title={
            isNumberVisible
              ? t('benefits.dependent.click_to_hide')
              : t('benefits.dependent.click_to_view')
          }
        >
          <PersonalNumber onClick={() => setIsNumberVisible((prev) => !prev)}>
            {isNumberVisible ? item.personal_number : 'XXXXXXXXXXX'}
          </PersonalNumber>
        </Tooltip>
      </TableCell>
      <TableCell>{dateFormat(item.birth_date)}</TableCell>
      <TableCell>{item.age}</TableCell>
      <TableCell>{item.gender?.name}</TableCell>
      {!inProgress && (permissionObj?.edit || !['employee', 'manager'].includes(role)) && (
        <TableCell>
          <div className={'action-block'}>
            <StyledEditIcon onClick={() => setEditModalOpen(true)} />
            <StyledTrashIcon onClick={() => setDeleteModalOpen(true)} />
          </div>
        </TableCell>
      )}
      {deleteModalOpen && (
        <td>
          <DeleteModal
            onModalClose={() => setDeleteModalOpen(false)}
            name={`${t('benefits.dependent.employee_dependent')} "${item.first_name} ${item.last_name}"`}
            recordId={item.id}
            title={t('benefits.modal.delete_employee_dependent')}
            endpoint={'/employee_dependent'}
            refreshData={refreshData}
            resource={t('benefits.dependent.employee_dependent')}
            withChecking
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

const PersonalNumber = styled.span`
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: var(--orange);
  }
`;

const StyledEditIcon = styled(EditIcon)`
  cursor: pointer;
  margin-right: 5px;
`;

const StyledTrashIcon = styled(TrashCanIcon)`
  cursor: pointer;
  margin-right: 0;
`;
