import styled from "styled-components";
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
    
            &:hover{
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
  }

  div{
      color: #414141;
  }
  
`;

const StatusWrapper = styled.span`
    .green{
        background: #5DAE85;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: inline-block;
        margin-right: 8px;
    }

    .red{
        background: #D26E6E;
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin-right: 8px;
    }
`;

interface SectionProps {
    title: string,
    onEditClick: () => void,
    children: any,
    rightText?: string,
    style?: any,
    disabled?: boolean,
    view?: boolean,
}

const renderComma = (index: number, length: number) => {
    if (index < length - 1) {
        return ', ';
    } else {
        return '';
    }
}

export const StatusItem = ({ status }: any) => {
    const { t } = useTranslation();
    return <StatusWrapper>
        <span className={status ? 'green' : 'red'}></span><span style={{ color: status ? '#5DAE85' : '#D26E6E' }}>{status ? t('globaly.current') : t('globaly.expired')}</span></StatusWrapper>
}

export const ListItem = ({ title, value, isLink, smallBlock }: any) => {

    return <ListWrapper className='list-item'>
        <div className='title'>{title}</div>
        {isLink ?
            <div style={{ flex: smallBlock ? 0.45 : 1}}><a href={value && value.includes('http') ? `${value}` : value ? `https://${value}` : '#'} target={value ? `_blank` : '_self'}>{value ? value : '-'}</a></div> :
            <div style={{ flex: smallBlock ? 0.45 : 1}}>{value ? value : '-'}</div>}
    </ListWrapper>
}

export const MultiListItem = ({ title, data }: any) => {
    return <ListWrapper className='list-item'>
        <div className='title'>{title}</div>
        <div style={{ flex: 1 }}>{data && data.map((item: any, index: any) => item.language.name + renderComma(index, data.length))} {!data.length && '-'}</div>
    </ListWrapper>
}

const Section = ({ title, onEditClick, children, rightText, style, disabled, view }: SectionProps) => {
    const { t } = useTranslation();
    return (
        <Wrapper style={style}>
            <div className='header'>
                <span>
                    {title}
                </span>
                {
                    disabled 
                        ? view 
                            ? <span onClick={onEditClick} className='editBtn'>{rightText || t('globaly.view')}</span> 
                            : null
                        : <span onClick={onEditClick} className='editBtn'>{rightText || t('globaly.edit')}</span>
                }
            </div>
            <div>
                {children}
            </div>
        </Wrapper>
    );
};

export default Section;
