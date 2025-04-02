import styled from "styled-components";
import { ListItem } from "../personal/section";
import { ReactComponent as EditIcon } from 'assets/svg/pen-circle.svg';
import { ReactComponent as TrashCanIcon } from 'assets/svg/trash-can-circle.svg';
import { useTranslation } from "react-i18next";
const Wrapper = styled.div`
  :hover{
    .top{
      .actions{
        visibility: visible;
      }
    }
  }

 .top{
   display: flex;
    justify-content: space-between;
    align-items: center;

    .actions{
      display: flex;
      align-items: center;
      visibility: hidden;
      gap: 20px;
      & > div {
        display: flex;
        align-items: center;
        & > span {
          cursor: pointer;
        }
      }
    }
  }

 .body{
   padding: 0px 0px 40px !important;
    
   .list-item{
     font-size: 11px;
     
     .title{
       display: inline-block;
       width: 170px;
       text-align: right;
     }
   }

   h5{
     margin-top: 10px;
     margin-bottom: 10px;
     color: #172B37;
     font-weight: bold;
     font-size: 12px;
     font-family: 'Aspira Demi', 'FiraGO Regular';
   }
 }
`;

const Relation = styled.div`
    font-size: 13px;
    font-weight: bold;
    color: #172B37;
    font-family: 'Aspira Demi', 'FiraGO Regular';
    display: flex;
    align-items: center;
    .primary {
        font-weight: 100;
        color: #5DAE85;
        padding: 5px 10px 3px;
        border-radius: 4px;
        margin-left: 15px;
        font-size: 11px;
        font-family: 'Aspira Regular', 'FiraGO Regular';
        
        span {
            width: 9px;
            height: 9px;
            background: #7FBF9E;
            border-radius: 50%;
            display: inline-block;
            margin-right: 5px;
            
        }
    }
`

const EmergencyItem = (props: any) => {
  const { item, disabled } = props;
  const { t } = useTranslation();


  return (
    <Wrapper>
      <div className='top'>
        <Relation>
          <h4>{item.name} - {item.contact_relationship && item.contact_relationship.name}</h4>
          {item.primary && <span className='primary'><span></span>{t('emergency.primary_contact')}</span>}
        </Relation>
        {disabled ? null : <div className='actions'>
          <div onClick={() => props.onEditClick(item)}>
            <StyledEditIcon width={23} height={23} /><span>{t('globaly.edit')}</span>
          </div>
          <div onClick={() => props.onDeleteClick(item)}>
            <StyledTrashIcon width={23} height={23} /><span>{t('globaly.lowercase_delete')}</span>
          </div>
        </div>}
      </div>

      <div className='body'>
        <h5>{t('emergency.contact_information')}</h5>
        <div style={{ marginBottom: 30 }}>
          <ListItem title={t('employee.contact.work_phone')} value={item.work_phone +
            (item.work_phone_ext ? ` ${t('globaly.ext')} ${item.work_phone_ext}` : '')} />
          <ListItem title={t('employee.contact.mobile_phone')} value={item.mobile_phone} />
          <ListItem title={t('employee.contact.home_phone')} value={item.home_phone} />
          <ListItem title={t('employee.contact.email')} value={item.email} />
        </div>

        <h5>{t('employee.address.address')}</h5>
        <div>
          <ListItem title={t('employee.address.country')} value={item.country && item.country.name} />
          <ListItem title={t('employee.address.address_line_one')} value={item.address} />
          <ListItem title={t('employee.address.address_line_two')} value={item.address_details} />
          <ListItem title={t('employee.address.city')} value={item.city} />
          {item.country && item.country.iso === 'US' ?
            <ListItem title={t('employee.address.state_province_region')}
              value={item.state && item.state.name} /> :
            <ListItem title={t('employee.address.state_province_region')} value={item.region} />}
          <ListItem title={t('employee.address.postal_code')} value={item.postal_code} />
        </div>
      </div>

    </Wrapper>
  );
};

export default EmergencyItem;

const StyledEditIcon = styled(EditIcon)`
  cursor: pointer;
  margin-right: 5px;
  & circle {
    fill: #B5B5B5;
  }
  & path {
    fill: #FFF;
  }
`;

const StyledTrashIcon = styled(TrashCanIcon)`
  cursor: pointer;
  margin-right: 5px;
  & circle {
    fill: #B5B5B5;
  }
  & path {
    fill: #FFF;
  }
`;

