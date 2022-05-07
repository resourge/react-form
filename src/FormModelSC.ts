import { compile, isValid, v as st } from 'suretype'

import { useForm } from './lib'

export type ListItemType = {
	label: string
	isAdmin: boolean
	isCustomer: boolean
}

export class ListItemModel {
	label: string = ''
	isAdmin: boolean = false
	isCustomer: boolean = false

	constructor(model?: ListItemType) {
		if (model) {
			this.label = model.label
			this.isAdmin = model.isAdmin
			this.isCustomer = model.isCustomer
		}
	}
}

export type FormModelType = {
	name: string
	list: ListItemType[]
}

class FormModel {
	name: string = ''
	list: ListItemModel[] = []
	constructor(model?: FormModelType) {
		if (model) {
			this.name = model.name
			this.list = model.list.map((item) => new ListItemModel(item))
		}
	}
}

const schema = st.object({
	name: st.string().required(),
	list: st.array(st.object({
		label: st.string().required(),
		isAdmin: st.boolean(),
		isCustomer: st.boolean()
	}))
})

export const useFormModel = (form: FormModelType) => {
	return useForm<FormModel>(
		new FormModel(form),
		{
			validate: async (form: FormModel) => {
				const schemaValidator = compile( schema );
				console.log('data', schemaValidator(form))
				await schemaValidator(form)
			},
			isValid: (form) => isValid(schema, form)
		}
	)
}

export default FormModel
