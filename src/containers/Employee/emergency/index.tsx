import { useEffect, useState } from "react";
import styled from "styled-components";
import { getEmergencyContactList, createEmergencyContact, deleteEmergencyContact, updateEmergencyContact } from "services";
import CircularProgress from "@mui/material/CircularProgress";
import EmergencyItem from "./emergencyItem";
import EmergencyInformationEdit from './edit';
import ContactDelete from './delete';
import { useToasts } from "react-toast-notifications";
import { useTranslation } from "react-i18next";

const Wrapper = styled.div`
    border: 1px solid #EEEEEE;
    border-radius: 4px;
    margin-bottom: 15px;

    .header {
        background: #C3E1D2;
        border-radius: 4px 4px 0 0;
        padding: 10px 12px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .editBtn{
            cursor: pointer;

            &:hover{
                text-decoration: underline;
            }
        }
    }

    .body{
        padding: 20px;
    }
`;

const NoData = styled.div`
    padding: 10px 10px;
    font-size: 11px;
    color: #80888D;
`;

const Emergency = ({ person, onSave, disabled }: any) => {
    const { t } = useTranslation();
    const [emergencyList, setEmergencyList] = useState<any>(false);
    const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
    const [chosenContact, setChosenContact] = useState<any>(null);
    const { addToast } = useToasts();
    const [editMode, setEditMode] = useState<boolean>(false)
    const [editErrors, setEditErrors] = useState<any>([]);

    useEffect(() => {
        getEmergencyContactList(25, 1, person.id).then(res => {
            setLoading(false)
            setEmergencyList(res.data.list);
        })
    }, [person.id]);

    useEffect(() => {
        setEditErrors([])
    }, [isOpen])

    const onAddClick = () => {
        setChosenContact(null);
        setEditMode(false)
        setIsOpen(true);
    }

    const handleEditSubmit = (data: any) => {
        if (!editMode) {
            setLoadingRequest(true);
            createEmergencyContact(data, person.id).then(res => {
                setLoadingRequest(false);
                getEmergencyContactList(25, 1, person.id).then(res => {
                    setLoading(false)
                    setEmergencyList(res.data.list);
                })

                setIsOpen(false)
                addToast(t('emergency.added_successfully'), {
                    appearance: 'success',
                    autoDismiss: true,
                });
                onSave && onSave();
            }).catch(err => {
                setLoadingRequest(false);
                addToast(err.response.data.errors[0].message, {
                    appearance: 'error',
                    autoDismiss: true
                });
                setEditErrors(err.response.data.errors)
            })
        } else {
            setLoadingRequest(true);
            updateEmergencyContact(data, chosenContact.id).then(res => {
                setLoadingRequest(false);
                getEmergencyContactList(25, 1, person.id).then(res => {
                    setLoading(false)
                    setEmergencyList(res.data.list);
                })
                setIsOpen(false)
                addToast(t('emergency.updated_successfully'), {
                    appearance: 'success',
                    autoDismiss: true,
                });
                onSave && onSave();
            }).catch(err => {
                setLoadingRequest(false);
                addToast(err.response.data.errors[0].message, {
                    appearance: 'error',
                    autoDismiss: true
                });
                setEditErrors(err.response.data.errors)
            })
        }
    }

    const handleDelete = () => {
        setLoadingRequest(true);
        deleteEmergencyContact(chosenContact.id).then(res => {
            setLoadingRequest(false);
            getEmergencyContactList(25, 1, person.id).then(res => {
                setLoading(false)
                setEmergencyList(res.data.list);
                addToast(t('emergency.deleted_successfully'), {
                    appearance: 'success',
                    autoDismiss: true,
                });
            })
            setIsDeleteOpen(false);
            onSave && onSave();
        });
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
            </div>
        )
    };

    return (
        <Wrapper>
            <div className='header'>
                <span>{t('emergency.emergency_contact')}</span>
                {disabled ? null : <span onClick={onAddClick} className='editBtn'>{t('globaly.lowercase_add')}</span>}
            </div>

            <div className='body'>
                {!emergencyList.length ? <NoData>{t('emergency.no_emergency_contact')}</NoData> :
                    emergencyList.map((item: any) => <EmergencyItem
                        key={item.id}
                        item={item}
                        onDeleteClick={(item: any) => {
                            setChosenContact(item)
                            setIsDeleteOpen(true)
                        }}
                        onEditClick={(item: any) => {
                            setEditMode(true);
                            setChosenContact(item);
                            setIsOpen(true);
                        }}
                        disabled={disabled}
                    />)}
            </div>

            <ContactDelete
                isOpen={isDeleteOpen}
                onModalClose={() => {
                    setChosenContact(null);
                    setIsDeleteOpen(false)
                }}
                onDelete={handleDelete}
                loadingRequest={loadingRequest}
            />

            {isOpen && <EmergencyInformationEdit
                isOpen={isOpen}
                user={person}
                jobData={person.active_job_detail}
                onModalClose={() => {
                    setEditMode(false);
                    setIsOpen(false);
                    setChosenContact(null);
                }}
                onSubmit={handleEditSubmit}
                editMode={editMode}
                chosenItem={chosenContact}
                editErrors={editErrors}
                loadingRequest={loadingRequest}
            />}
        </Wrapper>
    );
};

export default Emergency;
