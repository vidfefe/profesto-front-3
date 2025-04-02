import { useEffect, useState, Fragment } from "react";
import { NavLink, useHistory } from "react-router-dom";
import styled from "styled-components";
import LoadingButton from '@mui/lab/LoadingButton';
import TextField from "@mui/material/TextField";
import InputAdornment from '@mui/material/InputAdornment';
import { getEmployeeList } from 'services'
import { saveStorageObject } from "utils/storage";
import useQuery from "hooks/useQueryCustom";
import { useScrollTop } from 'hooks/common';
import { useDimension } from "hooks/useWindowSize";
import PersonItem from './personItem'
import { groupFilterData } from 'utils/common'
import FilteredList from "./FilteredList";
import { setPeopleDirPath } from "redux/personSlice";
import { useDispatch, useSelector } from "react-redux";
import { PageHeaderTitle } from "components/DesignUIComponents";
import EmployeeDirectReportList from "../../containers/Employee/job/jobinfo/DirectReports";
import ExceededModal from "./ExceededModal";
import PermissionGate from "permissions/PermissionGate";

import { ReactComponent as ListIcon } from 'assets/svg/list-icon.svg';
import { ReactComponent as DirectoryIcon } from 'assets/svg/directory-icon.svg';
import { ReactComponent as MagnifierIcon } from 'assets/svg/magnifier.svg';
import { ReactComponent as CloseIcon } from 'assets/svg/close-icon.svg';
import { ReactComponent as NoResultsIcon } from 'assets/svg/no-results.svg';
import { useTranslation } from "react-i18next";
import { currentUserSelector } from "redux/selectors";


const NoData = () => {
  const { t } = useTranslation();
  return <NoResultsContainer>
    <NoResultsIcon width={125} height={125} />
    <h4>{t('homePage.active_employee')}</h4>
  </NoResultsContainer>
};

const NoResults = () => {
  const { t } = useTranslation();
  return <NoResultsContainer>
    <NoResultsIcon width={125} height={125} />
    <h4>{t('homePage.looks_like_there')}</h4>
    <p>{t('homePage.searching_for_another')}</p>
  </NoResultsContainer>
};

const People = () => {
  const { t } = useTranslation();
  const dimension = useDimension();
  const [scrollTop, { onScroll }] = useScrollTop() as any;
  const [userList, setUserList] = useState<any>();
  const [searchVal, setSearchVal] = useState<string>('');
  const [locationList, setLocationList] = useState<any>();
  const [jobsList, setJobsList] = useState<any>();
  const [departmentList, setDepartmentList] = useState<any>();
  const [divisionList, setDivisionList] = useState<any>();
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [employeeList, setEmployeeList] = useState<any>([]);
  const [chosenEmployee, setChosenEmployee] = useState<number>();
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const [exceededModal, setExceededModal] = useState<boolean>(false);
  const currentUser = useSelector(currentUserSelector);
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    getEmployeeList(100, 1).then(res => {
      setDataLoaded(true)
      setEmployeeList(res?.data.list ?? []);
    });
  }, []);

  const handleSearch = (e: any) => {
    setSearchVal(e.target.value)
    const word_array = e.target.value.split(' ').filter((item: string) => { return item !== '' })

    const newData = employeeList.filter((item: any) =>
      word_array.every((element: string) => item.first_name.toLowerCase().includes(element.toLowerCase())
        || item.last_name.toLowerCase().includes(element.toLowerCase())
        || (item.preferred_name && item.preferred_name.toLowerCase().includes(element.toLowerCase()))
        || (item.middle_name && item.middle_name.toLowerCase().includes(element.toLowerCase())))
    );

    setJobsList(groupFilterData(e.target.value, employeeList, 'job_title_name'))
    setLocationList(groupFilterData(e.target.value, employeeList, 'location_name'))
    setDepartmentList(groupFilterData(e.target.value, employeeList, 'department_name'))
    setDivisionList(groupFilterData(e.target.value, employeeList, 'division_name'))
    setUserList(newData)

    if (!e.target.value) {
      setUserList(employeeList)
    }
  };

  const openSubordinates = (id: number) => {
    setChosenEmployee(id)
    setModalOpen(true);
  };

  const handlePeopleDirectoryChange = (directory: string) => {
    saveStorageObject('people-path', directory);
    dispatch(setPeopleDirPath(directory))
  };

  const { data, isFetching, refetch } = useQuery<any>(["subscription_info_on_press"], {
    endpoint: 'billing/subscription',
    options: { method: "get" },
  }, { enabled: false });

  const onClickNewEmployeeCreate = async () => {
    const { data } = await refetch();
    if (data?.status && data?.status !== 'trialing' && data?.employee_count >= data?.count) {
      setExceededModal(true);
    } else {
      history.push('/createperson');
    }
  };

  const personEmployee = () => {
    return employeeList.find((employee: any) => employee.id === currentUser.employee.id);
  }

  return (
    <Fragment>
      <PageContainer>
        <PageHeaderContainer $enableHeaderShadow={scrollTop > 0}>
          <PageHeaderTitle
            title={t('homePage.directory_people_records', { count: employeeList && employeeList.length })}
            rightSide={<PermissionGate on="employee">
              <LoadingButton
                type="button"
                size='large'
                variant='contained'
                onClick={onClickNewEmployeeCreate}
                loading={isFetching}
              >+ {t('homePage.new_employee')}</LoadingButton>
            </PermissionGate>}
          />
          <FilteredListContainerHeader>
            <TextField
              sx={{ padding: 0, width: 440, '& input': { padding: '10px 1px' } }}
              placeholder={t('homePage.search_placeholder')}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: <InputAdornment position="start"><MagnifierIcon width={15} height={15} /></InputAdornment>,
                endAdornment: searchVal ? <InputAdornment position="end"><StyledCloseIcon onClick={() => setSearchVal('')} /></InputAdornment> : null
              }}
              value={searchVal}
              onChange={handleSearch}
            />
            <PermissionGate on="employee_list">
              <ListDirectoryButtons>
                <StyledNavLink
                  activeClassName="navlink_active"
                  to='/list'
                  onClick={() => handlePeopleDirectoryChange('list')}
                >
                  <ListIcon /><span>{t('components.dataGrid.list')}</span>
                </StyledNavLink>
                <StyledNavLink
                  activeClassName="navlink_active"
                  to='/people'
                  onClick={() => handlePeopleDirectoryChange('people')}
                  style={{ borderRadius: '0px 4px 4px 0px', borderLeftWidth: 0 }}
                >
                  <DirectoryIcon /><span>{t('components.dataGrid.directory')}</span>
                </StyledNavLink>
              </ListDirectoryButtons>
            </PermissionGate>
          </FilteredListContainerHeader>
          {(!searchVal || employeeList.length === 0) && <span />}
        </PageHeaderContainer>

        <div onScroll={onScroll} style={{ height: dimension.height - 265, overflow: 'auto' }}>
          <FilteredListContainer>
            {!searchVal && employeeList && employeeList.map((item: any) => <div key={item.id}>
              <PermissionGate shouldVisible on="employee" properties={{ disabled: !(item.manager_id === currentUser.employee.id || item.id === currentUser.employee.id) }}> 
                <PersonItem
                  item={item}
                  onReportsToClick={(id: any) => openSubordinates(id)}
                />
              </PermissionGate>
            </div>)}

            {searchVal && userList &&
              <div >
                {userList && userList.length > 0 &&
                  <FilteredListHeader>
                    {t('homePage.people')}
                    <span>({userList.length})</span>
                  </FilteredListHeader>}
                {userList && userList.map((item: any) => <div key={item.id}>
                  <PermissionGate shouldVisible on="employee" properties={{ disabled: !(item.manager_id === currentUser.employee.id || item.id === currentUser.employee.id) }}>
                    <PersonItem
                      item={item}
                      onReportsToClick={(id: any) => openSubordinates(id)}
                    />
                  </PermissionGate>
                </div>)}
              </div>
            }

            {searchVal && jobsList && jobsList.map((item: any) => <div key={item.title}>
              <FilteredList
                title={t('employee.job.job_title')}
                onReportsToClick={(id: any) => openSubordinates(id)}
                data={item}
                searchString={searchVal}
                type='job_title_name'
              /></div>)}
            {searchVal && departmentList && departmentList.map((item: any) => <div key={item.title}>
              <FilteredList
                title={t('employee.job.department')}
                onReportsToClick={(id: any) => openSubordinates(id)}
                data={item}
                searchString={searchVal}
                type='department_name'
              /></div>)}
            {searchVal && divisionList && divisionList.map((item: any) => <div key={item.title}>
              <FilteredList
                title={t('employee.job.division')}
                onReportsToClick={(id: any) => openSubordinates(id)}
                data={item}
                searchString={searchVal}
                type='division_name'
              /></div>)}
            {searchVal && locationList && locationList.map((item: any) => <div key={item.title}>
              <FilteredList
                title={t('employee.address.location')}
                onReportsToClick={(id: any) => openSubordinates(id)}
                data={item}
                searchString={searchVal}
                type='location_name'
              /></div>)}

            {dataLoaded && (!employeeList || employeeList.length === 0) && <NoData />}
            {employeeList.length > 0 && searchVal && !userList.length && jobsList && !jobsList.length && locationList && !locationList.length && departmentList && !departmentList.length && <NoResults />}
          </FilteredListContainer>

          {isModalOpen && <EmployeeDirectReportList
            id={chosenEmployee}
            isOpen={isModalOpen}
            setOpen={setModalOpen}
            person={personEmployee()}
          />}
        </div>
      </PageContainer>
      <ExceededModal
        open={exceededModal}
        onClose={() => setExceededModal(false)}
        subscriptionData={data}
      />
    </Fragment>
  );
};

export default People;

const ListDirectoryButtons = styled.div`
  display: flex;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  width: 140px;
  height: 40px;
  border: 1px solid #DCEEE5;
  border-radius: 4px 0px 0px 4px;
  justify-content: center;
  & > span {
    color: #364852;
    font-size: 12px;
    margin-left: 5px;
  }
  &:hover {
    background-color: #DCEEE5;
    color: #339966;
    & path {
      fill: #339966;
    }
  }
  &.navlink_active {
    & > span {
      color: #339966;
    }
    background-color: #DCEEE5;
    & path {
      fill: #339966;
    }
  }
`;

const StyledCloseIcon = styled(CloseIcon)`
  cursor: pointer;
  margin-right: 5px;
  width: 14px;
  height: 14px;
  & path {
    fill: #636363;
  }
`;

const PageContainer = styled.div`
`;

const PageHeaderContainer = styled.div<{ $enableHeaderShadow: boolean }>`
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #FFF;
  box-shadow: ${({ $enableHeaderShadow }) => $enableHeaderShadow ? '0px 3px 6px #00000029' : 'none'};
  transition: box-shadow 0.2s ease-in-out;
  & > span {
    border-bottom: 1px solid #F2F2F4;
  }
`;

const FilteredListContainerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 14px 60px;
`;

const FilteredListContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 14px 60px;
`;

const FilteredListHeader = styled.div`
  background: #F2F2F4;
  padding: 12px 20px 8px;
  color: var(--footer-dark);
  margin-bottom: 15px;
  font-weight: bold;
  font-size: 11px;
  & > span {
    color: rgba(0, 6, 10, 0.5);
  }
`;

const NoResultsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 130px;
  flex-direction: column;
  & > h4 {
    font-weight: bold;
    margin: 30px 0 20px;
    font-size: 18px;
  }
  & > p {
    font-size: 13px;
    color: var(--dark-gray);
  }
`;