import styled from "styled-components";
import JobInfo from "./jobinfo";
import EmploymentDetails from "./employmentdetails";
import Compensation from "./compensation";
import AdditionalInformation from "./AdditionalInformation";
import { region } from "lib/Regionalize";
import { currentUserSelector } from "redux/selectors";
import { useSelector } from "react-redux";
const Wrapper = styled.div`
    font-size: 11px;
`;

const Job = ({ person, refreshEmployeeInfo, disabled, view }: any) => {
    const currentUser = useSelector(currentUserSelector);

    return (
        <Wrapper>
            <div className='row'>
                <div className='col-md-6' style={{ paddingRight: '7.5px' }}>
                    <JobInfo person={person} refreshEmployeeInfo={refreshEmployeeInfo} disabled={disabled} view={view} />
                </div>
                <div className='col-md-6' style={{ paddingLeft: '7.5px' }}>
                    <EmploymentDetails person={person} refreshEmployeeInfo={refreshEmployeeInfo} disabled={disabled} />
                </div>
                <div className='col-md-12'>
                {!(person.id !== currentUser.employee.id && currentUser.permissions.role === 'manager') &&
                 <Compensation person={person} disabled={disabled} /> }
                </div>
                {region(['geo']) && <div className='col-md-12'>
                    <AdditionalInformation person={person} disabled={disabled} />
                </div>}
            </div>
        </Wrapper>
    );
};

export default Job;
