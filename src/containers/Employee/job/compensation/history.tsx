import styled from "styled-components";
import { useForm } from 'react-hook-form';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button'
import DialogModal from "components/Modal/Dialog";
import EmpEditHeader from "../../editHeader";
import PermissionGate from "permissions/PermissionGate";
import { useTranslation } from "react-i18next";
import { ReactComponent as EditIcon } from 'assets/svg/pen-circle.svg';
import { ReactComponent as TrashCanIcon } from 'assets/svg/trash-can-circle.svg';
import { ReactComponent as MessageIcon } from 'assets/svg/message.svg';
import { ReactComponent as MagnifierIcon } from 'assets/svg/magnifier_circle.svg';
import { ReactComponent as PlusIcon } from 'assets/svg/plus.svg';
import { dateFormat } from "lib/DateFormat";
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { isEmpty, sortBy } from "lodash";
import { PaymentType } from "types";
const Wrapper = styled.div`    
    .section-body{
      min-width: 1100px;
    }
`;

const CompensationHistory = (props: any) => {
  const { t } = useTranslation();
  const { handleSubmit } = useForm();
  const { user, jobData, compensationList, disabled } = props;

  const onSubmit = (data: any) => {
    props.onSubmit(data);
  };

  return (
    <DialogModal
      open={props.isOpen}
      onClose={() => props.onModalClose()}
      title={t('employee.job.compensation_history')}
      nominalHeader={
        <EmpEditHeader
          employeeName={`${user.first_name} ${user.last_name}`}
          avatarUuid={user.uuid}
          employeeId={user.id}
          jobData={jobData}
          rightSide={
            <PermissionGate on='compensation' action="edit">
              {disabled ? null : <Button
                type="button"
                size='large'
                variant='contained'
                onClick={props.onUpdateClick}
                startIcon={<StyledPlusIcon />}
              >
                {t('leftMenuCard.update_compensation')}
              </Button>}
            </PermissionGate>
          } />}
      maxWidth='xl'
    >
      <Wrapper>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='section-body'>
          {compensationList.length ? 
            <Table style={{ width: 'auto' }}>
              <TableHead>
                <TableRow>
                  <TableCell className="non-padding-left">{t('employee.job.effective_date')}</TableCell>
                  <TableCell>{t('employee.job.payment_type')}</TableCell>
                  <TableCell>{t('employee.job.payment_rate')}</TableCell>
                  <TableCell>{t('employee.job.additional_payment_types')}</TableCell>
                  <TableCell>{t('employee.job.payment_schedule')}</TableCell>
                  <TableCell>{t('leftMenuCard.updateCompensation.change_reason')}</TableCell>
                  <TableCell>{t('globaly.comment')}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  compensationList && compensationList.map((item: any, index: number) => {
                    return (
                      <TableRow hover={disabled ? false : true} key={item.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell className={item.relevance}>{<span className='dot'></span>} {dateFormat(item.effective_date, 'shortDate') ?? '-'}</TableCell>
                        <TableCell className={item.relevance}>{item.payment_type?.name ?? '-'}</TableCell>
                        <TableCell className={item.relevance}>{item.pay_amount ? `${item.currency && item.currency.symbol} ${(+item.pay_amount).toFixed(2)} / ${item.payment_period.name}` : '-'}</TableCell>
                        <TableCell className={item.relevance}>
                          {item.additional_payment_types?.length
                            ? sortBy(item.additional_payment_types, ['id']).map((item: PaymentType) => <>{item.name}<br/></>)
                            : '-'
                          }
                        </TableCell>
                        <TableCell className={item.relevance}>{item.payment_schedule?.name ?? '-'}</TableCell>
                        <TableCell className={item.relevance}>{item.compensation_change_reason?.name ?? '-'}</TableCell>
                        <TableCell className={item.relevance}>
                          {!isEmpty(item.comment) ? <Tooltip title={item.comment} enterDelay={200}><StyledMessageIcon /></Tooltip> : '-'}
                        </TableCell>
                        <TableCell className={item.relevance}>
                          <div className="action-block">
                            <PermissionGate action="edit" on="compensation" fallback={<StyledMagnifierIcon onClick={() => props.onEditClick(item)} />}>
                              {disabled ? <StyledMagnifierIcon onClick={() => props.onEditClick(item)} /> : <><StyledEditIcon onClick={() => props.onEditClick(item)} />
                                <StyledTrashIcon onClick={() => props.onDeleteClick(item.id)} /></>}
                            </PermissionGate>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                }
              </TableBody>
            </Table>
            : <NoJobEntries>{t('jobInfo.no_job_information')}</NoJobEntries>}
          </div>
        </form>
      </Wrapper>
    </DialogModal>
  );
};

export default CompensationHistory;

const StyledMessageIcon = styled(MessageIcon)`
  &:hover {
    & > path {
      fill: #396;
    }
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

const StyledMagnifierIcon = styled(MagnifierIcon)`
  cursor: pointer;
`;

const StyledDot = styled.span<{ status: string }>`
  display: flex;
  align-self: center;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: ${({ status }) => {
    const color = status === 'past' ? 'var(--dark-gray)' : status === 'future' ? 'var(--orange)' : 'var(--green)';
    return color
  }};
`;

const NoJobEntries = styled.p`
    min-height: 180px;
    color: #8E8E8E;
`;

const StyledPlusIcon = styled(PlusIcon)`
    margin-right: 5px;
    path {
        fill: #FFF;
    }
`;
