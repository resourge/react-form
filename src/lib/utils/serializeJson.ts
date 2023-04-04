import * as serialijse from 'serialijse';

/**
 * Serializes object into json
 * @param state 
 * @returns string
 */
export const stringify = <T extends object>(state: T): string => {
	return serialijse.serialize(state)
}

/**
 * Deserializes string json into object
 * @param state 
 * @returns string
 */
export const parse = <T extends object>(serializedState: string): T => {
	return serialijse.deserialize<T>(serializedState);
}
