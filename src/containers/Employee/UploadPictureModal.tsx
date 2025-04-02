import { useState, useCallback, useRef, Fragment } from "react";
import styled from "styled-components";
import Dropzone from 'react-dropzone';
import { useToasts } from "react-toast-notifications";
import { deleteProfilePhoto, uploadProfilePhoto } from 'services';
import { employeeInitials } from "utils/common";
import EmployeeImage from "components/Employee/Image";
import Dialog from 'components/Modal/Dialog';

import { ReactComponent as TrashCanCircles } from 'assets/svg/trash-can_circles.svg';
import { ReactComponent as TrashCan } from 'assets/svg/trash-can.svg';
import { ReactComponent as CameraIcon } from 'assets/svg/camera.svg';
import { ReactComponent as DefaultAvatar } from 'assets/svg/avatar_default.svg';
import { useTranslation } from "react-i18next";
const Wrapper = styled.div`
padding: 20px 30px;
.thumbs{
    display: flex;
    justify-content: space-between;
    width: 500px;
    .loader-img-wrapper{
        margin-right: 0;
        overflow: hidden;
        border-radius: 50%;
        height: 203px;

        img{
            border-radius: 0;
        }
    }

    .preview{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;

        img{
            max-height: 100%;
        }

        .preview-right{
            border: none;
            height: 100%;
            padding-top: 11px;
            padding-bottom: 26px;
            
            img{
                max-height: 100%;
            }

            .thumbInner{
                border: none;
                height: 100%;
            }
        }

    }
}

.thumbsContainer {
    justify-content: center;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin-bottom: 16px;
    border: 1px dashed #D6D6D6;
    padding: 10px 10px;
    width:  282px;
    height: 282px;
    }

.thumb{
    display: inline-flex;
    box-sizing: border-box;
    padding: 28px;
    
    .thumbInner{
        display: flex;
        overflow: hidden;
        width: 203px;
        height: 203px;
        align-items: center;
        justify-content: center;
        border-radius: 50%;

        img{
            object-fit: cover;
            height: 203px;
            width: 203px;
        }
    }
}

.actions{
    display: flex;
    justify-content: center;
    
    .choose{
        font: normal normal 500 10px/14px 'Aspira Regular';
        padding-top: 6px;
        padding-bottom: 8px;
        padding-left: 15px;
        padding-right: 21px;
        border-radius: 4px;
        margin-right: 10px;
        cursor: pointer;
        color: #FF9933;
        text-decoration: underline;
        display: flex;
        align-items: center;
        background-color: #F2F2F4;

        :hover{
            background: #E4E4E4;
        }
        
        svg{
            margin-right: 6px;
        }

        span{
            padding-top: 4px;
            line-height: 17px;
        }
    }
}
`;

const UploadWrapper = styled.div`
    text-align: center;
    color: #8E8E8E;
    opacity: 0.67;
    line-height: 1.2;
    margin-top: 10px;
`;

const DeleteContent = ({ closeModal, isOpen, handleDelete }: any) => {
    const { t } = useTranslation();
    return (
        <Dialog
            open={isOpen}
            onClose={() => closeModal()}
            title={t('uploadPicture.delete_photo_text')}
            withButtons
            cancelButtonText={t('globaly.cancel')}
            actionButtonText={t('uploadPicture.delete_photo')}
            actionButton={() => handleDelete()}
            fullWidth
        >
            <DeleteModalContainer>
                <div>
                    <TrashCanCircles />
                    <p>{t('uploadPicture.delete_this_photo')}</p>
                </div>
            </DeleteModalContainer>
        </Dialog>
    )
};

const UploadPictureModal = (props: any) => {
    const { t } = useTranslation();
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [previewFile, setPreviewFile] = useState<any>();
    const [file, setFile] = useState<any>(null);
    const [deleteModal, setDeleteModal] = useState<boolean>(false);
    const dropzoneRef = useRef(null);
    const { addToast } = useToasts();

    const handleDrop = useCallback(acceptedFiles => {
        if (acceptedFiles[0] === undefined || !['image/png', 'image/jpeg', 'image/jpg'].includes(acceptedFiles[0].type)) {
            addToast(<div>
                <p style={{ fontWeight: "bold", marginBottom: 5 }}>{t('uploadPicture.error_uploading_file')}</p>
                <p>{t('uploadPicture.allowed_file_extensions', {ext: 'jpg. jpeg. png.'})}</p>
            </div>, { appearance: 'error', autoDismiss: true });
            return
        };
        setFile(acceptedFiles[0]);
        setPreviewFile(acceptedFiles.map((file: any) => Object.assign(file, {
            preview: URL.createObjectURL(file)
        })));
    }, []);

    const thumbs = () => {
        if (!previewFile && props.prevPhoto) {
            return <div className='thumb' >
                <div className='thumbInner'>
                    {props.prevPhoto instanceof File ? <img src={props.prevPhoto.preview} alt='avatar' /> :
                        <EmployeeImage
                            initials={employeeInitials(props.person.first_name + ' ' + props.person.last_name)}
                            uuid={props.person.uuid}
                        />}
                </div>
            </div>
        } else if (previewFile) {
            return <div className='thumb'>
                <div className='thumbInner'>
                    <img src={previewFile[0] && previewFile[0].preview} alt='avatar' />
                </div>
            </div>
        } else {
            return <div className='thumb' style={{ flexDirection: "column", padding: 0 }}>
                <div>
                    <DefaultAvatar style={{ marginTop: 10 }} />
                    <UploadWrapper dangerouslySetInnerHTML={{ __html: t('uploadPicture.drop_file_here')}}/>
                </div>
            </div>
        }
    };

    const renderDeleteButton = () => {
        if (props.prevPhoto || previewFile) {
            return <TrashCanContainer onClick={() => setDeleteModal(true)}>
                <TrashCan />
            </TrashCanContainer>
        }
    };

    const handleSubmit = () => {
        setIsUploading(true);
        let formData: any = new FormData();
        formData.append('employee_id', props.person.id);
        formData.append("photo", file);
        if (props.prevPhoto) {
            uploadProfilePhoto(formData, true).then(res => {
                setIsUploading(false);
                props.finishUpload();
            }).catch(err => {
                setIsUploading(false);
                if (err?.response?.data?.errors?.[0].message) {
                    addToast(<div>
                        <p style={{ fontWeight: "bold", marginBottom: 5 }}>{t('uploadPicture.error_uploading_file')}</p>
                        <p>{err.response.data.errors[0].message}</p>
                    </div>, { appearance: 'error', autoDismiss: true });
                } else {
                    addToast(t('uploadPicture.something_went_wrong'), { appearance: 'error', autoDismiss: true });
                }
            });
        } else {
            setIsUploading(true);
            uploadProfilePhoto(formData).then(res => {
                setIsUploading(false);
                props.finishUpload();
            }).catch(err => {
                setIsUploading(false);
                if (err?.response?.data?.errors?.[0].message) {
                    addToast(<div>
                        <p style={{ fontWeight: "bold", marginBottom: 5 }}>{t('uploadPicture.error_uploading_file')}</p>
                        <p>{err.response.data.errors[0].message}</p>
                    </div>, { appearance: 'error', autoDismiss: true });
                } else {
                    addToast(t('uploadPicture.something_went_wrong'), { appearance: 'error', autoDismiss: true });
                }

            });
        }
    };

    const handleDelete = () => {
        setDeleteModal(false);
        setPreviewFile(null);
        deleteProfilePhoto(props.person.id).then(res => {
            props.finishUpload();
        })
    };

    const previewThumb = (diameter: any) => {
        if (!previewFile && props.prevPhoto) {
            return <div className='thumb preview-right' >
                <div className='thumbInner' style={{ height: diameter, width: diameter }}>
                    {props.prevPhoto instanceof File ? <img src={props.prevPhoto.preview} alt='avatar' /> : <EmployeeImage
                        initials={employeeInitials(props.person.first_name + ' ' + props.person.last_name)}
                        uuid={props.person.uuid}
                        fontSize={33}
                    />}
                </div>
            </div>
        } else if (previewFile) {
            return <div className='thumb preview-right' >
                <div className='thumbInner' style={{ height: diameter, width: diameter }}>
                    <img style={{ width: diameter }} src={previewFile[0] && previewFile[0].preview} alt='avatar' />
                </div>
            </div>
        } else {
            return <div className='thumb preview-right' >
                <DefaultAvatar style={{ height: diameter, width: diameter }} />
            </div>
        }
    };

    return (
        <Fragment>
            <DeleteContent
                isOpen={deleteModal}
                closeModal={() => setDeleteModal(false)}
                handleDelete={props.onPhotoSelect ? () => { props.onPhotoSelect(null); setDeleteModal(false); setPreviewFile(null); props.closeModal(); } : handleDelete}
            />
            <Dialog
                open={props.isOpen}
                onClose={() => { props.closeModal(); setPreviewFile(null); }}
                title={t('uploadPicture.edit_photo')}
                withButtons
                cancelButtonText={t('globaly.cancel')}
                actionButtonText={t('globaly.save')}
                actionButton={props.onPhotoSelect ? () => { props.onPhotoSelect(file); props.closeModal(); } : () => handleSubmit()}
                actionLoading={isUploading}
            >
                <Wrapper>
                    <div className='thumbs'>
                        <div>
                            <div className='thumbsContainer'>
                                <Dropzone ref={dropzoneRef} onDrop={handleDrop} accept={{ 'image/*': [".jpg", ".jpeg", ".png"] }}>
                                    {({ getRootProps, getInputProps }) => (
                                        <div {...getRootProps()}>
                                            <input {...getInputProps()} />
                                            {thumbs()}
                                        </div>
                                    )}
                                </Dropzone>
                            </div>
                            <div className='actions'>
                                <Dropzone ref={dropzoneRef} onDrop={handleDrop} accept={{ 'image/*': [".jpg", ".jpeg", ".png"] }}>
                                    {({ getRootProps, getInputProps }) => (
                                        <div {...getRootProps()}>
                                            <input {...getInputProps()} />
                                            <p className='choose'><CameraIcon /> <span>{t('uploadPicture.choose_file')}</span></p>
                                        </div>
                                    )}
                                </Dropzone>
                                {renderDeleteButton()}
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', flex: 0.9 }}>
                            <p style={{ color: '#8E8E8E', alignSelf: 'center', fontSize: 11 }}>{t('uploadPicture.preview')}</p>
                            <div className='preview'>
                                {previewThumb(92)}
                                {previewThumb(58)}
                                {previewThumb(30)}
                            </div>
                        </div>
                    </div>
                </Wrapper>
            </Dialog>
        </Fragment>
    );
};

export default UploadPictureModal;

const DeleteModalContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    & > div {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        & > svg {
            margin-bottom: 27px;
        }
        & > p {
            color: #676767;
            font-size: 12px;
        }
    }
`;

const TrashCanContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    height: 35px;
    width: 35px;
    border-radius: 4px;
    background-color: #F2F2F4;
    &:hover{
        background: #E4E4E4;
    }
`;
