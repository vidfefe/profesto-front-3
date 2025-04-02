import React from 'react';
import Button from '@mui/material/Button';
import { CircularProgress, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ReactComponent as PlusIcon } from 'assets/svg/plus.svg';

import DialogModal from 'components/Modal/Dialog';
import PermissionGate from 'permissions/PermissionGate';
import EmpEditHeader from '../../../editHeader';
import { EmployeeBenefit, Person } from 'types';
import { Row } from './Row';

interface BenefitsHistoryProps {
  history?: EmployeeBenefit[];
  loading: boolean;
  addBenefit: () => void;
  disabled: boolean;
  isOpen: boolean;
  onModalClose: () => void;
  person: Person;
  refreshData: () => void;
}

export const BenefitsHistory = ({
  history,
  loading,
  addBenefit,
  disabled,
  isOpen,
  onModalClose,
  person,
  refreshData,
}: BenefitsHistoryProps) => {
  const { t } = useTranslation();

  return (
    <DialogModal
      open={isOpen}
      onClose={onModalClose}
      title={t('benefits.modal.benefits_history')}
      nominalHeader={
        <EmpEditHeader
          employeeName={`${person.first_name} ${person.last_name}`}
          avatarUuid={person.uuid}
          employeeId={person.id}
          jobData={person.active_job_detail}
          rightSide={
            <PermissionGate on="dependent" action="edit">
              {disabled ? null : (
                <Button
                  type="button"
                  size="large"
                  variant="contained"
                  onClick={addBenefit}
                  startIcon={<StyledPlusIcon />}
                >
                  {t('leftMenuCard.add_benefit')}
                </Button>
              )}
            </PermissionGate>
          }
        />
      }
      maxWidth="xl"
    >
      <Wrapper>
        <div className="section-body">
          {loading ? (
            <LoadingContainer>
              <CircularProgress size={24} />
            </LoadingContainer>
          ) : history?.length ? (
            <Table style={{ width: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell className="non-padding-left">
                    {t('settings.benefit.start_date')}
                  </TableCell>
                  <TableCell>{t('settings.menu.singularTitle.benefit')}</TableCell>
                  <TableCell>{t('benefits.benefit.benefit_type')}</TableCell>
                  <TableCell>{t('benefits.benefit.coverage_type')}</TableCell>
                  <TableCell>{t('benefits.benefit.total_cost')}</TableCell>
                  <TableCell>{t('benefits.benefit.employee_company')}</TableCell>
                  <TableCell>{t('settings.benefit.end_date')}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((item) => (
                  <Row
                    key={item.id}
                    disabled={disabled}
                    item={item}
                    person={person}
                    refreshData={refreshData}
                  />
                ))}
              </TableBody>
            </Table>
          ) : (
            <NoBenefitsEntries>{t('benefits.no_benefits_information')}</NoBenefitsEntries>
          )}
        </div>
      </Wrapper>
    </DialogModal>
  );
};

const Wrapper = styled.div`
  .section-body {
    min-width: 1100px;
  }
`;

const NoBenefitsEntries = styled.p`
  min-height: 180px;
  color: #8e8e8e;
`;

const StyledPlusIcon = styled(PlusIcon)`
  margin-right: 5px;
  path {
    fill: #fff;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
`;
