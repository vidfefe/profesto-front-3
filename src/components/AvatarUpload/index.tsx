import { Fragment, RefObject, useCallback, useEffect, useRef, useState } from "react";
import DialogModal, { IDialogProps } from "components/Modal/Dialog";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import CircularProgress from "@mui/material/CircularProgress";
import { useDebouncedEffect } from "hooks/common";
import { base64StringToFile } from 'utils/common';
import { useToasts } from "react-toast-notifications";
import { FileRejection, useDropzone } from "react-dropzone";
import useMutationCustom from "hooks/useMutationCustom";
import useQueryCustom from "hooks/useQueryCustom";
import ReactCrop, {
    centerCrop,
    makeAspectCrop,
    Crop,
    PercentCrop,
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css';
import { getCurrentUser } from "services";
import { setCurrentUser } from "redux/authSlice";

import { canvasPreview } from "./canvasPreview";
import { DeleteAvatar } from "./DeleteModal";
import { ReactComponent as DefaultAvatar } from 'assets/svg/avatar_default.svg';
import { ReactComponent as CameraIcon } from 'assets/svg/camera.svg';
import { ReactComponent as TrashCan } from 'assets/svg/trash-can.svg';
import { useTranslation } from "react-i18next";

type TMutationUploadAvatarArgs = {
    employee_id: number,
    crop_x?: number,
    crop_y?: number,
    crop_w?: number,
    crop_h?: number,
    photo?: File
};

type TMutationAvatarUploadData = {
    id: number,
    uuid: string
};

interface IAvatarUpload extends Omit<IDialogProps, 'onChange'> {
    avatarValue?: string | any,
    onChange?: ({
        avatarFile,
        employeeId,
        completedCrop,
        previewImageBase64
    }: {
        avatarFile?: File,
        employeeId?: number,
        completedCrop?: PercentCrop | undefined,
        previewImageBase64?: string
    }) => void,
    employeeId: number,
    autonomous: boolean,
    onFinishAction?: () => void,
};

type TAvatarValue = {
    avatarFile?: File | any,
    employeeId?: number,
    completedCrop?: PercentCrop | undefined,
    previewImageBase64?: string
} | null;

const MAX_FILE_SIZE = 10_000_000;

const centerAspectCrop = (mediaWidth: number, mediaHeight: number, aspect: number) => {
    return centerCrop(
        makeAspectCrop(
            { unit: '%', width: 100, },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    )
};

/**
 * 
 * @param onChange for non-autonomous mode
 * @param onFinishAction custom callback after finish upload/delete action, `getCurrentUser` is included
 * @param autonomous boolean to manage component from outside
 * @param avatarValue value object if component is non-autonomous
 * @param employeeId self-explanatory
 * 
 */
export default function AvatarUpload({ open, onChange, onClose, onFinishAction, autonomous, avatarValue = null, employeeId, ...rest }: IAvatarUpload) {
    const { t } = useTranslation();
    const { addToast } = useToasts();
    const dispatch = useDispatch();
    const [avatar, setAvatar] = useState<TAvatarValue>(avatarValue);
    const imgRef = useRef<HTMLImageElement>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);
    const previewCanvasRef1 = useRef<HTMLCanvasElement>(null);
    const previewCanvasRef2 = useRef<HTMLCanvasElement>(null);
    const [completedCrop, setCompletedCrop] = useState<PercentCrop>()
    const [crop, setCrop] = useState<Crop>()
    const [deleteModal, setDeleteModal] = useState<boolean>(false);

    useEffect(() => {
        if (avatarValue && !autonomous) {
            setAvatar(avatarValue);
        }
    }, [autonomous, avatarValue]);

    const { mutate: deleteAvatar, isLoading: avatarDeleteLoading } = useMutationCustom<string[], {}, {}>(["delete_avatar"], {
        endpoint: `employee_photo?employee_id=${employeeId}`, options: { method: "delete" },
    }, {
        onSuccess: () => {
            setDeleteModal(false);
            onClose?.({}, 'escapeKeyDown');
            getCurrentUser().then(res => {
                dispatch(setCurrentUser(res.data));
            });
            onFinishAction?.();
        },
        onError: () => addToast(t('components.avatarUpload.there_were_some_errors'), {
            appearance: 'error',
            autoDismiss: true,
            placement: 'top-center'
        })
    });

    const { mutate: uploadAvatar, isLoading: avatarUploading } = useMutationCustom<TMutationAvatarUploadData, {}, TMutationUploadAvatarArgs>(["upload_avatar"], {
        endpoint: 'employee_photo', options: { method: "post", timeout: 30000 },
    }, {
        onSuccess: () => {
            onClose?.({}, 'escapeKeyDown');
            getCurrentUser().then(res => {
                dispatch(setCurrentUser(res.data));
            });
            onFinishAction?.();
        },
        onError: (err: any) => addToast(err.errors[0].message, {
            appearance: 'error',
            autoDismiss: true,
            placement: 'top-center'
        })
    });

    const { data: avatarData, isFetching: avatarDataLoading } = useQueryCustom<any>(["get_employee_photo_info"], {
        endpoint: `employee_photo/info?employee_id=${employeeId}`,
        options: { method: "get" },
        onSuccess: (data) => setAvatar({ avatarFile: data.photo_base64 }),
    }, { refetchOnWindowFocus: false, enabled: open && autonomous });

    useDebouncedEffect(() => {
        if (imgRef.current && previewCanvasRef.current && completedCrop?.width) {
            canvasPreview(
                imgRef.current,
                previewCanvasRef.current,
                completedCrop,
            )
        };
        if (imgRef.current && previewCanvasRef1.current && completedCrop?.width) {
            canvasPreview(
                imgRef.current,
                previewCanvasRef1.current,
                completedCrop,
            )
        };
        if (imgRef.current && previewCanvasRef2.current && completedCrop?.width) {
            canvasPreview(
                imgRef.current,
                previewCanvasRef2.current,
                completedCrop,
            )
        };
    }, 100, [completedCrop, open]);

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        if (avatar?.avatarFile instanceof File) {
            if (avatar.completedCrop) {
                setCrop(avatar.completedCrop);
                setCompletedCrop(avatar.completedCrop);
            } else {
                const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
                setCrop(centerAspectCrop(width, height, 1));
                return;
            }
        };
        if (avatarData?.photo_base64) {
            if (avatarData.employee_avatar) {
                const crop: any = {
                    unit: "%",
                    x: avatarData.employee_avatar.crop_x,
                    y: avatarData.employee_avatar.crop_y,
                    width: avatarData.employee_avatar.crop_w,
                    height: avatarData.employee_avatar.crop_h,
                };
                setCrop(crop);
                setCompletedCrop(crop);
            } else {
                const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
                setCrop(centerAspectCrop(width, height, 1));
            }
        };
    };

    const onDrop = useCallback((acceptedFiles: Array<File>, fileRejections: Array<FileRejection>) => {
        if (!fileRejections.length) {
            setCrop(undefined);
            setAvatar({
                avatarFile: acceptedFiles.map(file => Object.assign(file, {
                    preview: URL.createObjectURL(file)
                }))[0]
            })
        }
    }, []);

    const onDropRejected = (fileRejections: Array<FileRejection>) => {
        fileRejections.forEach(file => {
            file.errors.forEach(error => {
                if (error.code === 'file-invalid-type') {
                    return addToast(t('components.avatarUpload.there_were_some_errors'), { appearance: 'error', autoDismiss: true, placement: 'top-center' });
                };
                if (error.code === 'file-too-large') {
                    return addToast(t('components.avatarUpload.file_sizes'), { appearance: 'error', autoDismiss: true, placement: 'top-center' });
                };
                return addToast(error.message, { appearance: 'error', autoDismiss: true, placement: 'top-center' });
            })
        });
    };

    const { getRootProps, getInputProps, open: openPhotoPicker } = useDropzone({
        onDrop,
        onDropRejected,
        accept: { 'image/jpeg': [".jpg", ".jpeg"], 'image/png': [".png"] },
        maxFiles: 1,
        multiple: false,
        noClick: true,
        maxSize: MAX_FILE_SIZE,
    });

    const mainPreview = () => {
        if (typeof avatar?.avatarFile === 'string') {
            return <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(_, percentCrop) => setCompletedCrop(percentCrop)}
                aspect={1}
                circularCrop
                style={{ maxWidth: '100%', maxHeight: 280 }}
                minHeight={50}
                minWidth={50}
            >
                <img
                    ref={imgRef}
                    onLoad={onImageLoad}
                    src={avatar.avatarFile}
                    alt="avatar"
                />
            </ReactCrop>
        };
        if (avatar?.avatarFile instanceof File as any) {
            return <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(_, percentCrop) => setCompletedCrop(percentCrop)}
                aspect={1}
                circularCrop
                style={{ maxWidth: '100%', maxHeight: 280 }}
                minHeight={50}
                minWidth={50}
            >
                <img
                    ref={imgRef}
                    onLoad={autonomous ? (e) => { URL.revokeObjectURL(avatar?.avatarFile?.preview); onImageLoad(e) } : onImageLoad}
                    src={avatar?.avatarFile?.preview}
                    alt="avatar"
                />
            </ReactCrop>
        };
        return <DefaultAvatar />;
    };

    const secondaryPreview = (size: number, ref: RefObject<HTMLCanvasElement>) => {
        if (avatar?.avatarFile && !!completedCrop) {
            return <SecondaryPreviewImgContainer
                ref={ref}
                style={{ width: size, height: size }}
            />
        };
        return <DefaultAvatar style={{ height: size, width: size }} />
    };

    const onUploadAvatar = () => {
        let formData: any = new FormData();
        const avatarFile = avatar?.avatarFile instanceof File ? avatar.avatarFile : base64StringToFile(avatar?.avatarFile, 'avatar.png');

        formData.append('employee_id', employeeId as unknown as string);
        formData.append('crop_x', completedCrop?.x as unknown as string);
        formData.append('crop_y', completedCrop?.y as unknown as string);
        formData.append('crop_w', completedCrop?.width as unknown as string);
        formData.append('crop_h', completedCrop?.height as unknown as string);
        formData.append('photo', avatarFile);

        uploadAvatar(formData);
    };

    const onAvatarCustomSave = () => {
        const avatarFile = avatar?.avatarFile instanceof File ? avatar.avatarFile :
            base64StringToFile(avatar?.avatarFile, 'avatar.png');

        onChange?.({
            avatarFile,
            employeeId,
            completedCrop,
            previewImageBase64: previewCanvasRef.current?.toDataURL()
        });
        onClose?.({}, 'escapeKeyDown');
    };

    return (
        <Fragment>
            <DialogModal
                open={open}
                onClose={onClose}
                title={t('components.avatarUpload.edit_photo')}
                cancelButtonText={t('globaly.cancel')}
                actionButtonText={t('globaly.save')}
                withButtons
                maxWidth={'sm'}
                fullWidth
                preDefinedPadding={false}
                actionButton={autonomous ? onUploadAvatar : onAvatarCustomSave}
                actionLoading={avatarUploading}
                {...rest}
            >
                <ContentContainer>
                    <LeftSideContainer>
                        <MainPreviewContainer {...getRootProps()}>
                            {avatarDataLoading ? <CircularProgress /> : mainPreview()}
                            <input {...getInputProps()} />
                            {avatar?.avatarFile || avatarDataLoading ? null : <p dangerouslySetInnerHTML={{ __html: t('components.avatarUpload.drop_file_here_to_pload')}}/>}
                        </MainPreviewContainer>
                        <ActionsContainer>
                            <SingleActionContainer onClick={openPhotoPicker}>
                                <CameraIcon /><p>{t('components.avatarUpload.choose_file')}</p>
                            </SingleActionContainer>
                            {avatar?.avatarFile ? <SingleActionContainer onClick={() => setDeleteModal(true)}>
                                <TrashCan />
                            </SingleActionContainer> : null}
                        </ActionsContainer>
                    </LeftSideContainer>
                    <SecondaryPreviewContainer>
                        <p>{t('components.avatarUpload.preview')}</p>
                        <div>
                            {secondaryPreview(92, previewCanvasRef)}
                            {secondaryPreview(58, previewCanvasRef1)}
                            {secondaryPreview(30, previewCanvasRef2)}
                        </div>
                    </SecondaryPreviewContainer>
                </ContentContainer>
            </DialogModal>
            <DeleteAvatar
                closeModal={() => setDeleteModal(false)}
                isOpen={deleteModal}
                handleDelete={autonomous ? () => deleteAvatar({}) : () => { setDeleteModal(false); onChange?.({}); onClose?.({}, 'escapeKeyDown'); }}
                actionLoading={avatarDeleteLoading}
            />
        </Fragment>
    )
};

const ContentContainer = styled('div')(() => ({
    padding: '22px 25px',
    display: 'flex',
    justifyContent: 'space-between',
}));

const LeftSideContainer = styled('div')`
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const MainPreviewContainer = styled('div')`
    display: flex;
    width: 100%;
    max-width: 283px;
    min-height: 283px;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    border: 1px dashed #D6D6D6;
    & > p {
        text-align: center;
        color: #8E8E8E;
        opacity: 0.67;
        margin-top: 12px;
        font-size: 10px;
    }
`;

const SecondaryPreviewImgContainer = styled('canvas')`
    max-width: 203px;
    max-height: 203px;
    border-radius: 50%;
    object-fit: contain;
`;

const SecondaryPreviewContainer = styled('div')`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: column;
    flex: 0.5;
    & > div {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-direction: column;
        flex: 1;
        margin-bottom: 50px;
    };
    & > p {
        font-size: 10px;
        text-align: center;
        color: #8E8E8E;
        margin-bottom: 12px;
    }
`;

const ActionsContainer = styled('div')`
    display: flex;
    gap: 10px;
    margin-top: 17px;
`;

const SingleActionContainer = styled('div')`
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-radius: 4px;
    background-color: #F2F2F4;
    padding: 11px 14px;
    &:hover{
        background: #E4E4E4;
    };
    & > p {
        font-size: 8px;
        color:#FF9933;
        margin-left: 9px;
        text-decoration: underline;
    }
`;