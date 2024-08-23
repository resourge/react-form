import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import App from 'src/App';

it('App', () => {
	render(
		<App />
	);
	
	expect(screen.getByText('App'))
	.toBeInTheDocument();
});
