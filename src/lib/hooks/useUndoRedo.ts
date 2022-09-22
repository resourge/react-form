import { useEffect, useRef } from 'react'

import { ProduceNewStateOptionsHistory, Touches } from '../types/types'

type UndoRedoConfig = {
	maxHistory?: number
}

type History<T extends Record<string, any>> = {
	changes: Array<((form: T) => void)>
	produceOptions?: ProduceNewStateOptionsHistory
	touches?: Touches<T>
}

export const useUndoRedo = <T extends Record<string, any>>(
	cb: (history: History<T>, type: 'UNDO' | 'REDO') => void,
	{ maxHistory = 15 }: UndoRedoConfig
) => {
	const historyPipeline = useRef<Array<History<T>>>([]);
	const currentHistory = useRef<number>(-1);

	const addAction = (history: History<T>, type?: 'UNDO' | 'REDO') => {
		switch (type) {
			case 'UNDO':
				if ( currentHistory.current === historyPipeline.current.length ) {
					historyPipeline.current.push(history);
				}
				break;
			case 'REDO':
				// currentHistory.current = currentHistory.current + 1;
				break;
			default:
				currentHistory.current = currentHistory.current + 1;
				historyPipeline.current.splice(currentHistory.current, historyPipeline.current.length)
				historyPipeline.current.push(history);
				if ( maxHistory < historyPipeline.current.length ) {
					historyPipeline.current.pop();
					currentHistory.current = historyPipeline.current.length;
				}
				break;
		}
	}

	const addTouches = (touches: Touches<T>) => {
		if ( historyPipeline.current.length ) {
			historyPipeline.current[historyPipeline.current.length - 1]
			.touches = touches;
		}
	}

	const undo = () => {
		if ( historyPipeline.current.length ) {
			if ( currentHistory.current > -1 ) {
				const history = historyPipeline.current[currentHistory.current];
				if ( history ) {
					cb(history, 'UNDO');
					currentHistory.current = currentHistory.current - 1;
				}
			} 
		}
	}

	const redo = () => {
		if ( historyPipeline.current.length >= (currentHistory.current + 1) ) {
			if ( currentHistory.current > -1 ) {
				const history = historyPipeline.current[currentHistory.current];
				if ( history ) {
					cb(history, 'REDO');
					currentHistory.current = currentHistory.current + 1;
				}
			} 
		}
	}

	useEffect(() => {
		if ( window && window.addEventListener ) {
			const keyDownEvent = (event: KeyboardEvent) => {
				if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
					event.preventDefault();
					event.stopPropagation();
					undo();
				}
				if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
					event.preventDefault();
					event.stopPropagation();
	
					redo();
				}
			}
			window.addEventListener('keydown', keyDownEvent);
	
			return () => {
				window.removeEventListener('keydown', keyDownEvent);
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return {
		addAction,
		addTouches,
		undo,
		redo
	};
}
