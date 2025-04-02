import { Link } from "react-router-dom";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
const Wrapper = styled.div`
  padding: 4rem 2rem;
`;

const Home = () => {
  const { t } = useTranslation();
  return (
    <Wrapper>
          <Link to='/signup'>{t('home.signup')}</Link> <br/>
          <Link to='/login'>{t('home.login')}</Link><br/>
          <Link to='/recover'>{t('home.recover')}</Link><br/>
          <Link to='/locked'>{t('home.unlock')}</Link><br/>
          <Link to='/reset'>{t('home.reset')}</Link>
    </Wrapper>
  );
};

export default Home;
