import styled from "styled-components";
import { ReactComponent as NoPermissionArt } from 'assets/svg/no-permission_art.svg';

const NoPermission = () => {
    return (
        <PageContainer>
            <NoPermissionArt />
            <span>You don’t have permission to access this page</span>
        </PageContainer>
    )
};

export default NoPermission;

const PageContainer = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    & > span {
        margin-top: 50px;
        font-size: 18px;
        font-family: 'Aspira Wide Demi', 'FiraGO Medium';
        color: #676767;
    }
`;