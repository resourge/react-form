
import appRootPath from 'app-root-path';
import { readFileSync, readdirSync } from 'fs';
import { globSync } from 'glob';
import { join } from 'path';

import PackageJson from '../package.json';

const workspaces = (PackageJson as unknown as { workspaces: string[] }).workspaces ?? []

export const getWorkspaces = () => {
	return workspaces
	.filter((workspace) => !workspace.startsWith('!'))
	.map((workspace) => {
		const root = join(appRootPath.path, workspace.substring(1).replace(/\*/g, ''));

		return readdirSync(
			root, 
			{
				withFileTypes: true 
			}
		)
		.filter(dirent => dirent.isDirectory())
		.map(dirent => join(root, dirent.name))
	}).flat();
}

export const packages = getWorkspaces().map((workspace) => 
	globSync(
		`${workspace}/**`
	)
	.filter((path) => path.includes('package.json'))
	.map((path) => ({
		...JSON.parse(
			readFileSync(path, 'utf-8')
		),
		path
	}) as const)
)
.flat();
