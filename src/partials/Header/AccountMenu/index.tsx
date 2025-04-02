import { useState, useEffect, Fragment, MouseEvent } from "react";
import { Link, useHistory, useLocation } from 'react-router-dom';
import styled from "styled-components";
import queryString from 'query-string';
import { useSelector } from "react-redux";
import { currentUserSelector } from "redux/selectors";
import { getRefreshToken, deleteToken } from "utils/storage";
import { LogoutService, getActiveJobDetails } from "services";
import EmployeeImage from "components/Employee/Image";
import { employeeInitials } from "utils/common";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from "@mui/material/Divider";
import ChangePassword from "./ChangePassword";
import ChangeSignInEmail from "./ChangSingInEmail";
import AvatarUpload from "components/AvatarUpload";
import ChangeLanguage from "components/ChangeLanguage";
import { ReactComponent as PersonIcon } from 'assets/svg/person_circle-big.svg';
import { ReactComponent as PadlockIcon } from 'assets/svg/padlock_circle.svg';
import { ReactComponent as SignOutIcon } from 'assets/svg/door-exit_circle.svg';
import { ReactComponent as EnvelopeIcon } from 'assets/svg/envelope_circle.svg';
import { ReactComponent as PenIcon } from 'assets/svg/pen-circle.svg';
import { useTranslation } from "react-i18next";

export default function AccountMenu() {
    const { t } = useTranslation();
    const history = useHistory();
    const { search } = useLocation();
    const queryParams = queryString.parse(search);
    const currentUser = useSelector(currentUserSelector);
    const [employeeInfo, setEmployeeInfo] = useState(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [isChangePassModalOpen, setChangePassModalOpen] = useState<boolean>(false);
    const [isChangeEmailModalOpen, setChangeEmailModalOpen] = useState<boolean>(false);
    const [isAvatarModalOpen, setAvatarModalOpen] = useState<boolean>(false);
    const employeeName = `${currentUser?.employee?.first_name} ${currentUser?.employee?.last_name}`;

    useEffect(() => {
        if (isChangePassModalOpen || isChangeEmailModalOpen || queryParams.action === 'change_email') {
            getActiveJobDetails(currentUser.employee?.id).then(res => setEmployeeInfo(res.data));
        }
    }, [currentUser.employee?.id, open, queryParams.action]);

    const handleClick = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        const token = getRefreshToken();
        await LogoutService(token);
        deleteToken();
        window.location.href = '/login';
    };

    return (
        <Fragment>
            <AvatarContainer style={{ border: 'none' }} onClick={handleClick}>
                <EmployeeImage
                    initials={employeeInitials(employeeName)}
                    uuid={currentUser?.employee?.uuid}
                    fontSize={14}
                />
            </AvatarContainer>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: -14, }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Fragment>
                <MenuContentContainer>
                    <UserInfoContainer>
                        <AvatarContainer style={{ width: 75, height: 75 }}>
                            <EmployeeImage
                                initials={employeeInitials(employeeName)}
                                uuid={currentUser.employee?.uuid}
                                fontSize={20}
                            />
                            <StyledPenIcon onClick={() => setAvatarModalOpen(true)} />
                        </AvatarContainer>
                        <InfoContainer>
                            <p>{employeeName}</p>
                            <p>{t('headers.authorized.accountMenu.sign_in_email')} <span>{currentUser?.email}</span></p>
                        </InfoContainer>
                    </UserInfoContainer>
                    <Divider light variant="middle" />
                    <MenuItemsContainer>
                        <Link to='/myinfo'>
                            <StyledMenuItem>
                                <PersonIcon width={30} height={30} />
                                <p>{t('headers.authorized.accountMenu.my_info')}</p>
                            </StyledMenuItem>
                        </Link>
                        <StyledMenuItem onClick={() => { setChangeEmailModalOpen(true); history.push('?action=change_email') }}>
                            <EnvelopeIcon width={30} height={30} />
                            <p>{t('headers.authorized.accountMenu.change_sign_email')}</p>
                        </StyledMenuItem>
                        <StyledMenuItem onClick={() => setChangePassModalOpen(true)}>
                            <PadlockIcon width={30} height={30} />
                            <p>{t('headers.authorized.accountMenu.change_password')}</p>
                        </StyledMenuItem>
                        <StyledMenuItem onClick={handleLogout}>
                            <SignOutIcon width={30} height={30} />
                            <p>{t('headers.authorized.accountMenu.log_out')}</p>
                        </StyledMenuItem>
                    </MenuItemsContainer>
                </MenuContentContainer>
                <ChangeLanguage withoutDropDown={true}/>
                </Fragment>
            </Menu>
            <ChangePassword
                isOpen={isChangePassModalOpen}
                closeModal={() => setChangePassModalOpen(false)}
                employeeName={employeeName}
                employeePic={currentUser.employee?.uuid}
                employeeInfo={employeeInfo}
            />
            <ChangeSignInEmail
                isOpen={queryParams.action === 'change_email' ? true : isChangeEmailModalOpen}
                closeModal={() => { setChangeEmailModalOpen(false); history.goBack() }}
                employeeName={employeeName}
                employeePic={currentUser.employee?.uuid}
                employeeInfo={employeeInfo}
            />
            <AvatarUpload
                open={isAvatarModalOpen}
                autonomous
                employeeId={currentUser.employee.id}
                onClose={() => setAvatarModalOpen(false)}
            />
        </Fragment>
    )
};

const AvatarContainer = styled.div`
  width: 36px;
  height: 36px;
  cursor: pointer;
  border: 1px solid #E6E6E6;
  border-radius: 50%;
  box-sizing: content-box;
  padding: 0px;
`;

const MenuContentContainer = styled.div``;

const UserInfoContainer = styled.div`
    display: flex;
    align-items: center;
    flex-direction: row;
    padding: 20px;
`;

const MenuItemsContainer = styled.div`
    padding: 15px 0 10px;
`;

const InfoContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin-left: 20px;
    & > p:first-child {
        font-size: 13px;
        color: #414141;
        font-family: 'Aspira Wide Demi', 'FiraGO Medium';
        margin-bottom: 9px;
    }
    & > p:last-child {
        font-size: 11px;
        color: #80888D;
    }
    & span {
        text-decoration: underline;
    }
`;

const StyledMenuItem = styled(MenuItem)`
    padding: 0 18px; 
    & > p {
        font-size: 12px;
        margin-left: 15px;
    }
    &:hover {
        circle {
            fill: #cde6da;
        }
        path {
            fill: #396;
        }
    }
`;

const StyledPenIcon = styled(PenIcon)`
    width: 23px;
    height: 23px;
    position: relative;
    bottom: 24px;
    left: 60px;
    & circle {
        fill: #E2E2E2;
    }
    &:hover {
        circle {
            fill: #CDE6DA;
        }
        path {
            fill: #396;
        }
    }
`;
