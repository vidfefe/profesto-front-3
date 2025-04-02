import { some, filter } from "lodash";

export const region = (regions?: any): any => {
    const findRegeion = some(regions, (x) => {
        return x === process.env.REACT_APP_REGIONALIZE
    });

    return findRegeion;
};
