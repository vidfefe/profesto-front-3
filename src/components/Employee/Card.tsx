import { useRef, useState, Fragment, CSSProperties } from 'react';
import styled from 'styled-components';
import EmployeeImage from "./Image";
import { employeeInitials, generateTypes, isOverflown } from "utils/common";
import { Link } from "react-router-dom";
import Tooltip from '@mui/material/Tooltip';
import { useTranslation } from "react-i18next";
interface IEmployee {
    first_name: string
    last_name: string
    preferred_name: string
    middle_name: string
    uuid: string
    id: number
    termination_date?: string
    job_title_name: string
    additional_info: string
    department_name: string
    division_name: string
    location_name: string,
    onboarding?: string,
};

interface PersonProps {
    employee: IEmployee;
    imageSize?: number;
    fullName?: boolean;
    fullJobInfo?: boolean;
    bottomBorder?: boolean;
    imageFontSize?: number;
    fontSize?: number;
    additionalInfo?: any;
    disabled?: boolean;
    additionalInfoStyle?: CSSProperties;
};

const EmployeeCard = ({
    employee,
    imageSize = 30,
    fullName = false,
    fullJobInfo = false,
    bottomBorder = false,
    imageFontSize,
    fontSize = 12,
    additionalInfo,
    disabled = false,
    additionalInfoStyle,
}: PersonProps) => {
    const cardRef = useRef(null);
    const [isOverflownName, setIsOverflownName] = useState(false);
    const { t } = useTranslation();
    const handleEmployeeRedirect = () => {
        const win: any = window.open(`/employee/${employee.id}`, "_blank");
        win.focus();
    };

    const handleMouseEnter = () => {
        const isCurrentlyOverflown = isOverflown(cardRef.current!);
        setIsOverflownName(isCurrentlyOverflown);
    };

    const handleMouseLeave = () => {
        setIsOverflownName(false);
    };

    const renderOnboardingText = (type: string) => {
        if (type === 'in_progress') return t('leftMenuCard.self_onboarding_in_progress')
        if (type === 'filled') return t('leftMenuCard.information_ready_for_review');
        if (type === 'i9_to_sign') return t('leftMenuCard.section_i_9_pending');
    };

    return <LightWrapper onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <div className='user-info' style={bottomBorder ? { borderBottom: '1px solid #F2F2F4', paddingBottom: 10 } : {}}>
            <DirectoryImage style={{ width: imageSize, height: imageSize, marginTop: 'auto', marginBottom: 'auto' }} onClick={() => disabled ? null : handleEmployeeRedirect()}>
                {<EmployeeImage
                    initials={employeeInitials(employee.first_name + ' ' + employee.last_name)}
                    uuid={employee.uuid}
                    fontSize={imageFontSize || (imageSize / 2.7)}
                />}
            </DirectoryImage>
            <TextWrapper style={{ fontSize: fontSize }}>
                {disabled ? <span className='name' >
                    {fullName && <p>{employee.first_name} {!!employee.preferred_name && `(${employee.preferred_name})`} {employee.middle_name} {employee.last_name} {employee.termination_date && <span>{t('leftMenuCard.leaving_on')} {employee.termination_date}</span>}</p>}
                    {isOverflownName ?
                        <Tooltip title={`${employee.first_name} ${employee.last_name}`} arrow placement='top'>
                            <div>{!fullName &&
                                <p style={{ fontFamily: 'Aspira Wide Demi, FiraGO Medium' }} ref={cardRef}>{employee.first_name} {employee.last_name}</p>}
                                {employee.onboarding && <OnboardingLabel type={employee.onboarding}>
                                    {renderOnboardingText(employee.onboarding)}
                                </OnboardingLabel>}
                            </div>
                        </Tooltip>
                        : !fullName &&
                        <Fragment>
                            <p style={{ fontFamily: 'Aspira Wide Demi, FiraGO Medium' }} ref={cardRef}>{employee.first_name} {employee.last_name} {employee.termination_date &&
                                <span>{t('leftMenuCard.leaving_on')} {employee.termination_date}</span>}
                            </p>
                            {employee.onboarding && <OnboardingLabel type={employee.onboarding}>
                                {renderOnboardingText(employee.onboarding)}
                            </OnboardingLabel>}
                        </Fragment>
                    }
                </span> :
                    <Link target={'_blank'} rel="noreferrer" to={`/employee/${employee.id}`} className='name' >
                        {fullName && <p>{employee.first_name} {!!employee.preferred_name && `(${employee.preferred_name})`} {employee.middle_name} {employee.last_name} {employee.termination_date && <span>{t('leftMenuCard.leaving_on')} {employee.termination_date}</span>}</p>}
                        {isOverflownName ?
                            <Tooltip title={`${employee.first_name} ${employee.last_name}`} arrow placement='top'>
                                <div>{!fullName &&
                                    <p style={{ fontFamily: 'Aspira Wide Demi, FiraGO Medium' }} ref={cardRef}>{employee.first_name} {employee.last_name}</p>}
                                    {employee.onboarding && <OnboardingLabel type={employee.onboarding}>
                                        {renderOnboardingText(employee.onboarding)}
                                    </OnboardingLabel>}
                                </div>
                            </Tooltip>
                            : !fullName &&
                            <Fragment>
                                <p style={{ fontFamily: 'Aspira Wide Demi, FiraGO Medium' }} ref={cardRef}>
                                    {employee.first_name} {employee.last_name} {employee.termination_date &&
                                        <span>{t('leftMenuCard.leaving_on')} {employee.termination_date}</span>}
                                </p>
                                {employee.onboarding && <OnboardingLabel type={employee.onboarding}>
                                    {renderOnboardingText(employee.onboarding)}
                                </OnboardingLabel>}
                            </Fragment>

                        }
                    </Link>}
                    <div style={additionalInfoStyle}>
                        {employee?.job_title_name && <p>{employee?.job_title_name}</p>}
                        <p>
                        {generateTypes({
                            department_name: employee?.department_name,
                            division_name: employee?.division_name,
                            location_name: employee?.location_name,
                        })}
                        </p>
                        {employee.additional_info && <>{<p>{employee.additional_info}</p>}</>}
                        {additionalInfo && <div>{additionalInfo}</div>}
                    </div>
            </TextWrapper>
        </div>
    </LightWrapper>
};

export default EmployeeCard;

const LightWrapper = styled.div`
  overflow: hidden;
 .user-info{
  display: flex;
  .name{
    color: var(--green);
    margin-bottom: 4px;
    font-weight: 500;

    span{
      color: var(--red);
      font-size: 9px;
      background: #F5D6D6;
      padding: 4px 10px;
      border-radius: 20px;
      margin-left: 6px;
      transform: translateY(-2px);
      text-transform: capitalize;
    }
  }
}
`;

const DirectoryImage = styled.div`
    border-radius: 50%;
    margin-right: 10px;
    cursor: pointer;
`;

const TextWrapper = styled.div`
    margin-top: auto;
    margin-bottom: auto;
    font-size: 10px;
    width: auto;
    color: #414141;
    overflow: hidden;
    p {
        line-height: normal;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }
`;

const OnboardingLabel = styled.p<{ type?: string }>`
    height: 21px;
    padding: 3px 8px;
    border-radius: 10px;
    border-width: 1px;
    border-style: solid;
    border-color: ${({ type }) => type === 'i9_to_sign' || type === 'filled' ? '#FFF0E2' : '#FCF6D7'};
    background-color: ${({ type }) => type === 'i9_to_sign' || type === 'filled' ? '#FFF7EF' : '#FFFAE0'};
    color: ${({ type }) => type === 'i9_to_sign' || type === 'filled' ? '#D98128' : '#AF9C0A'};
    font-size: 8px;
`;
