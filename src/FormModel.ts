import * as yup from 'yup'

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

const schema = yup.object().shape({
	name: yup.string().required(),
	list: yup.array(yup.object().shape({
		label: yup.string().required(),
		isAdmin: yup.boolean(),
		isCustomer: yup.boolean()
	}))
})

export const useFormModel = (form: FormModelType) => {
	return useForm<FormModel>(
		new FormModel(form),
		{
			validate: async (form: FormModel) => {
				await schema.validate(form, {
					abortEarly: false
				})
			},
			isValid: (form) => schema.isValidSync(form)
		}
	)
}

export default FormModel
