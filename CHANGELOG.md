## [1.28.6](https://github.com/resourge/react-form/compare/v1.28.5...v1.28.6) (2024-12-04)


### Bug Fixes

* **useerrors:** fix getErrors not working in some specific situations ([6eed814](https://github.com/resourge/react-form/commit/6eed8142d4a063d6100e606d45af744c5384ed1b))

## [1.28.5](https://github.com/resourge/react-form/compare/v1.28.4...v1.28.5) (2024-12-04)


### Bug Fixes

* **setupjsonform:** fix generic type ([b20c8ef](https://github.com/resourge/react-form/commit/b20c8efbeb2fdeef05fbb461b903a5a764944139))
* **useerrors:** fix getErrors not getting errors from the children ([afaaee5](https://github.com/resourge/react-form/commit/afaaee54eb5cd92f64e4e4b4f620d272f8e72866))

## [1.28.4](https://github.com/resourge/react-form/compare/v1.28.3...v1.28.4) (2024-12-04)


### Bug Fixes

* **usefrom:** fix getErrors with includeChildsIntoArray not working as intended ([0da450a](https://github.com/resourge/react-form/commit/0da450ad2db695b809d89a6dcc157430ae74dbf9))

## [1.28.3](https://github.com/resourge/react-form/compare/v1.28.2...v1.28.3) (2024-12-04)


### Bug Fixes

* **useformsplitter:** fix useFormSplitter not outputing the correct errors ([2564e61](https://github.com/resourge/react-form/commit/2564e6133c618520cc1d7bde2992195d49e7d0f2))

## [1.28.2](https://github.com/resourge/react-form/compare/v1.28.1...v1.28.2) (2024-11-27)


### Bug Fixes

* **useformsplitter:** fix context, remove splitterContext and add originalContext ([523ca4f](https://github.com/resourge/react-form/commit/523ca4f1b26cd375a18fbf978ac4a56f7ef1b55d))

## [1.28.1](https://github.com/resourge/react-form/compare/v1.28.0...v1.28.1) (2024-11-25)


### Bug Fixes

* **useform:** fix getValue not working when trying to access array element ([09fc540](https://github.com/resourge/react-form/commit/09fc54053c7a288c6d569d3b7474baf29f19aad7))

# [1.28.0](https://github.com/resourge/react-form/compare/v1.27.1...v1.28.0) (2024-10-07)


### Features

* **useform:** change getter and setter to be done in the proxy ([f4788e3](https://github.com/resourge/react-form/commit/f4788e3b43b61a0db55cee98a9e92790a4b959a9))

## [1.27.1](https://github.com/resourge/react-form/compare/v1.27.0...v1.27.1) (2024-10-03)


### Bug Fixes

* **observeobject:** fix not working with File ([2c9c5af](https://github.com/resourge/react-form/commit/2c9c5afc30c400395442be449a9d4a0f519ada9d))

# [1.27.0](https://github.com/resourge/react-form/compare/v1.26.1...v1.27.0) (2024-09-27)


### Features

* **useform:** on submit, validate will also include * on changedKeys for validation ([4694884](https://github.com/resourge/react-form/commit/469488439f19488259a834100658ec25740b82cb))

## [1.26.1](https://github.com/resourge/react-form/compare/v1.26.0...v1.26.1) (2024-09-17)


### Performance Improvements

* **project:** improve readability, optimize and reduce code ([980bc1b](https://github.com/resourge/react-form/commit/980bc1b6e0a5bbfee45bb44420c1e898000da23b))

# [1.26.0](https://github.com/resourge/react-form/compare/v1.25.0...v1.26.0) (2024-09-04)


### Bug Fixes

* **setupjsonform:** fix type ([23f32c4](https://github.com/resourge/react-form/commit/23f32c44ed1f1d35688ef89fb32c7888609b9fbf))
* **useerror:** fix sometimes not updating the error ([85896d2](https://github.com/resourge/react-form/commit/85896d225fbfa30860efabc17ae3c5735e1b44fb))
* **useform:** fix handleSubmit not triggering update to show errors ([e8ba390](https://github.com/resourge/react-form/commit/e8ba39064e151fe0f66622f30b82141c32564e31))


### Features

* **useform:** change form from useForm to reactive ([c8a32e5](https://github.com/resourge/react-form/commit/c8a32e5851a399331b3ddb1b1d9fb5c5608d70ab))
* **useform:** make form reactive ([b978e6e](https://github.com/resourge/react-form/commit/b978e6e5083319a2476b1296c4d29e456cbdf274))

# [1.25.0](https://github.com/resourge/react-form/compare/v1.24.8...v1.25.0) (2024-07-08)


### Features

* **index.ts's:** change to export, update @resourge/shallow-clone and remove tiny-invariant ([7cea40a](https://github.com/resourge/react-form/commit/7cea40a08c9fc93f6b14a9dbaad139a9d5cb74d1))

## [1.24.8](https://github.com/resourge/react-form/compare/v1.24.7...v1.24.8) (2024-04-22)


### Performance Improvements

* **useform:** removes unnecessary code ([2e1fa21](https://github.com/resourge/react-form/commit/2e1fa21833a0321e5c3eb1bafc849e2eff21d82d))

## [1.24.7](https://github.com/resourge/react-form/compare/v1.24.6...v1.24.7) (2024-01-03)


### Bug Fixes

* **on-change:** fix Date sometimes giving an error ([c24f9f0](https://github.com/resourge/react-form/commit/c24f9f0374eeca481f09007be2ba7dd6bbc5e480))

## [1.24.6](https://github.com/resourge/react-form/compare/v1.24.5...v1.24.6) (2024-01-02)


### Bug Fixes

* **package.json:** use npx on postinstall to fix patch-package not working in repositories ([3c5ad42](https://github.com/resourge/react-form/commit/3c5ad42e6a2b59bd1fd0780fe2d2e92c0b9625cd))

## [1.24.5](https://github.com/resourge/react-form/compare/v1.24.4...v1.24.5) (2024-01-02)


### Bug Fixes

* **package.json:** fix postinstall ([51203a0](https://github.com/resourge/react-form/commit/51203a0e64e218b6d3bf6d3aa3160804fc7697ea))

## [1.24.4](https://github.com/resourge/react-form/compare/v1.24.3...v1.24.4) (2024-01-02)


### Bug Fixes

* **package.json:** change postinstall to local ([c08034a](https://github.com/resourge/react-form/commit/c08034ab916936d34fe21633f9162a11a0c755e9))

## [1.24.3](https://github.com/resourge/react-form/compare/v1.24.2...v1.24.3) (2023-10-18)


### Bug Fixes

* **__dev__:** replace __DEV__ with env ([2302645](https://github.com/resourge/react-form/commit/23026457168048c24c9ad92a1cdefa21a62f9958))
* **formkey:** prevent circular dependency ([13ff9b3](https://github.com/resourge/react-form/commit/13ff9b31758ebce617edde85a05b282e381a706b))

## [1.24.2](https://github.com/resourge/react-form/compare/v1.24.1...v1.24.2) (2023-09-05)


### Bug Fixes

* **formkeys:** fix RecursiveKey on file, date, etc ([0ef8538](https://github.com/resourge/react-form/commit/0ef853881bff6572d3de3d1f415b52363f325d62))

## [1.24.1](https://github.com/resourge/react-form/compare/v1.24.0...v1.24.1) (2023-08-25)


### Bug Fixes

* **useform:** fix a bug where elements Date in form where not working on watch ([d8c6a67](https://github.com/resourge/react-form/commit/d8c6a6790add1f13afe8899c34635bd6f14bd478))

# [1.24.0](https://github.com/resourge/react-form/compare/v1.23.0...v1.24.0) (2023-07-18)


### Features

* **useform:** add validateOnlyAfterFirstSubmit to useForm ([74e79d2](https://github.com/resourge/react-form/commit/74e79d257e8c816ac568520404e0169c8a3cf9bb))

# [1.23.0](https://github.com/resourge/react-form/compare/v1.22.2...v1.23.0) (2023-07-10)


### Features

* **types:** redo documentation and update types to better match ([d1a5a45](https://github.com/resourge/react-form/commit/d1a5a451add3639a98356c9b9b8b352affbe61ec))

## [1.22.2](https://github.com/resourge/react-form/compare/v1.22.1...v1.22.2) (2023-06-14)


### Bug Fixes

* **deserialize:** fix invalid validation for undefined value on deserializeMeta ([e6604cb](https://github.com/resourge/react-form/commit/e6604cb10fe66879ae1c8e31ea5f101fb0e2512f))

## [1.22.1](https://github.com/resourge/react-form/compare/v1.22.0...v1.22.1) (2023-04-27)


### Bug Fixes

* **deserialize:** add className param to registerClass for custom naming ([baf5a57](https://github.com/resourge/react-form/commit/baf5a5741b64133e5b9b0b4ebdb0d2dd67ce237f))

# [1.22.0](https://github.com/resourge/react-form/compare/v1.21.0...v1.22.0) (2023-04-14)


### Features

* **serialize:** change from serialise package to intern version ([98f8db9](https://github.com/resourge/react-form/commit/98f8db9bbc9dc27fd566c983e299f04fa93a8179))
* **serializejson:** export the parse and stringify function to serialize ([2d1caf6](https://github.com/resourge/react-form/commit/2d1caf6d82be25683d6cf01dbddfcd8e142787e3))

# [1.21.0](https://github.com/resourge/react-form/compare/v1.20.0...v1.21.0) (2023-04-03)


### Bug Fixes

* **useerrors:** fix errors not showing inside controllers ([17ebed7](https://github.com/resourge/react-form/commit/17ebed7a65cc0de1c7e19f4301eca9d021849670))
* **useform:** fix not importing form options in useErrors ([9e1ace0](https://github.com/resourge/react-form/commit/9e1ace0ea551b919c745dfebbf7740ae3741f924))
* **useform:** remove unnecessary code ([f916f68](https://github.com/resourge/react-form/commit/f916f688f5d2f59fb39c4d5d31b095a7599763de))
* **useformsplitter:** fix not updating controller when values change ([f6e014e](https://github.com/resourge/react-form/commit/f6e014ee51056b6f27473754cf195319c03992e3))


### Features

* **useerrors:** change from object to Map ([91cae52](https://github.com/resourge/react-form/commit/91cae52a83c97304ccb0f41c59504f51f2a8dd5e))

# [1.20.0](https://github.com/resourge/react-form/compare/v1.19.0...v1.20.0) (2023-03-28)


### Bug Fixes

* **useformfilter:** fix errors not being displayed when needed ([c5b7bd2](https://github.com/resourge/react-form/commit/c5b7bd236f95860cb71070e2372179e22481778b))


### Features

* **useformstorage:** add ability to use external storage ([13cb424](https://github.com/resourge/react-form/commit/13cb4246a7d5dfd82090e2a71618a0d2f8a95633))

# [1.19.0](https://github.com/resourge/react-form/compare/v1.18.5...v1.19.0) (2023-03-28)


### Bug Fixes

* **useform:** fix onchange in input not working correctly with accentuation ([20e2199](https://github.com/resourge/react-form/commit/20e2199df3a207fc735b5c6c32b23be55c32bbf9))


### Features

* **useform:** separate state into 3 useStates ([77a0631](https://github.com/resourge/react-form/commit/77a063159016ebbdf9f973c9b4652fcffeb015d7))

## [1.18.5](https://github.com/resourge/react-form/compare/v1.18.4...v1.18.5) (2023-02-03)


### Bug Fixes

* **package:** fix patch-package ([7280a8c](https://github.com/resourge/react-form/commit/7280a8c7dd9cffb9e4956bad87298f493a10171a))
* **usefixcursorjumpingtoend:** isBrowser not working in react-native ([782b505](https://github.com/resourge/react-form/commit/782b505d61499c767f7f59f6544ba6bacd06c606))

## [1.18.4](https://github.com/resourge/react-form/compare/v1.18.3...v1.18.4) (2023-02-02)


### Bug Fixes

* **package.json:** fix serialijse patch-package ([9f3b441](https://github.com/resourge/react-form/commit/9f3b441331525e3429faad7f091dc8928413bb74))

## [1.18.3](https://github.com/resourge/react-form/compare/v1.18.2...v1.18.3) (2023-02-02)


### Bug Fixes

* **useformstorage:** fix converting json to class ([cb612a9](https://github.com/resourge/react-form/commit/cb612a98e9357eb3b54e1f3c660d5d22c9f1c7e6))

## [1.18.2](https://github.com/resourge/react-form/compare/v1.18.1...v1.18.2) (2023-02-02)


### Bug Fixes

* **useform:** fix onSubmit being in validation instead of onsubmit ([be324b7](https://github.com/resourge/react-form/commit/be324b74c19064abb2d8e56ce17bd2fd4b70504a))

## [1.18.1](https://github.com/resourge/react-form/compare/v1.18.0...v1.18.1) (2023-02-02)


### Bug Fixes

* **classdecorators:** fix type not working in every class ([1133f44](https://github.com/resourge/react-form/commit/1133f44f23c6e20a33dd91bbb0f2762401a17837))

# [1.18.0](https://github.com/resourge/react-form/compare/v1.17.0...v1.18.0) (2023-02-02)


### Bug Fixes

* **useformsplitter:** fix return type not working in nested keys ([83208a4](https://github.com/resourge/react-form/commit/83208a42758e6983b2b1a161b14557342b2fdf15))


### Features

* **useformsplitter:** improve useformsplitter to work together with Controller component ([bd251ec](https://github.com/resourge/react-form/commit/bd251ec5883d722cadfdac47508b38f5cdbbf2c4))
* **useformstorage:** add useformstorage to create form that are saved in local storage ([428f6ea](https://github.com/resourge/react-form/commit/428f6eabfa92474a3d8561aa695bab3c28f13f79))

# [1.17.0](https://github.com/resourge/react-form/compare/v1.16.0...v1.17.0) (2023-01-30)


### Features

* **useformsplitter:** remove unnecessary functionalities and add useFromSplitter ([89086ad](https://github.com/resourge/react-form/commit/89086ada22e587b7c7bf2274c5e4e365065d709a))

# [1.16.0](https://github.com/resourge/react-form/compare/v1.15.0...v1.16.0) (2023-01-25)


### Features

* **controller:** upgrade controller to take name array and a deps props to improve performance ([88e0bfa](https://github.com/resourge/react-form/commit/88e0bfa86d81aee45e3964597904200afa04673c))

# [1.15.0](https://github.com/resourge/react-form/compare/v1.14.0...v1.15.0) (2023-01-23)


### Features

* **useform:** make triggerChange callback to possible be a promise ([55f0d5c](https://github.com/resourge/react-form/commit/55f0d5c8721cc5d7606492c9651c876073ad1a8d))

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
