import { useEffect, useState } from "react";
import { useToasts } from 'react-toast-notifications';
import { useHistory } from "react-router";
import { createEmployee } from "../../services";
import CreatePersonForm from './CreatePersonForm';
import useQuery from "hooks/useQueryCustom";
import { PageHeaderTitle } from 'components/DesignUIComponents';
import ExceededModal from "containers/people/ExceededModal";
import mixpanel from 'mixpanel-browser';
import { useTranslation } from "react-i18next";

const CreatePerson = () => {
  useEffect(() => {
    // mixpanel.track('Create new employee', {
    //   'source': "Profesto",
    //   'Opted out of email': true,
    // });
  }, []);
  const { t } = useTranslation();
  const history = useHistory();
  const { addToast } = useToasts();
  const [errors, setErrors] = useState();
  const [loadingEmployeeCreation, setLoadingEmployeeCreating] = useState<boolean>(false);
  const [exceededModal, setExceededModal] = useState<boolean>(false);

  const { data, refetch, isFetching } = useQuery<any>(["subscription_info_on_press"], {
    endpoint: 'billing/subscription',
    options: { method: "get" },
  }, { enabled: false });

  const onClickNewEmployeeCreate = async () => {
    if (data?.status && data?.status !== 'trialing' && data?.employee_count >= data?.count) {
      setExceededModal(true);
    } else {
      history.push('/createperson');
    }
  };

  const handleCreateEmployee = async (data: any) => {
    const { data: subscriptionData } = await refetch();
    if (subscriptionData?.status && subscriptionData?.status !== 'trialing' && subscriptionData?.employee_count >= subscriptionData?.count) {
      return setExceededModal(true);
    }
    setLoadingEmployeeCreating(true);
    createEmployee(data).then(res => {
      setLoadingEmployeeCreating(false);
      if (res && res.status === 200) {
        addToast(<div><span style={{ fontWeight: 'bold' }}>{t('createPerson.nice_you_have_successfully_added')} {data.first_name} {data.preferred_name && `(${data.preferred_name})`} {data.middle_name} {data.last_name}.</span><br />
          <p style={{ cursor: 'pointer', display: 'inline-block', marginTop: 5, color: 'var(--green)' }} onClick={onClickNewEmployeeCreate}>
            <span style={{ fontSize: 13 }}>+</span> <span style={{ textDecoration: 'underline' }}>{t('createPerson.add_another_employee')}</span>
          </p></div>, { appearance: 'success', autoDismiss: true });
        history.push(`/employee/${res.data.id}`);
      }
    }).catch((err) => {
      setLoadingEmployeeCreating(false);
      setErrors(err.response.data.errors)
    })
  };

  return (
    <div>
      <PageHeaderTitle title={t('createPerson.new_employee')} />
      <CreatePersonForm
        onFormSubmit={handleCreateEmployee}
        propErrors={errors}
        loadingEmployeeCreation={loadingEmployeeCreation || isFetching}
      />
      <ExceededModal
        open={exceededModal}
        onClose={() => setExceededModal(false)}
        subscriptionData={data}
      />
    </div>
  );
};

export default CreatePerson;
