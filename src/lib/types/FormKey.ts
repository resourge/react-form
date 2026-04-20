import { type InternalPath } from './InternalPath';

export type FormKey<T extends any[] | Record<string, any>> = InternalPath<T, false>;

export type FormWatchKey<T extends any[] | Record<string, any>> = InternalPath<T, true>;
