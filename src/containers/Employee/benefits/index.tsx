import React from 'react';

import { Dependents } from './Dependents';
import { Benefits as Presentation} from './Benefits/Benefits';
import { Person } from 'types';

interface BenefitsProps {
  disabled: boolean;
  person: Person;
}

export const Benefits = ({ disabled, person }: BenefitsProps) => {
  return (
    <div style={{ fontSize: 11 }}>
      <Presentation disabled={disabled} person={person} />
      <Dependents disabled={disabled} person={person} />
    </div>
  );
};
