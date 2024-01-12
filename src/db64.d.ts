export default db64;
declare namespace db64 {
    export function create(name: any, storeNames: any): Promise<void | {
        create: (name: any, storeNames: any) => Promise<void | any>;
        use: (name: any, storeName: any) => {
            set: (key: any, value: any) => Promise<any>;
            setEntries: (value: any) => Promise<any>;
            get: (key: any) => Promise<any>;
            getEntries: (keys: any) => Promise<any>;
            delete: (keys: any) => Promise<any>;
        };
        clear: (name: any, storeName: any) => Promise<any>;
        delete: (name: any) => Promise<any>;
    }>;
    export function use(name: any, storeName: any): {
        set: (key: any, value: any) => Promise<any>;
        setEntries: (value: any) => Promise<any>;
        get: (key: any) => Promise<any>;
        getEntries: (keys: any) => Promise<any>;
        delete: (keys: any) => Promise<any>;
    };
    export function clear(name: any, storeName: any): Promise<any>;
    export function _delete(name: any): Promise<any>;
    export { _delete as delete };
}
//# sourceMappingURL=db64.d.ts.map