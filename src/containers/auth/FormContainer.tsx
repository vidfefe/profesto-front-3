import { PropsWithChildren } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import styled from "styled-components";
import { ColorfulLine } from "components/DesignUIComponents";

import { ReactComponent as LoginArt } from 'assets/svg/people_login-art.svg';
import { ReactComponent as GearsIcon } from 'assets/svg/gears_login-art.svg';

const svgStringLoginArt = encodeURIComponent(renderToStaticMarkup(<LoginArt />));
const svgStringGears = encodeURIComponent(renderToStaticMarkup(<GearsIcon />));

function FormContainerTemplate({ children }: PropsWithChildren<{}>) {
  return (
    <Container>
      <FormContainer>
        <ColorfulLine />
        <div>
          {children}
        </div>
      </FormContainer>
    </Container>
  )
};

export default FormContainerTemplate;

const Container = styled('div')(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: `url('data:image/svg+xml;utf8, ${svgStringLoginArt}') 23% 78% no-repeat, 
  url('data:image/svg+xml;utf8, ${svgStringGears}') 72% 94% no-repeat`,
  height: "100%",
  [theme.breakpoints.down('lg')]: {
    background: 'none',
  },
}));

const FormContainer = styled('div')(({ theme }) => ({
  maxWidth: 600,
  minHeight: "calc(100vh - 270px)",
  flex: 1,
  boxShadow: "0px 3px 6px #00000029",
  backgroundColor: "#FFF",
  [theme.breakpoints.down('sm')]: {
    height: '100%',
    boxShadow: "none",
  },
  "& > div": {
    padding: "80px 50px",
    [theme.breakpoints.down('sm')]: {
      padding: "60px 16px",
      "& #profesto_logo": {
        width: 160,
        height: 32
      }
    },
  }
}));