import { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import styled from "styled-components";
import EmploymentDetailsEdit from "./edit";
import Section, { LightPersonListItem, ListItem } from "../section";
import { updateJobEmployeeDetail, getJobEmployementDetail } from 'services'
import { useToasts } from "react-toast-notifications";
import PermissionGate from "permissions/PermissionGate";
import { useTranslation } from "react-i18next";
import { dateFormat } from "lib/DateFormat";

const Wrapper = styled.div`
.section-body{
    padding: 20px 45px;
    
    .list-item .title{
        width: 170px;
        display: inline-block;
        text-align: right;
    }
}
`;

const EmploymentDetails = ({ person, refreshEmployeeInfo, match, disabled }: any) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
  const { addToast } = useToasts();
  const [jobInfo, setJobInfo] = useState<any>([]);

  useEffect(() => {
    getJobEmployementDetail(match.params.id ?? person.id).then(res => {
      setJobInfo(res.data[0]);
    })
  }, [match.params.id])


  const handleEditSubmit = (data: any) => {
    setLoadingRequest(true);
    updateJobEmployeeDetail(data, person.id).then(res => {
      setLoadingRequest(false);
      person.employee_employment_detail = res.data;
      setJobInfo(res.data)
      addToast(t('employee.successfully_updated'), {
        appearance: 'success',
        autoDismiss: true,
      })
      refreshEmployeeInfo()
      setIsOpen(false)
    }).catch(err => {
      setLoadingRequest(false);
      addToast(err.response.data.errors[0].message, {
        appearance: 'error',
        autoDismiss: true,
      })
    });
  }

  const isRecipientSuboordinate = () => {
    return person.subordinates.find((subordintate: any) => subordintate.id === jobInfo?.time_off_recipient.id)
  }

  return (
    <Wrapper style={{ height: 'calc(100% - 15px)' }}>
      <PermissionGate action="edit" on="employment" shouldVisible properties={{ disabled: true }}>
        <Section title={t('employee.employment_details')}
          withUpdate={false}
          withEdit={true}
          onEditClick={() => setIsOpen(true)}
          style={{ height: '100%' }}
          disabled={disabled}
        >

          <div className='section-body'>
            <ListItem title={t('employee.employee_id')} value={person.id} />
            <ListItem title={t('employee.job.hire_date')} value={jobInfo?.hire_date ? dateFormat(new Date(jobInfo.hire_date), 'shortDate') : null} />
            <ListItem title={t('employee.job.probation_end_date')} value={jobInfo?.probation_end_date ? dateFormat(new Date(jobInfo.probation_end_date), 'shortDate') : null} />
            <ListItem title={t('employee.job.contract_end_date')} value={jobInfo?.contract_end_date ? dateFormat(new Date(jobInfo.contract_end_date), 'shortDate') : null} />
            {jobInfo?.time_off_recipient ? (
              <LightPersonListItem
                title={t('employee.job.time_off_alert_recipient')}
                manager={isRecipientSuboordinate() ? person : null}
                style={{ marginTop: i18n.language === 'ka' ? '20px' : '12px' }}
                values={[jobInfo?.time_off_recipient]}
              />
            ) : (
              <ListItem title={t('employee.job.time_off_alert_recipient')} style={{ marginTop: '20px' }} value={'-'} />
            )}
          </div>

          <EmploymentDetailsEdit
            isOpen={isOpen}
            user={person}
            jobData={person.active_job_detail}
            onModalClose={() => setIsOpen(false)}
            onSubmit={handleEditSubmit}
            loadingRequest={loadingRequest}
          />
        </Section>
      </PermissionGate>
    </Wrapper>
  );
};

export default withRouter(EmploymentDetails);
