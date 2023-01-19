# [1.14.0](https://github.com/resourge/react-form/compare/v1.13.0...v1.14.0) (2023-01-19)


### Bug Fixes

* **types/index:** export all types included in previou commit ([525e03e](https://github.com/resourge/react-form/commit/525e03e798ec533a1a47a8317e1ecba30042806a))


### Features

* **types/types:** add resetMethod type ([f883040](https://github.com/resourge/react-form/commit/f883040bceee8c30cb7095611ffe07b5e07c87dc))

# [1.13.0](https://github.com/resourge/react-form/compare/v1.12.1...v1.13.0) (2023-01-02)


### Features

* **useform:** make so defaultValue can be set using a method ([a142a17](https://github.com/resourge/react-form/commit/a142a1705324106430a91beb380cf758f8641ea1))

## [1.12.1](https://github.com/resourge/react-form/compare/v1.12.0...v1.12.1) (2023-01-02)


### Bug Fixes

* **useform:** fix a bug where using class directly instead of a class value would not work ([ebe128a](https://github.com/resourge/react-form/commit/ebe128aac38e12921dd3c4c6beb59fca11afa1a1))

# [1.12.0](https://github.com/resourge/react-form/compare/v1.11.1...v1.12.0) (2022-11-21)


### Features

* **useform:** simplift useForm creation by being able to directly use a class ([9766264](https://github.com/resourge/react-form/commit/9766264bd91ba03dbddba873d3bb1830db0d5738))

## [1.11.1](https://github.com/resourge/react-form/compare/v1.11.0...v1.11.1) (2022-10-27)


### Bug Fixes

* **createformerrors:** fix  (intermediate value) when error was an empty string ([8197b9f](https://github.com/resourge/react-form/commit/8197b9f69d65320752161c92e82f1ae469fb0071))

# [1.11.0](https://github.com/resourge/react-form/compare/v1.10.6...v1.11.0) (2022-10-27)


### Bug Fixes

* **useerrors:** update checkfIfcanCheckError to not need mandatory onlyOnTouch ([c7de0a4](https://github.com/resourge/react-form/commit/c7de0a4e3977e23b4c223dcaab02a6e464a160f6))


### Features

* **useerrors:** add onlyontouchdefault, onlyontouch defaults to true ([da47694](https://github.com/resourge/react-form/commit/da47694394dcb1b2e64a621438ac97ff5dad29b0))

## [1.10.6](https://github.com/resourge/react-form/compare/v1.10.5...v1.10.6) (2022-10-26)


### Bug Fixes

* **createformerrors:** fix only saving last error when for the same camp where provided ([9e4e7b2](https://github.com/resourge/react-form/commit/9e4e7b2f6d3e89ac21c48d8f433bb603b160c81b))

## [1.10.5](https://github.com/resourge/react-form/compare/v1.10.4...v1.10.5) (2022-08-29)


### Bug Fixes

* **usefixcursorjumpingtoend:** fix bug when copy past text ([58804ae](https://github.com/resourge/react-form/commit/58804ae4e1e71840a4d69739a712a34942f7214a))

## [1.10.4](https://github.com/resourge/react-form/compare/v1.10.3...v1.10.4) (2022-08-26)


### Bug Fixes

* **useform:** fix onchange when tagName was undefined ([d9e749e](https://github.com/resourge/react-form/commit/d9e749ed35a7e3eba720a6e3693df609179d1372))

## [1.10.3](https://github.com/resourge/react-form/compare/v1.10.2...v1.10.3) (2022-08-25)


### Bug Fixes

* **usefixcursorjumpingtoend:** fix delete wrong position ([01fbf07](https://github.com/resourge/react-form/commit/01fbf070ad41bad29f546913f55d86ebe4681727))

## [1.10.2](https://github.com/resourge/react-form/compare/v1.10.1...v1.10.2) (2022-07-20)


### Bug Fixes

* **userfixcursorjumpingtoend:** whitelist for input types when supported cursor ([88d5a3e](https://github.com/resourge/react-form/commit/88d5a3eb73fa043ce20d98afb70ba82a0cad24f1))

## [1.10.1](https://github.com/resourge/react-form/compare/v1.10.0...v1.10.1) (2022-07-19)


### Bug Fixes

* **usefixcursorjumpoingtoend:** fix input number position cursor ([64e132c](https://github.com/resourge/react-form/commit/64e132c1222391d101842c4fc213cebf93579916))

# [1.10.0](https://github.com/resourge/react-form/compare/v1.9.0...v1.10.0) (2022-06-29)


### Features

* **useform:** add blur option for field ([a599e32](https://github.com/resourge/react-form/commit/a599e3279cbb403df88ea788f80ff8fec5b379f9))

# [1.9.0](https://github.com/resourge/react-form/compare/v1.8.6...v1.9.0) (2022-06-29)


### Features

* **useform:** by default validateDefault is true now ([4a7d70a](https://github.com/resourge/react-form/commit/4a7d70aca6086df8f34984233450236913a40bfb))

## [1.8.6](https://github.com/resourge/react-form/compare/v1.8.5...v1.8.6) (2022-06-28)


### Bug Fixes

* **useform:** forceValidation will no longer clear errors on reset ([23538af](https://github.com/resourge/react-form/commit/23538af7e706668dffe91caa23b2f017ffcb545e))


### Reverts

* **useform:** revert previous change ([3634123](https://github.com/resourge/react-form/commit/36341230ad9eb2905f91ab5dd4c33c84fe1e38a2))

## [1.8.5](https://github.com/resourge/react-form/compare/v1.8.4...v1.8.5) (2022-06-27)


### Bug Fixes

* **usefixcursorjumpingtoend:** fix a bug where enter and backspace didn't fix the cursor ([1a8f24c](https://github.com/resourge/react-form/commit/1a8f24c8218986153089e014097aadcbef5ac920))

## [1.8.4](https://github.com/resourge/react-form/compare/v1.8.3...v1.8.4) (2022-06-23)


### Bug Fixes

* **useform:** fix on submit errors not showing ([39a1af5](https://github.com/resourge/react-form/commit/39a1af55563c774c137f6b71cee213f5c58df8c9))

## [1.8.3](https://github.com/resourge/react-form/compare/v1.8.2...v1.8.3) (2022-06-22)


### Performance Improvements

* **useform:** remove unecessary initial form validation ([1395c1c](https://github.com/resourge/react-form/commit/1395c1c2ac32b5ea962bca1e8615c365f63fb448))

## [1.8.2](https://github.com/resourge/react-form/compare/v1.8.1...v1.8.2) (2022-06-20)


### Bug Fixes

* **usefrom:** remove mandatory onErrors ([3c7962a](https://github.com/resourge/react-form/commit/3c7962a87475d282703307d256788555a7cbf835))

## [1.8.1](https://github.com/resourge/react-form/compare/v1.8.0...v1.8.1) (2022-06-09)


### Bug Fixes

* **useform:** fix Cannot read properties of null (reading 'currentTarget') ([cbefc9a](https://github.com/resourge/react-form/commit/cbefc9a4450eac9d8e41575bd15dcb6a14f32dd0))

# [1.8.0](https://github.com/resourge/react-form/compare/v1.7.4...v1.8.0) (2022-06-08)


### Bug Fixes

* **useform:** fix cursor jumping automatically ([9099581](https://github.com/resourge/react-form/commit/9099581f04ac373cc5e0b19a23370cce9a2d444f))


### Features

* **redo and undo:** add redo and undo to help the user to backtrack changes ([91c255e](https://github.com/resourge/react-form/commit/91c255e6acac6014a10377521fc3d7107c02b5c9))

## [1.7.4](https://github.com/resourge/react-form/compare/v1.7.3...v1.7.4) (2022-06-07)


### Performance Improvements

* **useform:** instead of having to use isNativeEvent, useForm will do it automatically ([584f3fe](https://github.com/resourge/react-form/commit/584f3fe4f11ec3385ced8edc48da6c183762854a))

## [1.7.3](https://github.com/resourge/react-form/compare/v1.7.2...v1.7.3) (2022-06-07)


### Bug Fixes

* **types.ts:** change from LegacyRef to Ref ([a317d1d](https://github.com/resourge/react-form/commit/a317d1d64355c5380a88c54c623f098b9c43f6ab))

## [1.7.2](https://github.com/resourge/react-form/compare/v1.7.1...v1.7.2) (2022-06-07)


### Bug Fixes

* **useform field:** add way to prevent input cursor jumping to end ([a396c69](https://github.com/resourge/react-form/commit/a396c6987fb4f4c5b13fa804a5ba363f3c5a6015))

## [1.7.1](https://github.com/resourge/react-form/compare/v1.7.0...v1.7.1) (2022-06-06)


### Performance Improvements

* **useform:** add isTouched in isValid method ([2e57507](https://github.com/resourge/react-form/commit/2e5750722103c99c3319531d2a45548ec7011121))

# [1.7.0](https://github.com/resourge/react-form/compare/v1.6.1...v1.7.0) (2022-06-06)


### Features

* **useform:** add direct compatibility with @resourge/schema ([1f693ab](https://github.com/resourge/react-form/commit/1f693ab9c7f33d83e6c914a4f4689f58d74f88d0))

## [1.6.1](https://github.com/resourge/react-form/compare/v1.6.0...v1.6.1) (2022-05-31)


### Bug Fixes

* **package.json:** remove preinstall from scripts ([0dd65bc](https://github.com/resourge/react-form/commit/0dd65bce45bb1ce2d863f0af61d824fda4567b6c))

# [1.6.0](https://github.com/resourge/react-form/compare/v1.5.1...v1.6.0) (2022-05-31)


### Features

* **useform:** add updateController method ([09691ac](https://github.com/resourge/react-form/commit/09691ac42e5aeec192893f2f371255a4c54fae73))

## [1.5.1](https://github.com/resourge/react-form/compare/v1.5.0...v1.5.1) (2022-05-30)


### Bug Fixes

* **package:** remove shallow-clone from peerDependecies ([cff839a](https://github.com/resourge/react-form/commit/cff839a009dd30f49919c7aa6b47f48ddf1bda66))

# [1.5.0](https://github.com/resourge/react-form/compare/v1.4.8...v1.5.0) (2022-05-30)


### Features

* **usewatch:** make each "watch" run synchronous ([5e12c54](https://github.com/resourge/react-form/commit/5e12c543d53c13aeea10e8e63d83e3ef9db28fab))
* **usewatch:** watch: method to update values when key is touched ([f8e4971](https://github.com/resourge/react-form/commit/f8e4971e144d1eb12d761cf67208669af8d6753e))

## [1.4.8](https://github.com/resourge/react-form/compare/v1.4.7...v1.4.8) (2022-05-25)


### Bug Fixes

* **useerrors:** when includeChildsIntoArray is true strick will automatically be false ([f6d2c47](https://github.com/resourge/react-form/commit/f6d2c473a7c39cd462756ce9481f76d55c599392))

## [1.4.7](https://github.com/resourge/react-form/compare/v1.4.6...v1.4.7) (2022-05-25)


### Bug Fixes

* **controller:** fix controller not updating in specific situations ([876a050](https://github.com/resourge/react-form/commit/876a0505f16fe405318fcc58c2009f259989f334))

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
