import { useEffect, useState } from "react";
import styled from "styled-components";
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { useDispatch } from "react-redux";
import useQuery from "hooks/useQueryCustom";
import { isEmpty } from "lodash";
import { getToken, saveStorageObject } from "utils/storage";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import NoPermission from './NoPermission';
import { getCurrentUser, switchCompany } from "services";
import { setCurrentUser } from "redux/authSlice";

const RedirectPage = () => {
    const [isNoPermission, setIsNoPermission] = useState<boolean>(false);
    const location = useLocation();
    const history = useHistory();
    const dispatch = useDispatch();
    const token = getToken();
    let params = queryString.parse(location.search);

    const { refetch: getPortalLink } = useQuery<any>(["portal_url"], {
        endpoint: `billing/portal_link?company=${params.c}&to=${params.to}`,
        options: { method: "get" },
    }, {
        onSuccess: (data) => window.open(data.url, "_self"),
        onError: (err: any) => {
            if (err.request.status === 403) setIsNoPermission(true);
            else history.replace('/');
        },
        enabled: false
    });

    useEffect(() => {
        if (isEmpty(params)) {
            history.replace('/');
        };
        if (params.c && params.to && params.to === 'update_plan' && token) {
            getPortalLink();
        };
        if (params.c && params.to && params.to !== 'update_plan' && token) {
            switchCompany(+params.c).then((res: { data: { company: string, refresh_token: string, token: string } }) => {
                saveStorageObject('token', res.data.token);
                saveStorageObject('refresh_token', res.data.refresh_token);
                getCurrentUser().then(res => {
                    dispatch(setCurrentUser(res.data));
                    if (['employee', 'manager'].includes(res.data.permissions.role) && params.to !== 'myinfo') setIsNoPermission(true);
                    else history.replace(`/${params.to}`);
                })
            });
        };
        if (params.c && params.to && !token) {
            history.replace(`/login/link?c=${params.c}&to=${params.to}`);
        };
        if (params.c === undefined || params.to === undefined) {
            history.replace('/');
        };
    }, []);

    return (
        <PageContainer>
            {isNoPermission ? <NoPermission /> : <Backdrop sx={{ color: '#fff' }} open={true}>
                <CircularProgress color="inherit" />
            </Backdrop>}
        </PageContainer>
    )
};

export default RedirectPage;

const PageContainer = styled.div`
    display: flex;
    height: 100%;
    justify-content: center;
    align-items: center;
`;