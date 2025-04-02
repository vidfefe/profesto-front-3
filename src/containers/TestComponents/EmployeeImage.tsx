import styled from 'styled-components';
import EmployeeImage from "components/Employee/Image";
import { currentUserSelector } from "../../redux/selectors";
import React from "react";
import {useSelector} from "react-redux";
import {employeeInitials} from "../../utils/common";

const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
`;

const ProfileImage = styled.div`
    width: 92px;
    height: 92px;
    border-radius: 50%;
    margin-right: 10px;
`;

const DirectoryImage = styled.div`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin-right: 10px;
`;

const SubordinatesImage = styled.div`
    width: 58px;
    height: 58px;
    border-radius: 50%;
    margin-right: 10px;
`;

const ManagerImage = styled.div`
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin-right: 10px;
`;

export const EmployeeImageTest = () => {
    const currentUser = useSelector(currentUserSelector)

    return (
        <Wrapper>
            Profile
            <ProfileImage>
                {<EmployeeImage
                    initials={employeeInitials(currentUser?.employee?.first_name + ' ' + currentUser?.employee?.last_name )}
                    uuid={currentUser?.employee.uuid}
                    fontSize={24}
                />}
            </ProfileImage>

            <ProfileImage>
                {<EmployeeImage
                    initials={employeeInitials(currentUser?.employee?.first_name + ' ' + currentUser?.employee?.last_name )}
                    fontSize={24}
                />}
            </ProfileImage>

            Directory
            <DirectoryImage>
                {<EmployeeImage
                    initials={employeeInitials(currentUser?.employee?.first_name + ' ' + currentUser?.employee?.last_name )}
                    uuid={currentUser?.employee.uuid}
                    fontSize={20}
                />}
            </DirectoryImage>

            <DirectoryImage>
                {<EmployeeImage
                    initials={employeeInitials(currentUser?.employee?.first_name + ' ' + currentUser?.employee?.last_name )}
                    fontSize={20}
                />}
            </DirectoryImage>

            Subordinates
            <SubordinatesImage>
                {<EmployeeImage
                    initials={employeeInitials(currentUser?.employee?.first_name + ' ' + currentUser?.employee?.last_name )}
                    uuid={currentUser?.employee.uuid}
                    fontSize={16}
                />}
            </SubordinatesImage>

            <SubordinatesImage>
                {<EmployeeImage
                    initials={employeeInitials(currentUser?.employee?.first_name + ' ' + currentUser?.employee?.last_name )}
                    fontSize={16}
                />}
            </SubordinatesImage>

            Manager
            <ManagerImage>
                {<EmployeeImage
                    initials={employeeInitials(currentUser?.employee?.first_name + ' ' + currentUser?.employee?.last_name )}
                    uuid={currentUser?.employee.uuid}
                    fontSize={11}
                />}
            </ManagerImage>

            <ManagerImage>
                {<EmployeeImage
                    initials={employeeInitials(currentUser?.employee?.first_name + ' ' + currentUser?.employee?.last_name )}
                    fontSize={11}
                />}
            </ManagerImage>
        </Wrapper>
    )
}

