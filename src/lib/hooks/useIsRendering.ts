import { useLayoutEffect, useRef } from 'react';

export const useIsRendering = () => {
	const isRenderingRef = useRef(true);
	isRenderingRef.current = true;
	useLayoutEffect(() => {
		isRenderingRef.current = false;
	});

	return isRenderingRef;
};
