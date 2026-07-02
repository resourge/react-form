import appRootPath from 'app-root-path';
import { globSync } from 'glob';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import PackageJson from '../package.json';

const workspaces = (PackageJson as unknown as { workspaces: string[] }).workspaces ?? [];

export const getWorkspaces = () => {
	return workspaces
	.filter((workspace) => !workspace.startsWith('!'))
	.flatMap((workspace) => {
		const root = path.join(appRootPath.path, workspace.slice(1).replaceAll('*', ''));

		return readdirSync(
			root, 
			{
				withFileTypes: true 
			}
		)
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => path.join(root, dirent.name));
	});
};

export const packages = getWorkspaces().flatMap((workspace) => 
	globSync(
		`${workspace}/**`
	)
	.filter((filePath) => filePath.includes('package.json'))
	.map((path) => ({
		...JSON.parse(
			readFileSync(path, 'utf8')
		),
		path
	}) as const)
);
