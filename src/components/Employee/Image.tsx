import React from "react";
import styled from 'styled-components';
import { useSelector } from "react-redux";
import { domainSelector } from "../../redux/selectors";

interface ImgProps {
    initials: string
    uuid?: string
    size?: string
    fontSize?: number,
    photoPreview?: any
};

const Wrapper = styled.div`
    object-fit: cover;
    height: 100%;
    aspect-ratio: 1/1;
    font-size: inherit;
    img {
        border-radius: 50%;
        max-width: 100%;
        display: block;
    }
`;

const NoPhoto = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: #fff;
    background: #5B5BB9;
    border-radius: 50%;
    text-transform: none;
    font-weight: 500;
    font-feature-settings: "case";
    text-transform: uppercase;
`;

const EmployeeImage = React.forwardRef(({ initials, uuid, size = 'small', fontSize = 12, photoPreview }: ImgProps, ref: any) => {
    const domain = useSelector(domainSelector);
    if (!uuid && !photoPreview) {
        return <Wrapper>
            <NoPhoto style={{ fontSize: fontSize }}> {initials} </NoPhoto>
        </Wrapper>
    } else {
        return <Wrapper>
            <img
                ref={ref}
                src={uuid ? `${process.env.REACT_APP_BASE_API_URL}employee_photo/${domain || 'test'}/${uuid}?version=${size}` : photoPreview.preview}
                alt='profile'
            />
        </Wrapper>
    }
});

export default EmployeeImage;
