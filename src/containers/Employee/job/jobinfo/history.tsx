import { useEffect, useState } from "react";
import styled from "styled-components";
import { useForm } from 'react-hook-form';
import Tooltip from '@mui/material/Tooltip';
import Button from "@mui/material/Button";
import EmployeeCard from "components/Employee/Card";
import EmpEditHeader from "../../editHeader";
import DialogModal from "components/Modal/Dialog";
import { getJobEmployeeDetailList } from "services";
import { isEmpty } from "lodash";
import JobInfoHistoryDelete from "./delete";
import PermissionGate from "permissions/PermissionGate";
import { useTranslation } from "react-i18next";
import { ReactComponent as EditIcon } from 'assets/svg/pen-circle.svg';
import { ReactComponent as TrashCanIcon } from 'assets/svg/trash-can-circle.svg';
import { ReactComponent as MessageIcon } from 'assets/svg/message.svg';
import { ReactComponent as MagnifierIcon } from 'assets/svg/magnifier_circle.svg';
import { ReactComponent as PlusIcon } from 'assets/svg/plus.svg';
import { dateFormat } from "lib/DateFormat";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
const Wrapper = styled.div`
    .section-body{
      min-width: 1200px;
    }
`;


const NoJobEntries = styled.p`
    padding: 0 20px;
    min-height: 180px;
    color: #8E8E8E;
    font-size: 11px;
`;


const JobHistory = (props: any) => {
  const { t } = useTranslation();
  const { handleSubmit } = useForm();
  const { person, jobData, disabled, view } = props;
  const [jobList, setJobList] = useState([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [chosenItemId, setChosenItemId] = useState<any>(null);

  const onSubmit = (data: any) => {
    props.onSubmit(data);
  };

  useEffect(() => {
    getJobEmployeeDetailList(25, 1, person.id).then(res => setJobList(res.data.list))
  }, [person]);

  const DeleteSubmit = () => {
    props.handleDeleteSubmit(chosenItemId)
    setIsDeleteOpen(false)
  };

  const DeleteClick = (id: number) => {
    setChosenItemId(id)
    setIsDeleteOpen(true);
  };

  return (
    <DialogModal
      open={props.isOpen}
      title={t('jobInfo.history')}
      onClose={() => props.onModalClose()}
      nominalHeader={
        <EmpEditHeader
          employeeName={`${person.first_name} ${person.last_name}`}
          avatarUuid={person.uuid}
          employeeId={person.id}
          jobData={jobData}
          rightSide={
            <PermissionGate on='job' action="edit">
              {disabled ? null : <Button
                type="button"
                size='large'
                variant='contained'
                onClick={props.onUpdateClick}
                startIcon={<StyledPlusIcon />}
              >
                {t('jobInfo.update_job_information')}
              </Button>}
            </PermissionGate>
          } />}
      maxWidth='xl'
    >
      <Wrapper>
        <JobInfoHistoryDelete
          isOpen={isDeleteOpen}
          onModalClose={() => setIsDeleteOpen(false)}
          onDelete={DeleteSubmit}
          loadingRequest={props.loadingRequest}
        />
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='section-body'>
              {jobList.length ? <TableContainer style={{ width: 1200 }}>
                <Table style={{ width: 'auto' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell className="non-padding-left">{t('employee.job.effective_date')}</TableCell>
                        <TableCell>{t('jobInfo.employment_status')}</TableCell>
                        <TableCell>{t('employee.job.work_type')}</TableCell>
                        <TableCell>{t('employee.job.job_title')}</TableCell>
                        <TableCell>{t('employee.job.department')}</TableCell>
                        <TableCell>{t('employee.job.division')}</TableCell>
                        <TableCell>{t('employee.address.location')}</TableCell>
                        <TableCell>{t('employee.job.manager_t')}</TableCell>
                        <TableCell>{t('jobInfo.reason')}</TableCell>
                        <TableCell>{t('globaly.comment')}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {
                        jobList && jobList.map((item: any, index: number) => {
                          return (
                            <TableRow hover={disabled ? false : true} key={item.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                              <TableCell className={item.relevance}>{<span className='dot'></span>} {dateFormat(item.effective_date, 'shortDate')}</TableCell>
                              <TableCell className={item.relevance} style={{color: item.employment_status && item.employment_status.id_name === 'terminated' ? 'var(--red)' : ''}}>{item.employment_status ? item.employment_status.name : '-'}</TableCell>
                              <TableCell className={item.relevance}>{item.work_type ? item.work_type.name : '-'}</TableCell>
                              <TableCell className={item.relevance}>{item.job_title ? item.job_title.name : '-'}</TableCell>
                              <TableCell className={item.relevance}>{item.department ? item.department.name : '-'}</TableCell>
                              <TableCell className={item.relevance}>{item.division ? item.division.name : '-'}</TableCell>
                              <TableCell className={item.relevance}>{item.location ? item.location.name : '-'}</TableCell>
                              <TableCell className={item.relevance}>{item.manager ? <EmployeeCard fontSize={11} employee={item.manager} /> : '-'}</TableCell>
                              <TableCell className={item.relevance}>{(item.employment_status.id_name === 'terminated' ? item.job_termination_reason?.name : item.job_change_reason?.name) || '-' }</TableCell>
                              <TableCell className={item.relevance}>
                                {!isEmpty(item.comment) ? <Tooltip title={item.comment} enterDelay={200}><StyledMessageIcon /></Tooltip> : '-'}
                              </TableCell>
                              <TableCell className={item.relevance}>
                                <div className="action-block">
                                  <PermissionGate action="edit" on="compensation" fallback={<StyledMagnifierIcon onClick={() => props.onEditClick(item)} />}>
                                    {view ? 
                                      <StyledMagnifierIcon onClick={() => props.onEditClick(item)} /> : 
                                      <>
                                        <StyledEditIcon onClick={() => props.onEditClick(item)} />
                                        <StyledTrashIcon onClick={() => DeleteClick(item.id)} />
                                      </>
                                    }
                                  </PermissionGate>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      }
                    </TableBody>
                </Table>
              </TableContainer> : <NoJobEntries>{t('jobInfo.no_job_information')}</NoJobEntries>}
          </div>
        </form>
      </Wrapper>
    </DialogModal>
  );
};

export default JobHistory;

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


const StyledMessageIcon = styled(MessageIcon)`
  &:hover {
    & > path {
      fill: #396;
    }
  }
`;

const StyledPlusIcon = styled(PlusIcon)`
    margin-right: 5px;
    path {
        fill: #FFF;
    }
`;
