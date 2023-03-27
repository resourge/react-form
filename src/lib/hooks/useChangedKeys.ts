import { useRef } from 'react';

import { type FormKey, type Touches } from '../types';

export const useChangedKeys = <T extends Record<string, any>>(touches: Touches<T>) => {
	const changedKeys = useRef<Set<FormKey<T>>>(new Set());
	const updateController = (key: FormKey<T>) => {
		changedKeys.current.add(key)
	}
	/*
		BUG - 1
		Isto é a fix para react native em que ao clicar e alterar um valor se 
		clicar fora do 'keyboard' para selecionar outro campo e depois se clicar em submeter ('handleSubmit' do useFormSplitter)
		aparecer os erros em todos os campos da step onde estou.
		Antes se fizer enable deste useEffect cada se clicasse em submeter ele nao aparecia os erros no ecra
		agora se comentar o useEffect já funciona direitinho  
	*/

	// useEffect(() => {
	// 	changedKeys.current.clear();
	// }, [touches]);

	return [changedKeys, updateController] as const
}
