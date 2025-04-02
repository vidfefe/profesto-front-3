import React, { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '@mui/material';
import styled from 'styled-components';

import { ReactComponent as EditIcon } from 'assets/svg/pen-circle.svg';
import { ReactComponent as TrashCanIcon } from 'assets/svg/trash-can-circle.svg';

import { DeleteModal } from '../DeleteModal';
import { Edit } from './modals';
import { EmployeeBenefit, Person } from 'types';
import { dateFormat } from 'lib/DateFormat';
import PermissionGate from 'permissions/PermissionGate';

interface BenefitProps {
  disabled: boolean;
  item: EmployeeBenefit;
  person: Person;
  refreshData: () => void;
}

type ListItemProps = {
  title: string;
  value?: ReactNode;
};

const ListItem = ({ title, value }: ListItemProps) => (
  <ListWrapper>
    <div className="title">{title}</div>
    <div className="value">{value ? value : '-'}</div>
  </ListWrapper>
);

export const Benefit = ({ disabled, item, person, refreshData }: BenefitProps) => {
  const { t } = useTranslation();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  return (
    <>
      <Container>
        <Header>
          <div
            className={'effective-as'}
          >{`${item.benefit.name} (${item.benefit.benefit_type.name})`}</div>
          <PermissionGate action="edit" on="dependent">
            {disabled ? null : (
              <div className="actions">
                <IconContainer onClick={() => setEditModalOpen(true)}>
                  <StyledIcon as={EditIcon} />
                  <span>{t('globaly.edit')}</span>
                </IconContainer>
                <IconContainer onClick={() => setDeleteModalOpen(true)}>
                  <StyledIcon as={TrashCanIcon} />
                  <span>{t('globaly.lowercase_delete')}</span>
                </IconContainer>
              </div>
            )}
          </PermissionGate>
        </Header>
        <ListItem
          title={t('settings.benefit.coverage_type')}
          value={item.benefit.coverage_type.name}
        />
        <ListItem
          title={t('settings.benefit.total_cost')}
          value={`
            ${item.benefit.currency.symbol}
            ${Number(item.benefit.total_cost).toFixed(2)}`}
        />
        <ListItem
          title={t('benefits.benefit.employee_company')}
          value={`
            ${item.benefit.currency.symbol}
            ${Number(item.benefit.employee_pays).toFixed(2)} / ${
            item.benefit.currency.symbol
          } ${Number(item.benefit.company_pays).toFixed(2)}
        `}
        />
        <ListItem
          title={t('benefits.benefit.benefit_period')}
          value={`${dateFormat(item.start_on)} - ${
            item.end_date ? dateFormat(item.end_date) : '...'
          }`}
        />
        <ListItem
          title={t('benefits.benefit.participants')}
          value={item.participants.map((participant) => (
            <div key={participant.id}>
              {`${participant.first_name} ${participant.last_name} - ${participant.relationship.name}`}
              <br />
            </div>
          ))}
        />
      </Container>
      {deleteModalOpen && (
        <DeleteModal
          onModalClose={() => setDeleteModalOpen(false)}
          recordId={item.id}
          title={t('benefits.modal.delete_employee_benefit')}
          endpoint={'/employee_benefit'}
          refreshData={refreshData}
          resource={t('benefits.benefit.employee_benefit')}
        />
      )}
      {editModalOpen && (
        <Edit
          item={item}
          person={person}
          onCloseModal={() => setEditModalOpen(false)}
          refreshData={refreshData}
        />
      )}
    </>
  );
};

const Container = styled.div`
  &:hover {
    .actions {
      visibility: visible;
    }
  }
`;

const IconContainer = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  height: fit-content;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-benefits: center;

  .effective-as {
    font-weight: 500;
    margin-bottom: 15px;
    margin-top: 5px;
    font-size: 12px;
    font-family: 'Aspira Wide Demi', 'FiraGO Medium';
  }

  .actions {
    visibility: hidden;
    display: flex;
  }
`;

const StyledIcon = styled.svg`
  margin: 0 5px;

  & circle {
    fill: #b5b5b5;
  }
  & path {
    fill: #fff;
  }
`;

const ListWrapper = styled.div`
  margin: 5px 0;
  display: flex;

  .title {
    color: #80888d;
    text-align: right;
    margin-right: 12px;
    width: 150px;
  }

  .value {
    color: #414141;
    flex: 1;
    display: block;
    line-height: 1.4;
  }
`;
