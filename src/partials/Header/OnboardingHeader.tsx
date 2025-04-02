import { Link, useHistory } from 'react-router-dom';
import styled from "styled-components";
import { LogoutService } from "services";
import { deleteToken, getRefreshToken } from 'utils/storage';
import CompanyActions from "./CompanyActions";
import { useTranslation } from "react-i18next";
import { ReactComponent as ProfestoLogo } from 'assets/svg/profesto_logo.svg';
import { ReactComponent as LogOutIcon } from 'assets/svg/logout.svg';
import ChangeLanguage from "components/ChangeLanguage";

const OnboardingHeader = () => {
    const history = useHistory();
    const { t } = useTranslation();
    const handleLogout = async () => {
        const token = getRefreshToken();
        await LogoutService(token);
        deleteToken();
        history.push('/login');
    };

    return (
        <Container>
            <div className='left-side'>
                <Link to='/'>
                    <ProfestoLogo />
                </Link>
            </div>
            <div className='right-side'>
                <CompanyActions />
                <ChangeLanguage onBoarding/>
                <Logout onClick={handleLogout}><LogOutIcon/></Logout>
            </div>
        </Container>
    );
};

export default OnboardingHeader;

const Container = styled.div`
  padding: 10px 60px;
  height: 62px;
  background: var(--header-dark);
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  z-index: 9;
  flex-shrink: 0;

  .left-side{
    line-height: 1;
    display: flex;
    align-items: center;
  }

  .right-side{
    display: flex;
    align-items: center;
  }
`;

const Logout = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
    width: 40px;
    background-color: #243844;
    border-radius: 50%;
    color: #FFF;
    cursor: pointer;
`;