import ORM from "../interfaces/ORM";
import ORMModel from "../interfaces/ORMModel";
declare let attributes: {
    /** ID */
    id: string;
    /** Название улицы */
    name: string;
    /** Признак того что улица удалена */
    isDeleted: boolean;
    customData: string | {
        [k: string]: string | number | boolean;
    };
};
declare type attributes = typeof attributes;
interface Street extends attributes, ORM {
}
export default Street;
declare let Model: {
    beforeCreate(streetInit: any, next: any): void;
};
declare global {
    const Street: typeof Model & ORMModel<Street>;
}
