
import { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import styled from "styled-components";
import VisaInformationEdit from "./edit";
import VisaInformationDelete from './delete';
import Section, { StatusItem } from "../section";
import {
    createEmployeeVisa,
    getEmployeeVisaList,
    deleteEmployeeVisa,
    updateVisa
} from 'services';
import { checkDate } from "utils/common";
import { useToasts } from "react-toast-notifications";
import { isEmpty } from "lodash";

import { ReactComponent as EditIcon } from 'assets/svg/pen-circle.svg';
import { ReactComponent as TrashCanIcon } from 'assets/svg/trash-can-circle.svg';
import { useTranslation } from "react-i18next";

const Wrapper = styled.div`
    .table{
        padding: 20px 0;
       
        .table-header{
            margin: 0px 10px;
            padding: 0 20px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            color: #172B37;
            font-size: 12px;
            font-family: 'Aspira Demi', 'FiraGO Regular';

            div {
                width: 20%;
                &:last-child {
                    width: 5%;
                }
            }
        }

        .table-row{
            font-size: 11px;
            margin: 0px 10px;
            padding: 13px 20px;
            border-top: 1px solid #F8F8F8;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #414141;
            :hover{
                background: #EEEEEE;
                .actions{
                    visibility: visible;
                }
            }

            div {
                width: 25%;
                &:last-child {
                    width: 6%;
                }
            }

            .actions{
                display: flex;
                visibility: hidden;
                align-items: center;
                justify-content: flex-end;
            }
            
            .text_wrapper {
                display: block;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }
    }
`;

const NoData = styled.div`
    padding: 20px 25px;
    font-size: 11px;
    color: #80888D;
`;

const VisaInformation = ({ person, match, onSave, disabled, view }: any) => {
    const { t } = useTranslation();
    const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [visaData, setVisa] = useState<any>([]);
    const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
    const [visaId, setVisaId] = useState(null);
    const [chosenVisa, setChosenVisa] = useState<any>(null);
    const [editMode, setEditMode] = useState<boolean>(false);
    const { addToast } = useToasts();
    const [editErrors, setEditErrors] = useState<any>([]);

    useEffect(() => {
        if (match.params.id || person.id) {
            getEmployeeVisaList(25, 1, match.params.id ?? person.id).then(res => setVisa(res.data));
        }
    }, [match.params.id, person.id])

    const handleEditSubmit = (data: any) => {
        if (!editMode) {
            setLoadingRequest(true);
            createEmployeeVisa(data, person.id).then(res => {
                setLoadingRequest(false);
                getEmployeeVisaList(25, 1, match.params.id ?? person.id).then(res => setVisa(res.data));
                setIsOpen(false)
                addToast(t('myInfo.visa.visa_successfully_added'), {
                    appearance: 'success',
                    autoDismiss: true,
                })
                onSave && onSave();
            }).catch(err => {
                setLoadingRequest(false);
                addToast(<div><span style={{ fontWeight: 'bold' }}> {t('myInfo.visa.there_form')}</span> <span style={{ marginTop: 6, display: 'inline-block' }}>{t('myInfo.visa.please_below')}</span></div>, {
                    appearance: 'error',
                    autoDismiss: true,
                    placement: 'top-center'
                });
                setEditErrors(err.response.data.errors)
            })
        } else {
            setLoadingRequest(true);
            updateVisa(data, chosenVisa.id).then(res => {
                setLoadingRequest(false);
                getEmployeeVisaList(25, 1, match.params.id ?? person.id).then(res => setVisa(res.data));
                setChosenVisa(null);
                setIsOpen(false);
                addToast(t('myInfo.visa.visa_updated'), {
                    appearance: 'success',
                    autoDismiss: true,
                })
                onSave && onSave();
            }).catch(err => {
                setLoadingRequest(false);
                addToast(<div><span style={{ fontWeight: 'bold' }}> {t('myInfo.visa.there_form')}</span> <span style={{ marginTop: 6, display: 'inline-block' }}>{t('myInfo.visa.please_below')}</span></div>, {
                    appearance: 'error',
                    autoDismiss: true,
                    placement: 'top-center'
                });
                setEditErrors(err.response.data.errors)
            })
        }
    }

    const renderStatus = (date: string) => {
        return <StatusItem status={checkDate(date)} />;
    }

    const handleDeleteSubmit = () => {
        setLoadingRequest(true);
        deleteEmployeeVisa(visaId).then((res: any) => {
            setLoadingRequest(false);
            const filteredList = visaData.filter((item: any) => item.id !== res.data.id)
            setVisa(filteredList);
            setIsDeleteOpen(false);
            addToast(t('myInfo.visa.visa_deleted'), {
                appearance: 'success',
                autoDismiss: true,
            })
            onSave && onSave();
        });
    }

    return (
        <Wrapper>
            <Section
                title={t('myInfo.visa.visa_information')}
                onEditClick={() => {
                    setChosenVisa([]);
                    setIsOpen(true)
                }}
                rightText={view ? t('globaly.view') : t('globaly.lowercase_add')}
                disabled={disabled}
                view={view}
            >
                {!visaData.length ? <NoData>{t('myInfo.visa.no_added')}</NoData> : <div className='table'>
                    <div className='table-header'>
                        <div>{t('myInfo.visa.visa')}</div>
                        <div>{t('myInfo.visa.issuing_country')}</div>
                        <div>{t('myInfo.visa.issued')}</div>
                        <div>{t('myInfo.visa.expiration')}</div>
                        <div>{t('myInfo.visa.status')}</div>
                        <div className="note">{t('myInfo.visa.note')}</div>
                        <div></div>
                    </div>
                    <div>
                        {visaData.map((item: any) => <div className='table-row' key={item.id}>
                            <div>{isEmpty(item.visa.name) ? '-' : item.visa.name}</div>
                            <div>
                                {isEmpty(item.issuing_country.name) ? '-' : item.issuing_country.name}
                            </div>
                            <div>{item.issue_date ?? '-'}</div>
                            <div>{item.expiration_date}</div>
                            <div>{renderStatus(item.expiration_date)}</div>
                            <div><p className='text_wrapper'>{isEmpty(item.note) ? '-' : item.note}</p></div>
                            <div className='actions'>
                                {disabled ? null : <><StyledEditIcon onClick={() => {
                                    setChosenVisa(item);
                                    setEditMode(true);
                                    setIsOpen(true);
                                }} />
                                    <StyledTrashIcon onClick={() => {
                                        setIsDeleteOpen(true);
                                        setVisaId(item.id);
                                    }} /></>}
                            </div>
                        </div>)}
                    </div>
                </div>}

                <VisaInformationDelete
                    isOpen={isDeleteOpen}
                    onModalClose={() => setIsDeleteOpen(false)}
                    onDelete={handleDeleteSubmit}
                    loadingRequest={loadingRequest}
                />

                <VisaInformationEdit
                    isOpen={isOpen}
                    user={person}
                    jobData={person.active_job_detail}
                    editMode={editMode}
                    chosenVisa={chosenVisa}
                    onModalClose={() => {
                        setEditMode(false);
                        setIsOpen(false);
                        setChosenVisa(null);
                    }}
                    onSubmit={handleEditSubmit}
                    editErrors={editErrors}
                    loadingRequest={loadingRequest}
                />
            </Section>
        </Wrapper>
    );
};

export default withRouter(VisaInformation);

const StyledEditIcon = styled(EditIcon)`
  cursor: pointer;
  margin-right: 5px;
`;

const StyledTrashIcon = styled(TrashCanIcon)`
  cursor: pointer;
  margin-right: 0;
`;

