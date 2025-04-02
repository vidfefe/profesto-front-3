export const changeColumns = (fields?: any, columns?: any): any => {
    
    const newColumns = columns.filter((item: any) => {
       
        return !fields.some((id: any) => item.field === id);
    });

    return newColumns;
}

