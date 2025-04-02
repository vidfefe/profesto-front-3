import styled from "@mui/system/styled";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ReactComponent as ProfestoLogo } from 'assets/svg/profesto_logo.svg';

const UnauthorizedHeader = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'partials.unauthorizedHeader' });

  return (
    <HeaderContainer>
      <Link to='/'><ProfestoLogo /> </Link>

      <HeaderRightSide>
        <p>{t('have_a_account')} <Link to='/login'>{t('sign_in')}</Link></p>
      </HeaderRightSide>
    </HeaderContainer>
  );
};

export default UnauthorizedHeader;

const HeaderContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  backgroundColor: '#FFF',
  padding: '20px 60px',
  alignItems: 'center',
  justifyContent: 'space-between',
  [theme.breakpoints.down("md")]: {
    padding: 20,
  },
  [theme.breakpoints.down("sm")]: {
    padding: '20px 16px',
  },
}));

const HeaderRightSide = styled('div')(({ theme }) => ({
  fontSize: 12,
  '& > p': {
    color: '#676767',
    '& > a': {
      fontFamily: 'Aspira Demi',
      color: '#339966',
    }
  },
  [theme.breakpoints.down("sm")]: {
    fontSize: 10,
  },
}));