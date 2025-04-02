import { useTranslation } from 'react-i18next';

export const useMockData = () => {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  return [
    {
      id: 1,
      amount: '1250145.50',
      earning: locale === 'ka' ? 'წლიური ბონუსი' : 'Annual Bonus',
      effective_date: '2025-03-01',
      end_date: '2024-12-31',
      note: locale === 'ka' ? 'კომენტარი' : 'Comment Text',
      status: 'Planned',
      type: locale === 'ka' ? 'ერთჯერადი' : 'One-Time',
    },
    {
      id: 2,
      amount: '450.50',
      earning: locale === 'ka' ? 'სამივლინებო ხარჯები' : 'Business Trip',
      effective_date: '2024-11-30',
      end_date: null,
      note: '',
      status: 'Current',
      type: locale === 'ka' ? 'ერთჯერადი' : 'One-Time',
    },
    {
      id: 3,
      amount: '-3500.00',
      earning: locale === 'ka' ? 'ტელეფონის ტარიფი' : 'Phone Tarif',
      effective_date: '2024-11-05',
      end_date: null,
      note: '',
      status: 'Finished',
      type: locale === 'ka' ? 'განმეორებადი' : 'Recurring',
    },
    {
      id: 4,
      amount: '3500.00',
      earning: locale === 'ka' ? 'ტელეფონის ტარიფი' : 'Phone Tarif',
      effective_date: '2024-03-21',
      end_date: null,
      note: '',
      status: 'Cancelled',
      type: locale === 'ka' ? 'განმეორებადი' : 'Recurring',
    },
  ];
};
