import { useEffect, useState } from "react";
import styled from "styled-components";
import PersonItem from './personItem';
import PermissionGate from "permissions/PermissionGate";

const Wrapper = styled.div` 
  .top-title{
      background: #F2F2F4;
      padding: 12px 20px 8px;
      color: var(--footer-dark);
      margin-bottom: 15px;
      font-weight: bold;
  }

  span.highlight-letter{
    color: #6666FF;
  }
  
  span.highlight-word{
    color:#9999FF;
  }

  span.title{
    color: var(--footer-dark);
  }

  span.length{
    color: rgba(0, 6, 10, 0.5);
  }
`;

interface FilteredListProps {
  data: any,
  title: string,
  searchString: string,
  type: string
  onReportsToClick: any
  titleItems?: any
}

const ReplaceBulk = (str: string, findArray: Array<string>) => {
  let regex = [], regex_s = '';
  for (let i = 0; i < findArray.length; i++) {
    regex.push(findArray[i].replace(/([-[\]{}()*+?.\\^$|#,])/gi, '\\$1'));
  }

  regex_s = regex.join('|');
  str = str.replace(new RegExp(regex_s, 'gi'), function (match: any) {
    return `<span class='highlight-letter'>${match}</span>`
  })
  return str;
}

const FilteredList = ({ data, title, searchString, type, onReportsToClick }: FilteredListProps) => {
  const [highLightedData, setHighlightedData] = useState<any>(null);
  const wordArray = searchString.split(' ').filter((item) => { return item !== '' })

  useEffect(() => {
    let final_str = data.title.split(' ').map((item: string) => {
      if (wordArray.some(element => item.toLowerCase().includes(element.toLowerCase()))) {
        return `<span class='highlight-word'>${ReplaceBulk(item, wordArray)}</span>`
      } else {
        return ReplaceBulk(item, wordArray)
      }
    }).join(' ')
    setHighlightedData(final_str)
  })

  if (!data) {
    return null;
  }

  return (
    <Wrapper>
      <div className='top-title'>
        <span className='title'>{title}</span>: <span dangerouslySetInnerHTML={{ __html: highLightedData }}></span> <span className='length'>({data.values.length})</span>
      </div>
      {data && data.values && data.values.map((item: any) => <div key={item.id}>
        <PermissionGate shouldVisible on="employee" properties={{ disabled: true }}>
          <PersonItem item={item} type={type} onReportsToClick={onReportsToClick} />
        </PermissionGate>
      </div>)}
    </Wrapper>
  );
};

export default FilteredList;
