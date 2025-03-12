import { type InternalPath } from './InternalPath';

export type FormKey<T extends Record<string, any> | any[]> = InternalPath<T, false>;

export type FormWatchKey<T extends Record<string, any> | any[]> = InternalPath<T, true>;
