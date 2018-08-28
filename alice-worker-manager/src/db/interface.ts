export interface FilterParams {
  filter?: string | ((doc: any, req: any) => boolean);
  onChange?: (value: PouchDB.Core.ChangesResponseChange<{}>) => any;
  [key: string]: any;
}

export interface DBConnectorInterface {
  use(name: string): DBInterface;
}

export type ID = string;

export interface DBInterface {
  get(id: ID, params?: any): Promise<Document>;
  getOrNull(id: ID, params?: any): Promise<Document | null>;
  list(params?: any): Promise<any>;
  put(doc: Document): Promise<any>;
  remove(id: ID, rev: string): Promise<any>;
  view(design: string, view: string, params: any): Promise<any>;
  follow(params: FilterParams): void;
}
