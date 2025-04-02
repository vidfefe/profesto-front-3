import styled from "styled-components";
import Address from "./address";
import ContactInformation from "./contact";
import PersonalInformation from "./personal";
import EducationInformation from './education';
import VisaInformation from './visa';
import PassportInformation from './passport'
import DriversLicenseformation from "./driverslicense";
import AdditionalInformation from "./additionalinfo";
import { region } from "lib/Regionalize";
const Wrapper = styled.div`
    font-size: 11px;
`;

const Personal = ({ person, refreshEmployeeInfo, disabled, view }: any) => {

    return (
        <Wrapper>
            <div className='row'>
                <div className='col-md-6' style={{ paddingRight: '7.5px' }}>
                    <PersonalInformation person={person} refreshEmployeeInfo={refreshEmployeeInfo} disabled={disabled} view={view} />
                </div>
                <div className='col-md-6' style={{ paddingLeft: '7.5px' }}>
                    <Address person={person} disabled={disabled} view={view} />
                </div>
                <div className='col-md-12'>
                    <ContactInformation person={person} refreshEmployeeInfo={refreshEmployeeInfo} disabled={disabled} view={view} />
                </div>
                <div className='col-md-12'>
                    <EducationInformation person={person} disabled={disabled} view={view} />
                </div>
                {region(['eng']) ? <div className='col-md-12'>
                    <VisaInformation person={person} disabled={disabled} view={view} />
                </div> : null}
                <div className='col-md-12'>
                    <PassportInformation person={person} disabled={disabled} view={view} />
                </div>
                <div className='col-md-12'>
                    <DriversLicenseformation person={person} disabled={disabled} view={view} />
                </div>
                <div className='col-md-12'>
                    <AdditionalInformation person={person} disabled={disabled} view={view} />
                </div>
            </div>
        </Wrapper>
    );
};

export default Personal;
