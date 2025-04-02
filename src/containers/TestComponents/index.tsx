import React, { useState } from "react";
import styled from 'styled-components';
import { EmployeeImageTest } from "./EmployeeImage";
import { SelectDropdownComponent } from './SelectDropdownComponent';
import { InputComponent } from './InputComponent';
import { EnumSelectDropdownComponent } from './EnumSelectDropdownComponent';
import { InputSelectWithinComponent } from './InputSelectWithinComponent';
import { CheckboxComponent } from './CheckBoxComponent';
import { DatePickerTestComponent } from './DatePickerTestComponent';
import TableComponent from './TableComponent';
import RadioButton from "components/RadioButton";
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import Modal from "components/Modal";
import { TextAreaComponent } from "./TextAreaComponent";
import { renderModalHeight } from "../../utils/common";
import { useDimension } from "../../hooks/useWindowSize";
import Dialog from 'components/Modal/Dialog';
import AvatarUpload from "components/AvatarUpload";
import { useSelector } from "react-redux";
import { currentUserSelector } from "redux/selectors";

const Wrapper = styled.div`
    padding: 20px;
    display: flex;
    flex: 1;
    height: 100%;
    flex-direction: column;
    background-color: #FFFFFF;
    
    .react-tabs__tab-list{
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #AEAEAE;
      margin-bottom: 15px;
  
      .react-tabs__tab{
        flex: 1;
        text-align: center;
        padding: 10.5px 10px;
        color: #00101A;
      }
  
      .react-tabs__tab:focus{
        box-shadow: none;
        outline: none !important;
      }
  
      .react-tabs__tab:focus:after{
        display: none;
      }
  
      .react-tabs__tab--selected{
        padding-bottom: 9px !important;
        border: none;
        color: #FF9933;
        border-bottom: 2px solid #FF9933;
      }
    }
`

const ColumnContainer = styled.div`
    display: flex;
    flex-direction: column;
`

const Link = styled.div`
    margin-top: 20px;
    cursor: pointer;
    text-decoration: underline;
    
    :hover {
        color: var(--orange);
    }
`

const ModalContent = styled.div`
    width: 500px;
    padding: 15px;
`

export const TestComponents = () => {
    const [tabIndex, setTabIndex] = useState<number>(0);
    const [openModal, setOpenModal] = React.useState(false);
    const [openModalEdit, setOpenModalEdit] = React.useState(false);
    const [openDialog, setOpenDialog] = React.useState(false);
    const [avatarUpload, setAvatarUpload] = React.useState(false);
    const [avatar, setAvatar] = React.useState<string | any>(null);
    const [loading, setLoading] = useState(false);
    const dimension = useDimension();
    const currentUser = useSelector(currentUserSelector);

    const onEditModalClose = () => {
        setLoading(true);
        setTimeout(() => { setOpenModalEdit(false); setLoading(false) }, 2000);
    };

    const NominalHeader = () => {
        return (
            <div style={{ height: 50, backgroundColor: 'yellowgreen' }}>
                THIS IS NOMINAL HEADER
            </div>
        )
    };

    return (
        <Wrapper>
            <Tabs selectedIndex={tabIndex} onSelect={(index: number) => {
                setTabIndex(index);
            }}>
                <TabList>
                    <Tab>Inputs</Tab>
                    <Tab>Table</Tab>
                    <Tab>Employee Components</Tab>
                    <Tab>Other</Tab>
                </TabList>

                <TabPanel>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: 30 }}>
                        <ColumnContainer>
                            <SelectDropdownComponent size='medium' />
                            <EnumSelectDropdownComponent size='medium' />
                            <InputComponent size='medium' />
                        </ColumnContainer>

                        <ColumnContainer>
                            <SelectDropdownComponent size='small' />
                            <EnumSelectDropdownComponent size='small' />
                            <InputComponent size='small' />
                        </ColumnContainer>

                        <ColumnContainer>
                            <CheckboxComponent />
                            <TextAreaComponent />
                            <DatePickerTestComponent />
                            <InputSelectWithinComponent />
                            <FormControl sx={{ marginTop: 3 }}>
                                <FormLabel>Did you use a preparer/translator?</FormLabel>
                                <RadioGroup row>
                                    <FormControlLabel value="no" control={<RadioButton />} label="No, I completed this myself" />
                                    <FormControlLabel value="yes" control={<RadioButton />} label="Yes, I used a preparer/translator" />
                                </RadioGroup>
                            </FormControl>
                        </ColumnContainer>

                        <ColumnContainer>
                            <Link onClick={() => setOpenModalEdit(true)}>Open Edit Modal</Link>
                            <Link onClick={() => setOpenModal(true)}>Open Information Modal</Link>
                            <Link onClick={() => setOpenDialog(true)}>Open Dialog</Link>
                            <Link onClick={() => setAvatarUpload(true)}>Open Avatar Upload</Link>
                        </ColumnContainer>
                    </div>
                </TabPanel>
                <TabPanel>
                    <TableComponent />
                </TabPanel>

                {/*Employee*/}
                <TabPanel>
                    <EmployeeImageTest />
                </TabPanel>

                {/*Other*/}
                <TabPanel>
                </TabPanel>

            </Tabs>
            <AvatarUpload
                open={avatarUpload}
                autonomous
                onClose={() => setAvatarUpload(false)}
                employeeId={currentUser.employee.id}
            />

            <Modal
                open={openModalEdit}
                title={`Modal title 1`}
                onClose={() => { setOpenModalEdit(false) }}
                actionButton={() => onEditModalClose()}
                withButtons
                cancelButtonText='CANCEL'
                actionButtonText='SAVE'
                actionLoading={loading}
            >

                <div style={{ width: 660, height: renderModalHeight(dimension.height) - 100, paddingBottom: 70, overflow: 'scroll' }}>
                    <ModalContent>
                        <ColumnContainer>
                            <SelectDropdownComponent size='small' />
                            <EnumSelectDropdownComponent size='small' />
                            <InputComponent size='small' />
                        </ColumnContainer>
                    </ModalContent>
                </div>
            </Modal>

            <Modal
                open={openModal}
                title={`Modal title`}
                onClose={() => { setOpenModal(false) }}
                actionButton={() => setOpenModal(false)}
            >
                <div style={{ width: 660, height: renderModalHeight(dimension.height), overflow: 'scroll' }}>
                    <ModalContent>
                        <ColumnContainer>
                            <SelectDropdownComponent size='small' />
                            <DatePickerTestComponent />
                            <SelectDropdownComponent size='small' />
                            <EnumSelectDropdownComponent size='small' />
                            <InputComponent size='small' />
                        </ColumnContainer>
                    </ModalContent>
                </div>
            </Modal>

            <Dialog
                open={openDialog}
                title={`Modal title`}
                onClose={() => { setOpenDialog(false) }}
                actionButton={() => setOpenDialog(false)}
                withButtons
                cancelButtonText='CANCEL'
                actionButtonText='SAVE'
                nominalHeader={<NominalHeader />}
            >
                <ModalContent style={{ padding: 0 }}>
                    <ColumnContainer>
                        <SelectDropdownComponent size='small' />
                        <DatePickerTestComponent />
                        <SelectDropdownComponent size='small' />
                        <EnumSelectDropdownComponent size='small' />
                        <InputComponent size='small' />
                    </ColumnContainer>
                </ModalContent>
            </Dialog>
        </Wrapper>
    )
}

