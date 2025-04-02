import React from "react";
import styled from "styled-components";
import EmployeeCard from "components/Employee/Card";
import PermissionGate from "permissions/PermissionGate";
import { useTranslation } from "react-i18next";
const Wrapper = styled.div`
    border: 1px solid #EEEEEE;
    border-radius: 4px;
    margin-bottom: 15px;


    .header{
        background: #C3E1D2;
        border-radius: 4px 4px 0 0;
        padding: 8.5px 12px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        & > span {
            font-size: 12px;
        }
        .editBtn{
            cursor: pointer;
            margin-left: 10px;
            font-size: 12px;
            :hover{
                text-decoration: underline;
            }
        }
    }
`;

const ListWrapper = styled.div`
  margin: 5px 0;
  display:flex;
  flex-direction: row;

  .title{
      color: #80888D;
      margin-right: 12px;
      flex: .35;
      max-width: 170px;
      flex: 1;
  }
  
  .sectionValue{
      color: #414141;
      flex: 1;
      display: block;
      display: -webkit-box;
      line-height: 1.4;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
  }
  
  .more-sub{
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
`;

interface SectionProps {
    title: string,
    children: any,
    withUpdate?: boolean
    withEdit?: boolean
    withHistory?: boolean,
    onUpdateClick?: any
    onEditClick?: any
    onHistoryClick?: any
    style?: any,
    disabled?: boolean
}

export const ListItem = React.forwardRef<any, any>(({ title, value, isRed, style }, ref) => {
    return <ListWrapper className='list-item' style={style}>
        <div className='title'>{title}</div>
        <div className='sectionValue' style={{ color: isRed ? '#D26E6E' : '' }} ref={ref}>
            {isRed && <span className='dot'></span>}{value && value ? value : '-'}
        </div>
    </ListWrapper>

});

export const LightPersonListItem = ({ manager, title, isMulti, values, showMore, style }: any) => {
    const isSubordinate = (manager_subordinate: any) => {
        return manager?.subordinates.find((subordinate: any) => subordinate.id === manager_subordinate.id);
    }

    const { t } = useTranslation();
    if (isMulti) {
        return <ListWrapper className='list-item' style={style}>
            <span className='title' style={{ marginTop: 8 }}>{`${values.length} ${title}`}</span>
            <span>
                {values.filter((_: unknown, i: number) => i < 2).map((item: any) =>
                    <div key={item.id} style={{ marginBottom: 9 }}>
                        <PermissionGate on="employee" shouldVisible properties={{ disabeled: !isSubordinate(item) }}>
                            <EmployeeCard employee={item} fontSize={11} />
                        </PermissionGate>
                    </div>
                )}

                {values.length > 2 &&
                    <div className='more-sub'>
                        <div className='more-sub-icon' onClick={showMore}>
                            <div className='dots'></div><div className='dots'></div><div className='dots'></div>
                        </div>
                        <div onClick={showMore}>{values.length - 2} {t('globaly.more')}</div>
                    </div>
                }
            </span>
        </ListWrapper>

    } else {
        return <ListWrapper className='list-item d-flex align-items-center' style={style}>
            <span className='title'>{title}</span>
            <PermissionGate on="employee" shouldVisible properties={{ disabled: values ? !isSubordinate(values[0]) : true }}>
                <EmployeeCard employee={values ? values[0] : manager} fontSize={11} />
            </PermissionGate>
        </ListWrapper>
    }
};

const Section = ({
    title,
    children,
    withUpdate = true,
    withEdit,
    withHistory,
    onUpdateClick,
    onEditClick,
    onHistoryClick,
    style,
    disabled = false
}: SectionProps) => {
    const { t } = useTranslation();
    return (
        <Wrapper style={style}>
            <div className='header'>
                <span>
                    {title}
                </span>
                <div>
                    {withUpdate && !disabled && <span onClick={onUpdateClick} className='editBtn'>{t('globaly.lowercase_update')}</span>}
                    {withEdit && !disabled && <span onClick={onEditClick} className='editBtn'>{t('globaly.edit')}</span>}
                    {withHistory && <span onClick={onHistoryClick} className='editBtn'>{t('globaly.history')}</span>}
                </div>
            </div>
            <div>
                {children}
            </div>
        </Wrapper>
    );
};

export default Section;
