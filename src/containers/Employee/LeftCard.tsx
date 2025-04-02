import { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import styled from "styled-components";
import SocialMediaLink from "components/SocialMediaLink";
import AvatarUpload from "components/AvatarUpload";
import EmployeeCard from "components/Employee/Card"
import EmployeeImage from "components/Employee/Image";
import PermissionGate from "permissions/PermissionGate";
import { calculateDays, isEmpty, employeeInitials, jobDescription, generateTypes } from "../../utils/common";
import Actions from "./actions";
import { ReactComponent as PenIcon } from 'assets/svg/pen-circle.svg';
import { ReactComponent as EnvelopeIcon } from 'assets/svg/envelope.svg';
import { ReactComponent as PhoneIcon } from 'assets/svg/phone.svg';
import { ReactComponent as MobileIcon } from 'assets/svg/mobile.svg';
import { ReactComponent as CalendarIcon } from 'assets/svg/calendar.svg';
import { ReactComponent as NumberSignIcon } from 'assets/svg/number_sign.svg';
import { ReactComponent as RsgeIcon } from 'assets/svg/rsge.svg';
import { useTranslation } from "react-i18next";
import { dateFormat } from "lib/DateFormat";
import { region } from "lib/Regionalize";
import { isEmpty as lodashIsEmpty } from "lodash";
import { useSelector } from "react-redux";
import { currentUserSelector } from "redux/selectors";
const Wrapper = styled.div`
  max-width: 21%;
  flex: 0 0 21%;
  position: relative;
  width: 100%;
  min-height: 1px;
  padding-right: 10px;
  padding-left: 20px;
    
  .body{
      background: #fff;
      padding: 15px 15px 15px 15px;
      border-radius: 6px;

      .navigation{
        display: flex;
        justify-content: space-between;
        align-items: center;

        .counter{
          color: rgba(0,16,26, 0.73);
          font-size: 10px;
        }
        
        a{
          color: #00101A;
          font-size: 12px;
          display: flex;
          align-items: center;

          p{
            transform: translateY(2px);
          }

          span{
              background: #F2F2F4;
              border-radius:50%;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 18px;
              height: 18px;
          }

          span.left-item{
            margin-right: 10px;
          }

          span.right-item{
            margin-left: 10px;
          }
        }
      }

      button.take-action{
        width: 100%;
        padding: 13px 20px;
        text-transform: uppercase;
        margin-bottom: 15px;
        font-size: 12px;
        display: flex;
        justify-content: center;
        font-family: 'Aspira Wide Demi', 'FiraGO Medium';
        font-feature-settings: "case";
        -moz-font-feature-settings: "case";
        -webkit-font-feature-settings: "case";
        & > span {
          margin-left: 10px;
        }
      }

      .profile-pic{
        position: relative;
        width: 100px;
        height: 100px;
        border-radius: 50%;
        margin: 0 auto;
        padding: 3px;
        border: 1px solid #F1F1F1;

        &>div{
          height: 100%;
        }

        .noPhoto{
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100px;
          height: 100px;
          color: #fff;
          background: #5B5BB9;
          border-radius: 50%;
          font-size: 19px;
          text-transform: uppercase;
        }

        img{
          width: 100%;
          max-width: unset !important;
          height: 100%;
          border-radius: 50%;
        }
      }

      .info{
        margin-top: 15px;
        text-align: center;
        border-bottom: 1px solid #F1F1F1;
        padding-bottom: 12px;
        

        .future-termination{
          border-radius: 20px;
          display: inline-block;
          margin-top: 8px;
          color: #B51212;
          font-size: 10px;
          background: #F5D6D6;
          padding: 4.5px 11px;
          
          span{
            opacity: 0.73;
          }
        }

        .future-hire{
          border-radius: 20px;
          display: inline-block;
          margin-top: 8px;
          margin-left: 5px;
          color: #339966;
          font-size: 10px;
          background: var(--light-green);
          padding: 4.5px 11px;
          
          span{
            opacity: 0.73;
          }
        }

        h4{
          color: #414141;
          font-size: 13px;
          margin-bottom: 6px;
          text-transform: capitalize;
          font-family: 'Aspira Wide Demi', 'FiraGO Medium';
        }

        p{
          color:#80888D;
          font-size: 11px;
          line-height: 20px;
        }

        .social-links{
          display: flex;
          margin: 11px 0px auto;
          justify-content: center;

          svg{
            margin-right: 6px;
          }
        }
      }

      .second-part{
        .block{
            margin: 15px 0 30px; 

            h4{
              color: #414141;
              margin-bottom: 15px;
              font-family: 'Aspira Wide Demi', 'FiraGO Medium';
            }
            
            .block-text{
              font-size: 11px;
              color: #414141;
              display: flex;
              align-items: center;
            }
        }

        span.circle{
          width: 18px;
          height: 18px;
          background: #efefef;
          border-radius: 50%;
          display: flex;
          align-items: center;
          margin-right: 7px;
          justify-content: center;
        }
      }

      .contact-block{
        p{
          margin: 6px 0;
        }
      }

      .more-sub{
        border-top: 1px solid #F1F1F1;
        padding-top: 15px;
        margin-top: 3px;
        color: #FF9933;
        text-decoration: underline;
        font-size: 11px;
        display: flex;
        align-items: center;
       
        div{
          cursor: pointer;
        }
        
        .more-sub-icon{
          border-radius: 50%;
          background: #E4E4E4;
          width: 30px;
          height: 30px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2px;
          margin-right: 10px;
          
          .dots{
            border-radius: 50%;
            background: #7B7B7B;
            width: 3px;
            height: 3px;
          }
        }
      }
    }
`;

const LeftCard = ({ person, refreshEmployeeInfo, match, disabled }: any) => {
  const { active_job_detail: details } = person;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loadMoreDirectRep, setLoadMoreDirectRep] = useState<boolean>(false);
  const { t } = useTranslation();
  const currentUser = useSelector(currentUserSelector)
  useEffect(() => {
    return setLoadMoreDirectRep(false)
  }, [match.params.id])

  const isSubordinate = () => {
    return person.active_job_detail.manager?.id === currentUser.employee.id
  }

  const directReports = () => setLoadMoreDirectRep(true);

  return (
    <Wrapper>
      <div className='body'>
        <div style={{ position: 'relative' }}>
          <Actions person={person} refreshEmployeeInfo={refreshEmployeeInfo} disabled={disabled} />
        </div>

        <div style={{ paddingLeft: 12, paddingRight: 12 }}>
          <div className='profile-pic'>
            {<EmployeeImage
              initials={employeeInitials(person.first_name + ' ' + person.last_name)}
              uuid={person.uuid}
              fontSize={24}
            />}
            {disabled ? null : <StyledPenIcon onClick={() => setIsOpen(true)} />}
          </div>

          <div className='info'>
            {/*Name*/}
            <h4>{person.first_name}
              {person.preferred_name ? ` (${person.preferred_name})` : null}
              {person.middle_name ? ` ${person.middle_name}` : null}
              {person.last_name ? ` ${person.last_name}` : null}
            </h4>

            {/*Job Details*/}
            <div>
              
              
            </div>
            <p className='subtitle'>
              {details?.job_title?.name && details?.job_title?.name}
              <br/>
              {generateTypes({department_name: details?.department?.name, division_name: details?.division?.name, location_name: details?.location?.name})}
            </p>

            {/*Status*/}
            {(person?.status === 'terminated' || person?.status === 'hiring') && <span className='future-termination'>{t('employee.statuses.'+person.status)}</span>}
            {person && person.future_operation && person.future_operation.type === 'termination' &&
              <span className='future-termination'>
                {t('leftMenuCard.leaving_on')} {dateFormat(new Date(person.future_operation.operation_date), 'shortMonthAndDay')}
                <span> | {calculateDays(person.future_operation.operation_date) === 1 ? t('leftMenuCard.tomorrow') :
                  `${t('leftMenuCard.in')} ${calculateDays(person.future_operation.operation_date)} ${t('leftMenuCard.days')}`}</span>
              </span>
            }
            {person && person.future_operation && person.future_operation.type === 'hire' &&
              <span className='future-hire'>
                Starting on {dateFormat(new Date(person.future_operation.operation_date),  'shortMonthAndDay')}
                <span> | {calculateDays(person.future_operation.operation_date) === 1 ? t('leftMenuCard.tomorrow') :
                  `${t('leftMenuCard.in')} ${calculateDays(person.future_operation.operation_date)} ${t('leftMenuCard.days')}`}</span>
              </span>
            }

            {/*Social Links*/}
            {person.employee_contact_info && (person.employee_contact_info.linkedin || person.employee_contact_info.facebook || person.employee_contact_info.twitter) &&
              <div className='social-links'>
                {person.employee_contact_info && person.employee_contact_info.linkedin &&
                  <SocialMediaLink name='linkedin'
                    href={person.employee_contact_info && person.employee_contact_info.linkedin} />}
                {person.employee_contact_info && person.employee_contact_info.twitter &&
                  <SocialMediaLink name='twitter'
                    href={person.employee_contact_info && person.employee_contact_info.twitter} />}
                {person.employee_contact_info && person.employee_contact_info.facebook &&
                  <SocialMediaLink name='facebook'
                    href={person.employee_contact_info && person.employee_contact_info.facebook} />}
              </div>
            }
          </div>

          <div className='second-part'>
            {!isEmpty(person.employee_contact_info) && (person.employee_contact_info.work_email || person.employee_contact_info.mobile_phone || person.employee_contact_info.work_phone) &&
              <div className='block contact-block'>
                <h4>{t('leftMenuCard.contact')}</h4>

                {/*Emails*/}
                {person.employee_contact_info.work_email &&
                  <p className="block-text">
                    <span className='circle'><EnvelopeIcon /></span>
                    {person.employee_contact_info.work_email}
                  </p>
                }

                {/*Phone Numbers*/}
                {person.employee_contact_info.work_phone &&
                  <p className="block-text">
                    <span className='circle'><PhoneIcon /></span>
                    {person.employee_contact_info.work_phone} {person.employee_contact_info.work_phone_ext && `Ext. ${person.employee_contact_info.work_phone_ext}`}
                  </p>}
                {person.employee_contact_info.mobile_phone &&
                  <p className="block-text">
                    <span className='circle'><MobileIcon fill='#424E55' /></span>
                    {person.employee_contact_info.mobile_phone}
                  </p>}
              </div>}

            {/*Hire Date*/}
            {person.active_job_detail && person.status !== 'terminated' &&
              <div className='block'>
                <h4>{t('leftMenuCard.hire_date')}</h4>
                <p className="block-text">
                  <span className='circle'><StyledCalendarIcon width={10} height={10} /></span>
                  <span>{dateFormat(new Date(person.active_job_detail.hiring_date), 'shortDate')}</span>
                </p>
                <p className="block-text" style={{ paddingLeft: 26, paddingTop: 6 }}>
                  {person.active_job_detail.effective_time}
                </p>
              </div>}

            {/*Termination Date*/}
            {person.active_job_detail && person.status === 'terminated' &&
              <div className='block'>
                <h4> {t('employee.job.termination_date')}</h4>
                <p className="block-text">
                  <span className='circle'><StyledCalendarIcon width={10} height={10} /></span>
                  <span>{dateFormat(new Date(person.active_job_detail.effective_date), 'shortDate')}</span>
                </p>
                <p className="block-text" style={{ paddingLeft: 26, paddingTop: 6 }}>
                  {person.active_job_detail.effective_time}
                </p>
              </div>}

            {/*RS.GE Status*/}
            {region(['geo']) && !lodashIsEmpty(person?.revenue_data) && <div className='block'>
              <h4>{t('leftMenuCard.rsgForm.rsge_status')}</h4>
              <RsgeStatusContainer>
                <RsgeIcon/> <RsgLable $active={person?.revenue_data?.status?.id}>{person?.revenue_data?.status?.name}</RsgLable>
              </RsgeStatusContainer>
              <p className="block-text">
                <span className='circle'><StyledCalendarIcon width={10} height={10} /></span>
                <span>{t('leftMenuCard.rsgForm.status_updated', {updateAt: dateFormat(new Date(person.revenue_data.sync_date), 'shortDate')})}</span>
              </p>
            </div>}

            {/*Employee Number*/}
            <div className='block'>
              <h4>{t('employee.employee_number')}</h4>
              <p className="block-text">
                <span className='circle'><NumberSignIcon /></span>
                {person.id}
              </p>
            </div>

            {/*Managers*/}
            {person.active_job_detail != null && person.active_job_detail.manager != null &&
              <div className='block block-text'>
                <h4>{t('leftMenuCard.manager')}</h4>
                <EmployeeCard employee={person.active_job_detail.manager} fontSize={11} />
              </div>}

            {/*Direct Report*/}
            {!!person.subordinates && !!person.subordinates.length &&
              <div className='block block-text'>
                <h4>{person.subordinates.length} {t('employee.job.direct_reports')}</h4>
                <ul>
                  {person.subordinates.filter((_: unknown, i: number) => loadMoreDirectRep || i < 5).map((item: any, index: number) =>
                    <div key={index} style={{ marginBottom: 10 }}>
                      <PermissionGate on="employee" shouldVisible properties={{ disabled: isSubordinate() }}>
                        <EmployeeCard employee={item} key={item.id} fontSize={11} />
                      </PermissionGate>
                    </div>
                  )}

                  {!loadMoreDirectRep && person.subordinates.length > 5 &&
                    <div className='more-sub'>
                      <div className='more-sub-icon' onClick={directReports}>
                        <div className='dots'></div><div className='dots'></div><div className='dots'></div>
                      </div>
                      <div onClick={directReports}>{person.subordinates.length - 5} {t('leftMenuCard.more')}</div>
                    </div>
                  }
                </ul>
              </div>}
          </div>

        </div>
      </div>

      <AvatarUpload
        open={isOpen}
        autonomous
        employeeId={person.id}
        onClose={() => setIsOpen(false)}
        onFinishAction={() => refreshEmployeeInfo()}
      />
    </Wrapper>
  );
};

export default withRouter(LeftCard);

const StyledPenIcon = styled(PenIcon)`
    position: absolute;
    bottom: 10px;
    right: 0;
    height: 23px;
    width: 23px;
    cursor: pointer;
    & circle {
        fill: #EFEFEF;
    }
    &:hover {
        circle {
          fill: var(--green);
        }
        path {
            fill: #FFF;
        }
    }
`;

const StyledCalendarIcon = styled(CalendarIcon)`
  & path {
    fill: #424e55;
  }
  & rect {
    fill: #424e55;
  }
`;

const RsgLable = styled.div<{ $active: any }> `
  background-color: ${({$active}) => $active === 'active' ? '#eaf3dc' : '#FDECEE'} ;
  border-radius: 10px;
  text-align: left;
  font-size: 11px;
  letter-spacing: 0px;
  color: ${props => props.$active === 'active' ? '#688430' : '#F46A6A'} ;
  padding: 4px 13px;
`

const RsgeStatusContainer = styled.div `
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  margin-bottom: 8px;
`
