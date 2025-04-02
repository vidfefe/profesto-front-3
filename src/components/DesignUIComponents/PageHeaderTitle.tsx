import styled from 'styled-components';

interface IPageHeaderTitle {
    title: string,
    rightSide?: JSX.Element | null | string
};

export const PageHeaderTitle = ({ title, rightSide = null }: IPageHeaderTitle) => {
    return (
        <HeaderContainer>
            <LeftHeaderSide><div /><Title dangerouslySetInnerHTML={{ __html: title }} /></LeftHeaderSide>
            {rightSide}
        </HeaderContainer>
    )
};

const HeaderContainer = styled('div')(({ theme }) => ({
    background: "#F2F2F4",
    height: 70,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 60px",
    [theme.breakpoints.down('md')]: {
        padding: "10px 20px",
    },
    [theme.breakpoints.down('sm')]: {
        padding: "10px 16px",
        height: 50
    },
}));

const LeftHeaderSide = styled.div`
    display: flex;
    align-items: center;
    color: #00101A;
    font-size: 16px;
    font-family: 'Aspira Regular', 'FiraGO Medium';
    & > div {
        height: 25px;
        width: 3px;
        background-color: var(--green);
        margin-right: 15px;
        border-radius: 3px;
    }
`;

const Title = styled.p`
  font-family: 'Aspira Wide Demi', 'FiraGO Medium';
  font-size: 16px;
  color: #00101A;
  & > span {
    font-size: 14px;
    color: #00101A;
    opacity: 0.5;
  }
`;
