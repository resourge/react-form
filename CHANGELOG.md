## [1.4.6](https://github.com/resourge/react-form/compare/v1.4.5...v1.4.6) (2022-05-23)


### Bug Fixes

* **controller:** update conditions to Controller update ([afa4d23](https://github.com/resourge/react-form/commit/afa4d23a58a2f866f3c64f7994a82047f6db9e1d))

## [1.4.5](https://github.com/resourge/react-form/compare/v1.4.4...v1.4.5) (2022-05-20)


### Bug Fixes

* **rollup.config.js:** rever fix on-change to fix bug with jest not understanding the file ([63da7ed](https://github.com/resourge/react-form/commit/63da7ed6569db7491f12db4956d34aa443e026db))

## [1.4.4](https://github.com/resourge/react-form/compare/v1.4.3...v1.4.4) (2022-05-20)


### Bug Fixes

* **controller.tsx:** fix a bug on controller not updating all of the array items ([5265429](https://github.com/resourge/react-form/commit/5265429a689878d046f632d3f55b06557fd95e2b))
* **rollup.config.js:** fix config not considerating on-change as peerDependency ([d0f99c1](https://github.com/resourge/react-form/commit/d0f99c1e59184159ab1ca6ec58fd084b19c2367f))

## [1.4.3](https://github.com/resourge/react-form/compare/v1.4.2...v1.4.3) (2022-05-09)


### Bug Fixes

* **useform:** onSubmit onlyOnTouch errors are not showing ([7509691](https://github.com/resourge/react-form/commit/7509691aab85c47252ffec92653bd5776555ab2a))

## [1.4.2](https://github.com/resourge/react-form/compare/v1.4.1...v1.4.2) (2022-05-06)


### Bug Fixes

* **createproxy:** fix when creating path on formState, keys maintained references ([67f1ac7](https://github.com/resourge/react-form/commit/67f1ac7195692d63d4f66be4b0998bd0668b6be5))

## [1.4.1](https://github.com/resourge/react-form/compare/v1.4.0...v1.4.1) (2022-05-06)


### Bug Fixes

* **controllercontext:** fix type giving error ([b8824b4](https://github.com/resourge/react-form/commit/b8824b4d145d8ef4e83a3c8185f27ad21ed260c2))

# [1.4.0](https://github.com/resourge/react-form/compare/v1.3.3...v1.4.0) (2022-05-06)


### Features

* **useform:** create formState to have information on the form data ([ac60b92](https://github.com/resourge/react-form/commit/ac60b92dfac76f38826faea10a2ae24f13a76d29))

## [1.3.3](https://github.com/resourge/react-form/compare/v1.3.2...v1.3.3) (2022-05-05)


### Bug Fixes

* **types:** fix types ([b8cbbd3](https://github.com/resourge/react-form/commit/b8cbbd3045495f8cb0d530a4eea9399d617e8b58))

## [1.3.2](https://github.com/resourge/react-form/compare/v1.3.1...v1.3.2) (2022-05-05)


### Bug Fixes

* **formcontext:** fix type not matching ([7020bcf](https://github.com/resourge/react-form/commit/7020bcfcdf2847615d2bbbf243a1b2b85d38e63c))
* **useerrors:** fix hasError cache key and fix FormNestedErrors to show optionals ([ba6858e](https://github.com/resourge/react-form/commit/ba6858e1a4bb9ddac6c11b18a3e30961045456b7))

## [1.3.1](https://github.com/resourge/react-form/compare/v1.3.0...v1.3.1) (2022-05-04)


### Bug Fixes

* **useform:** fix reset not updating Controller ([321328b](https://github.com/resourge/react-form/commit/321328b29a1015134257fd03fc77d781f05cc043))

# [1.3.0](https://github.com/resourge/react-form/compare/v1.2.0...v1.3.0) (2022-05-04)


### Bug Fixes

* **controller.tsx:** fix bug on controller not updating if validation found error on it's key ([bb5007e](https://github.com/resourge/react-form/commit/bb5007eacb1366c255952064572ab2ed0d730275))
* fix missing alert if doens't have any setDefaultOnError defined ([f184858](https://github.com/resourge/react-form/commit/f1848582ef42bb86f77894519f2cdb739294e034))
* **useform:** fix bug where useCancelableState was calling initialState twice ([a7e4e1b](https://github.com/resourge/react-form/commit/a7e4e1b8220f9d13f4821b39bea5c3c35a788aa1))


### Features

* **useform:** add validateDefault ([28a3709](https://github.com/resourge/react-form/commit/28a37097bff380a21a1b47e640593bb2d0d3297c))
* **useform:** improve error system ([a7a2db2](https://github.com/resourge/react-form/commit/a7a2db27d98df0b1bdb61fc528d52a2d052d959b))
* **useform:** improve errors with hasError and simplift getErrors ([8e31f1f](https://github.com/resourge/react-form/commit/8e31f1f43938f969c6d7cd0d89f3612c32db395a))

# [1.2.0](https://github.com/resourge/react-form/compare/v1.1.0...v1.2.0) (2022-04-26)


### Features

* **controller:** add useController ([fd4bfa0](https://github.com/resourge/react-form/commit/fd4bfa009f47a344d448ce12ff13b2996bcf46c0))

# [1.1.0](https://github.com/resourge/react-form/compare/v1.0.2...v1.1.0) (2022-04-22)


### Features

* **controller.tsx:** add Controller component ([f24ff64](https://github.com/resourge/react-form/commit/f24ff6437659c10e17a7596879f2ef4ac7f68405))

## [1.0.2](https://github.com/resourge/react-form/compare/v1.0.1...v1.0.2) (2022-04-21)


### Bug Fixes

* **rollup.config.js:** update rollup config to not transform async/await ([760c060](https://github.com/resourge/react-form/commit/760c060a0bf7b0e138767332e62de94974d53963))

## [1.0.1](https://github.com/resourge/react-form/compare/v1.0.0...v1.0.1) (2022-04-20)


### Bug Fixes

* **rollup.config.js:** change rollup config to also include ?. and ?? transforms ([3316883](https://github.com/resourge/react-form/commit/331688399a02fcbf2c50738b3bef6b4354ea8261))

# 1.0.0 (2022-04-20)


### Features

* **project:** First release ([3b8a57d](https://github.com/resourge/react-form/commit/3b8a57d5044b9940a705782784f0c6a26787431a))
