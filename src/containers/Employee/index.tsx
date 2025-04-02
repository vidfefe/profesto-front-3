import { useEffect, useState } from "react";
import styled from "styled-components";

import LeftCard from './LeftCard';
import RightCard from "./RightCard";

import { getEmployee, getCurrentUser } from "services";
import { useDispatch, useSelector } from "react-redux";
import { currentUserSelector } from "redux/selectors";
import CircularProgress from '@mui/material/CircularProgress';
import { setCurrentUser } from "redux/authSlice";
import { useHistory } from "react-router-dom";


const Wrapper = styled.div`
  padding: 20px 2rem 2rem;
  display: flex;
  flex-wrap: wrap;
  background-color: #F2F2F4;
`;

type EmployeeParams = {
  id?: string | undefined;
}

const Employee = (props: any) => {
  const [person, setPerson] = useState<any>(null);
  const dispatch = useDispatch();
  const currentUser = useSelector(currentUserSelector)

  const history = useHistory();

  useEffect(() => {
    const checkAndFetchEmployee = async () => {
      try {
        const employeeId = props.match.params.id ?? currentUser?.employee.id;
        const res = await getEmployee(employeeId);
        setPerson(res.data);
  
      } catch (error) {
        return history.push('/');
      }
    };
  
    checkAndFetchEmployee();
  }, [props.match.params.id, currentUser?.employee.id]);

  const getEmployeeInfo = () => {
    getEmployee(props.match.params.id ?? currentUser?.employee.id).then(res => setPerson(res.data)).catch((err) => console.log(err.response))
    if (currentUser?.employee.id && !props.match.params.id && localStorage.getItem('token')) {
      getCurrentUser().then(res => {
        dispatch(setCurrentUser(res.data));
      })
    }
  };

  let isDisabled = person?.onboarding?.onboarding_status?.id === 'in_progress';
  const isManager = currentUser?.permissions.role === 'manager' && currentUser?.employee.id !== person?.id;

  if (!person) {
    return (
      <Wrapper style={{ justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Wrapper>
    );
  };

  return (
    <Wrapper>
      <LeftCard person={person} refreshEmployeeInfo={getEmployeeInfo} disabled={isDisabled || isManager} />
      <RightCard person={person} refreshEmployeeInfo={getEmployeeInfo} disabled={isDisabled || isManager} view={isManager} />
    </Wrapper>
  );
};

export default Employee;
