import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';

import PackageJson from '../package.json';

const { license, author } = PackageJson;

function getBanner(libraryName: string, version: string, authorName: string, license: string) {
	return `/**
 * ${libraryName} v${version}
 *
 * Copyright (c) ${authorName}.
 *
 * This source code is licensed under the ${license} license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license ${license}
 */`;
}

export function createBanner() {
	const meta = {
		...import.meta
	}
	const folderName = dirname(meta.url.replace('file://', ''))

	const { name, version } = JSON.parse(
		readFileSync(resolve(folderName, './package.json'), 'utf-8')
	) as typeof PackageJson
	
	return getBanner(name, process.env.PROJECT_VERSION ?? version, author, license);
}
