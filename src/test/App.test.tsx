import { render, screen } from '@testing-library/react'

import App from 'src/App'
it('App', () => {
	render(
		<App />
	)
	
	expect(screen.getByText('App')).toBeInTheDocument()
})
