import { Link } from "react-router-dom";
import styled from "styled-components";
import SocialMediaLink from 'components/SocialMediaLink'
import EmployeeImage from "components/Employee/Image";
import { calculateDays, employeeInitials, generateTypes } from "utils/common";

import { ReactComponent as PersonIcon } from 'assets/svg/person.svg';
import { ReactComponent as PersonGroupIcon } from 'assets/svg/persons_group.svg';
import { ReactComponent as EnvelopeIcon } from 'assets/svg/envelope.svg';
import { ReactComponent as PhoneIcon } from 'assets/svg/phone.svg';
import { ReactComponent as MobileIcon } from 'assets/svg/mobile.svg';
import { useTranslation } from "react-i18next";
import { dateFormat } from "lib/DateFormat";

const Wrapper = styled.div`
  border-bottom: 1px solid #F2F2F4;
  margin-bottom: 17px;
  padding-bottom: 17px;

  .user-info{
    display: flex;
    align-items: center;

    .picture{
      margin-right: 20px;
      max-width: 80px;
      height: 80px;
      flex-shrink: 0;
      border-radius: 50%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      object-fit: cover;

      img{
         height: 100%;
         max-width: unset;
      }
 
      .name-ph{
        display: flex;
        align-items: center;
        justify-content: center;
        text-transform: uppercase;
        width: 80px;
        height: 80px;
        color: #fff;
        background: #5B5BB9;
        border-radius: 50%;
        font-size: 18px;
      }
    }

    .name{
      color: var(--green);
      margin-bottom: 4px;
      display: inline-block;
      font-family: 'Aspira Wide Demi', 'FiraGO Medium';
      font-size: 14px;

      span{
        font-weight: normal;
        color: var(--red);
        font-size: 8px;
        background: #F5D6D6;
        padding: 5.5px 10px;
        border-radius: 20px;
        margin-left: 11px;
        transform: translateY(-2px);
        text-transform: capitalize;
      }
    }

    p{
      margin-bottom: 4px;
      line-height: 18px;
    }

    .social-links{
      margin-top: 7px;
      display: flex;
      max-width: 66px;
      height: 18px;
      
      svg{
        margin-right: 7px;
      }
    }
  }

  .mid{
    p{
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      svg {
        margin-right: 3px;
      }
    }
  }

  .right{
    span{
      color: var(--green);
      cursor: pointer;
      margin-left: 3px;
      :hover{
        text-decoration: underline;
        color: var(--orange);
      }
    }
    .disabled {
      color: var(--green);
      cursor: auto;
      :hover{
        text-decoration: none;
        color: var(--green);
      }
    }
    p{
      display: flex;
      align-items: center;
      svg {
        margin-right: 3px;
      }
    }
  }
`;

const DirectoryImage = styled.div`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin-right: 17px;
    font-size: 10px;
`;

const PersonItem = (props: any) => {
  const { t } = useTranslation();
  const { item, onReportsToClick, disabled = false } = props;

  return (
    <Wrapper>
      <div className='row'>
        <div className='col-md-6'>
          <div className='user-info'>
            <DirectoryImage>
              {<EmployeeImage
                initials={employeeInitials(item.first_name + ' ' + item.last_name)}
                uuid={item.uuid}
                fontSize={20}
              />}
            </DirectoryImage>

            <div style={{ minHeight: 67 }}>
              {disabled ?
                <span className='name'>
                  {item.first_name} {!!item.preferred_name && `(${item.preferred_name})`} {item.middle_name} {item.last_name}
                  {item.termination_date && <span>{t('homePage.leaving')} {calculateDays(item.termination_date) === 1 ? t('homePage.tomorrow') : t('homePage.on') + dateFormat(new Date(item.termination_date), 'longMonthDay')}</span>}
                </span> :
                <Link to={`/employee/${item.id}`} className='name'>
                  {item.first_name} {!!item.preferred_name && `(${item.preferred_name})`} {item.middle_name} {item.last_name}
                  {item.termination_date && <span>{t('homePage.leaving')} {calculateDays(item.termination_date) === 1 ? t('homePage.tomorrow') : t('homePage.on') + dateFormat(new Date(item.termination_date), 'longMonthDay')}</span>}
                </Link>}

                {item.job_title_name && <p>{item.job_title_name}</p>}
                <p>{generateTypes(item)}</p>
              {(item.linkedin || item.twitter || item.facebook) && <div className='social-links'>
                {item.linkedin && <SocialMediaLink name='linkedin' href={item.linkedin} />}
                {item.twitter && <SocialMediaLink name='twitter' href={item.twitter} />}
                {item.facebook && <SocialMediaLink name='facebook' href={item.facebook} />}
              </div>}
            </div>
          </div>
        </div>
        <div className='col-md-3' style={{ display: 'flex', alignItems: 'center' }}>
          <div className='mid' style={{ height: 67, marginLeft: 60 }}>
            {item.work_email && <p> <EnvelopeIcon fill='#00101A' /> <a href={`mailto:${item.work_email}`}>{item.work_email}</a> </p>}
            {item.work_phone && <p> <PhoneIcon fill='#00101A' /> {item.work_phone} {item.work_phone_ext ? `${t('homePage.ext')}. ${item.work_phone_ext}` : ''}</p>}
            {item.mobile_phone && <p style={{ marginBottom: 0 }}> <MobileIcon /> {item.mobile_phone}</p>}
          </div>
        </div>
        <div className='col-md-3' style={{ display: 'flex', alignItems: 'center' }}>
          <div className='right' style={{ height: 67 }}>
            {item.manager_first_name &&
              <p><PersonIcon /> {t('homePage.reports_to')} {disabled ? <span className='disabled'>{item.manager_first_name} {item.manager_last_name}</span> :
                <Link target='_blank' rel="noreferrer" to={`/employee/${item.manager_id}`}><span>{item.manager_first_name} {item.manager_last_name}</span></Link>}</p>
            }
            {item.subordinate_count > 0 && <p style={{marginTop: 7}}> <PersonGroupIcon /> <span onClick={() => onReportsToClick(item.id)}>{item.subordinate_count} {t('employee.job.direct_reports')}</span></p>}
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default PersonItem;
