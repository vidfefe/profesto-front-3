// Auth Selectors 
export const authSelector = state => state.auth;

export const domainSelector = state => state.auth.domain;

export const tokenSelector = state => state.auth.token;

export const currentUserSelector = state => state.auth.currentUser;

// Creation

export const newDepartmentSelector = state => state.creationSlice.newDepartment;

export const newDivisionSelector = state => state.creationSlice.newDivision;

export const newLocationSelector = state => state.creationSlice.newLocation;

export const newJobTitleSelector = state => state.creationSlice.newJobTitle;

export const newNationalitySelector = state => state.personSlice.newNationality;

export const newEmploymentStatusSelector = state => state.creationSlice.newEmploymentStatus;

export const newPaymentTypeSelector = state => state.creationSlice.newPaymentType;

export const newPaymentScheduleSelector = state => state.creationSlice.newPaymentSchedule;



// User  

export const personSelector = state => state.personSlice.person;

export const firstNameSelector = state => state.personSlice.firstName;

export const lastNameSelector = state => state.personSlice.lastName;

export const preferredNameSelector = state => state.personSlice.preferredName;

export const middleNameSelector = state => state.personSlice.middleName;

export const hireDateSelector = state => state.personSlice.hireDate;

export const personActiveTabSelector = state => state.personSlice.activeTab;

export const payrollActiveTabSelector = state => state.personSlice.payrollActiveTab;

export const peopleDirPathSelector = state => state.personSlice.peopleDirPath;

export const jobInfoSelector = state => state.personSlice.jobInfo;

export const loadingOverlaySelector = state => state.personSlice.overlayLoading;

// Actions
export const updateJobOpenSelector = state => state.actionSlice.isUpdateJobOpen;

export const updateCompensationSelector = state => state.actionSlice.isUpdateCompensationOpen;

export const isTerminationOpenSelector = state => state.actionSlice.isTerminationOpen;

export const clearFilterValueSelector = state => state.actionSlice.clearFilterValue;


//Errors
export const globalErrorSelector  = state => state.errorSlice.error;

// Company
export const companyFeaturesSelector  = state => state.companySlice.features;
