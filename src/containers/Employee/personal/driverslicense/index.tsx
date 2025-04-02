
import { useEffect, useState } from "react";
import styled from "styled-components";
import { withRouter } from 'react-router-dom';
import DriversInformationEdit from "./edit";
import LicenseInformationDelete from "./delete";
import Section, { StatusItem } from "../section";
import {
    createDriversLicense,
    getDriverLicence,
    deleteEmployeeLicense,
    updateDriversLicense
} from 'services'
import { checkDate } from "utils/common";
import { useToasts } from "react-toast-notifications";
import { isEmpty } from "lodash";
import { ReactComponent as EditIcon } from 'assets/svg/pen-circle.svg';
import { ReactComponent as TrashCanIcon } from 'assets/svg/trash-can-circle.svg';
import { useTranslation } from "react-i18next";
import { dateFormat } from "lib/DateFormat";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

const Wrapper = styled.div``;

const NoData = styled.div`
    padding: 20px 25px;
    font-size: 11px;
    color: #80888D;
`;

const DriversInformation = ({ person, match, onSave, disabled, view }: any) => {
    const { t } = useTranslation();
    const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
    const [driversLicense, setDriversLicense] = useState<any>([]);
    const [licenseId, setLicenseId] = useState(null);
    const [chosenLicense, setChosenLicense] = useState<any>(null);
    const [editMode, setEditMode] = useState<boolean>(false);
    const { addToast } = useToasts();
    const [editErrors, setEditErrors] = useState<any>([]);

    useEffect(() => {
        if (match.params.id || person.id) {
            getDriverLicence(25, 1, match.params.id ?? person.id).then(res => setDriversLicense(res.data.list))
        }
    }, [match.params.id, person.id])

    const handleEditSubmit = (data: any) => {
        if (!editMode) {
            setLoadingRequest(true);
            createDriversLicense(data, person.id).then(res => {
                setLoadingRequest(false);
                getDriverLicence(25, 1, match.params.id ?? person.id).then(res => setDriversLicense(res.data.list))
                setIsOpen(false)
                addToast(t('myInfo.driver.added'), {
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
            });
        } else {
            setLoadingRequest(true);
            updateDriversLicense(data, chosenLicense.id).then(res => {
                setLoadingRequest(false);
                getDriverLicence(25, 1, match.params.id ?? person.id).then(res => setDriversLicense(res.data.list))
                setIsOpen(false);
                addToast(t('myInfo.driver.updated'), {
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
        deleteEmployeeLicense(licenseId).then((res: any) => {
            setLoadingRequest(false);
            const filteredList = driversLicense.filter((item: any) => item.id !== res.data.id)
            setDriversLicense(filteredList);
            setIsDeleteOpen(false);
            addToast(t('myInfo.driver.deleted'), {
                appearance: 'success',
                autoDismiss: true,
            })
            onSave && onSave();
        });
    }

    return (
        <Wrapper>
            <Section
                title={t('myInfo.driver.driver_license')}
                onEditClick={() => {
                    setEditMode(false)
                    setChosenLicense([])
                    setIsOpen(true)
                }}
                rightText={view ? t('globaly.view') : t('globaly.lowercase_add')}
                disabled={disabled}
                view={view}
            >
                    {!driversLicense.length ?
                        <NoData>{t('myInfo.driver.no_added')}</NoData> : 
                        <TableContainer style={{ maxWidth: '100%' }}>
                            <Table style={{ width: 'auto' }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('myInfo.driver.license_number')}</TableCell>
                                        <TableCell>{t('myInfo.driver.classification')}</TableCell>
                                        <TableCell>{t('employee.address.state_province_region')}</TableCell>
                                        <TableCell>{t('myInfo.visa.expiration')}</TableCell>
                                        <TableCell>{t('myInfo.visa.status')}</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        driversLicense.map((item: any) =>  {
                                            return (
                                                <TableRow hover key={item.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                    <TableCell width={280}>{item.number}</TableCell>
                                                    <TableCell width={280}>
                                                        {
                                                            item.employee_driver_classifications.map((class_item: any, index: number) =>
                                                                <span key={class_item.id}>{index !== 0 && ', '}{class_item.classification.name}</span>
                                                            )
                                                        }    
                                                    </TableCell>
                                                    <TableCell width={280}>{isEmpty(item.region) ? '-' : item.region}</TableCell>
                                                    <TableCell width={280}>{dateFormat(item.expiration_date, 'shortDate') ?? '-'}</TableCell>
                                                    <TableCell width={280}>{(item.expiration_date && renderStatus(item.expiration_date)) ?? '-'}</TableCell>
                                                    <TableCell width={100}>
                                                        <div className="action-block">
                                                            {disabled ? null : <><StyledEditIcon onClick={() => {
                                                                setEditMode(true);
                                                                setChosenLicense(item);
                                                                setIsOpen(true);
                                                            }} />
                                                                <StyledTrashIcon onClick={() => {
                                                                    setIsDeleteOpen(true);
                                                                    setLicenseId(item.id);
                                                                }} /></>}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                    }

                <LicenseInformationDelete
                    isOpen={isDeleteOpen}
                    onModalClose={() => setIsDeleteOpen(false)}
                    onDelete={handleDeleteSubmit}
                    loadingRequest={loadingRequest}
                />

                <DriversInformationEdit
                    isOpen={isOpen}
                    user={person}
                    chosenLicense={chosenLicense}
                    jobData={person.active_job_detail}
                    onModalClose={() => {
                        setEditMode(false);
                        setIsOpen(false)
                    }}
                    onSubmit={handleEditSubmit}
                    editMode={editMode}
                    editErrors={editErrors}
                    loadingRequest={loadingRequest}
                />
            </Section>
        </Wrapper>
    );
};

export default withRouter(DriversInformation);

const StyledEditIcon = styled(EditIcon)`
  cursor: pointer;
  margin-right: 5px;
`;

const StyledTrashIcon = styled(TrashCanIcon)`
  cursor: pointer;
  margin-right: 0;
`;
