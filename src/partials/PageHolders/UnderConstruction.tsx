import styled from "styled-components";

const UnderConstruction = () => {
    return (
        <PageContainer>
            <span>This Page is Under Construction</span>
        </PageContainer>
    )
};

export default UnderConstruction;

const PageContainer = styled.div`
    display: flex;
    flex: 1;
    justify-content: center;
    align-items: center;
`;