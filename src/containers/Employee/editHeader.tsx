import { Link } from "react-router-dom";
import styled from "styled-components";
import EmployeeImage from "components/Employee/Image";
import { employeeInitials, generateTypes } from "utils/common";
import { usePermissionGate } from "permissions/usePermissionGate";
const Wrapper = styled.div`
    background: #F3F3F3;
    padding: 16px 24px;
    display: flex;
    justify-content: space-between;
    width: 100%;
    min-height: 92px;
    align-items: stretch;
    p {
      line-height: 18px;
      font-size: 12px;
      color: #00101A;
    }
    
    .name {
      color: var(--green);
      font-weight: 900;
      font-size: 13px;
      font-family: 'Aspira Demi', 'FiraGO Regular';
    }
`;

const Employee = styled.div`
   display: flex;
   flex-direction: row;
   align-items: center;
`;

interface IEmployeeInfoHeader {
  employeeName: string,
  avatarUuid?: string,
  employeeId?: number,
  withoutLink?: boolean,
  jobData?: any,
  rightSide?: any
};

const EmpEditHeader = ({ employeeName, avatarUuid, employeeId, withoutLink, jobData, rightSide }: IEmployeeInfoHeader) => {
  const { role } = usePermissionGate();

  return (
    <Wrapper>
      <Employee>
        <div style={{ width: 58, height: 58, marginRight: 20 }}>
          {<EmployeeImage
            initials={employeeInitials(employeeName)}
            uuid={avatarUuid}
            fontSize={18}
          />}
        </div>
        <div>
          {!['employee', 'manager'].includes(role) && !withoutLink ? <Link tabIndex={-1} className='name' to={`/employee/${employeeId}`}>
            {employeeName}
          </Link> :
            <p tabIndex={-1} className='name'>
              {employeeName}
            </p>
          }
          {jobData?.job_title?.name && <p>{jobData?.job_title?.name}</p>}
          <p>{generateTypes({department_name: jobData?.department?.name, division_name: jobData?.division?.name, location_name: jobData?.location?.name})}</p>
        </div>
      </Employee>
      
      {rightSide}
    </Wrapper>
  );
};

export default EmpEditHeader;
