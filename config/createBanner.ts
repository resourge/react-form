import PackageJson from '../package.json';

const { name, version, license, author } = PackageJson;

function getBanner(version: string) {
	return `/**
 * ${name} v${version}
 *
 * Copyright (c) ${author}.
 *
 * This source code is licensed under the ${license} license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license ${license}
 */`;
}

export function createBanner() {
	return getBanner(process.env.PROJECT_VERSION ?? version);
}
