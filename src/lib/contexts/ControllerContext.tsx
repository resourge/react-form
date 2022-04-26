/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { createContext, useContext } from 'react'

import invariant from 'tiny-invariant'

import { FormState, FieldForm } from '../types/types'

export const ControllerContext = createContext<{
	field: FieldForm
	formState: FormState<any>
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
}>(null!);

export const useController = <T extends object>(): {
	field: FieldForm
	formState: FormState<T>
} => {
	const context = useContext(ControllerContext)

	invariant(context, 'useControllerContext can only be used in the context of a <Controller> component.')

	return context
}
