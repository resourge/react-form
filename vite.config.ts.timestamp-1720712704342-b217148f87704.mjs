// vite.config.ts
import react from "file:///Users/joseoliveira/Desktop/Projects/packages/react-form/node_modules/@vitejs/plugin-react/dist/index.mjs";

// config/defineLibConfig.ts
import deepmerge from "file:///Users/joseoliveira/Desktop/Projects/packages/react-form/node_modules/@fastify/deepmerge/index.js";
import { defineConfig } from "file:///Users/joseoliveira/Desktop/Projects/packages/react-form/node_modules/vite/dist/node/index.js";
import banner from "file:///Users/joseoliveira/Desktop/Projects/packages/react-form/node_modules/vite-plugin-banner/dist/index.mjs";
import dts from "file:///Users/joseoliveira/Desktop/Projects/packages/react-form/node_modules/vite-plugin-dts/dist/index.mjs";
import viteTsconfigPaths from "file:///Users/joseoliveira/Desktop/Projects/packages/react-form/node_modules/vite-tsconfig-paths/dist/index.mjs";

// package.json
var package_default = {
  name: "@resourge/react-form",
  version: "1.25.0",
  description: "react-form is a simple and basic controlled hook form. Aiming to create forms with minimal effort.",
  main: "./dist/index.js",
  module: "./dist/index.js",
  types: "./dist/index.d.ts",
  unpkg: "./dist/index.umd.cjs",
  exports: {
    ".": {
      import: "./dist/index.js",
      require: "./dist/index.cjs"
    }
  },
  private: false,
  type: "module",
  publishConfig: {
    access: "public"
  },
  keywords: [
    "react",
    "hooks",
    "form",
    "forms",
    "form-validation",
    "validation",
    "typescript",
    "react-hooks"
  ],
  files: [
    "dist"
  ],
  author: "resourge",
  license: "MIT",
  scripts: {
    postinstall: "npx patch-package",
    commitizen: "git-cz",
    commit: "git pull && git add . && npm run commitizen",
    lint: 'eslint "./src/**/*.{ts,tsx}"',
    "lint:prod": "cross-env NODE_ENV=production npm run lint",
    dev: "vite",
    build: "tsc && vite build",
    test: "vitest run",
    "test:watch": "vitest",
    coverage: "vitest run --coverage",
    "semantic-release": "semantic-release",
    "eslint:test": 'TIMING=1 DEBUG=eslint:cli-engine yarn eslint "./src/**/*.{ts,tsx}" --fix'
  },
  devDependencies: {
    "@fastify/deepmerge": "^2.0.0",
    "@semantic-release/changelog": "^6.0.3",
    "@semantic-release/exec": "^6.0.3",
    "@semantic-release/git": "^10.0.1",
    "@testing-library/jest-dom": "^6.4.6",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/node": "^20.14.10",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "@vitest/coverage-v8": "^2.0.2",
    "app-root-path": "^3.1.0",
    c8: "^10.1.2",
    "cross-env": "^7.0.3",
    "cz-conventional-changelog": "^3.3.0",
    "eslint-config-resourge": "^1.4.3",
    glob: "^11.0.0",
    jsdom: "^24.1.0",
    "on-change": "^5.0.1",
    "patch-package": "^8.0.0",
    react: "^18.3.1",
    "react-dom": "^18.3.1",
    "semantic-release": "^24.0.0",
    typescript: "^5.5.3",
    vite: "^5.3.3",
    "vite-plugin-banner": "^0.7.1",
    "vite-plugin-dts": "^3.9.1",
    "vite-tsconfig-paths": "^4.3.2",
    vitest: "^2.0.2"
  },
  repository: {
    type: "git",
    url: "https://github.com/resourge/react-form.git"
  },
  config: {
    commitizen: {
      path: "./node_modules/cz-conventional-changelog"
    }
  },
  peerDependencies: {
    react: ">=17.0.0"
  }
};

// config/createBanner.ts
var { name, version, license, author } = package_default;
function getBanner(version2) {
  return `/**
 * ${name} v${version2}
 *
 * Copyright (c) ${author}.
 *
 * This source code is licensed under the ${license} license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license ${license}
 */`;
}
function createBanner() {
  return getBanner(process.env.PROJECT_VERSION ?? version);
}

// config/getPackages.ts
import appRootPath from "file:///Users/joseoliveira/Desktop/Projects/packages/react-form/node_modules/app-root-path/index.js";
import { readFileSync, readdirSync } from "fs";
import { globSync } from "file:///Users/joseoliveira/Desktop/Projects/packages/react-form/node_modules/glob/dist/esm/index.js";
import { join } from "path";
var workspaces = package_default.workspaces ?? [];
var getWorkspaces = () => {
  return workspaces.filter((workspace) => !workspace.startsWith("!")).map((workspace) => {
    const root = join(appRootPath.path, workspace.substring(1).replace(/\*/g, ""));
    return readdirSync(
      root,
      {
        withFileTypes: true
      }
    ).filter((dirent) => dirent.isDirectory()).map((dirent) => join(root, dirent.name));
  }).flat();
};
var packages = getWorkspaces().map(
  (workspace) => globSync(
    `${workspace}/**`
  ).filter((path) => path.includes("package.json")).map((path) => ({
    ...JSON.parse(
      readFileSync(path, "utf-8")
    ),
    path
  }))
).flat();

// config/defineLibConfig.ts
var {
  dependencies = {},
  devDependencies = {},
  peerDependencies = {}
} = package_default;
var external = [
  "react/jsx-runtime",
  ...Object.keys(peerDependencies),
  ...Object.keys(dependencies),
  ...Object.keys(devDependencies)
].filter((key) => key !== "on-change");
var packagesNames = packages.map((pack) => pack.name);
var entryLib = "./src/lib/index.ts";
var deepMerge = deepmerge();
var defineLibConfig = (config, afterBuild) => defineConfig((originalConfig) => deepMerge(
  typeof config === "function" ? config(originalConfig) : config,
  {
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.ts"
    },
    build: {
      minify: false,
      lib: {
        entry: entryLib,
        name: "index",
        fileName: "index",
        formats: ["es"]
      },
      outDir: "./dist",
      sourcemap: true,
      rollupOptions: {
        external
      }
    },
    resolve: {
      preserveSymlinks: true
    },
    plugins: [
      banner(createBanner()),
      viteTsconfigPaths(),
      dts({
        insertTypesEntry: true,
        rollupTypes: true,
        bundledPackages: packagesNames,
        compilerOptions: {
          preserveSymlinks: true,
          paths: {}
        },
        afterBuild
      })
    ]
  }
));

// vite.config.ts
var vite_config_default = defineLibConfig(() => ({
  plugins: [
    react()
    /* checker({ 
    	typescript: true,
    	enableBuild: true,
    	overlay: {
    		initialIsOpen: false
    	},
    	eslint: { */
    // lintCommand: 'eslint "./src/**/*.{ts,tsx}"'
    /* }
    }) */
  ]
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiY29uZmlnL2RlZmluZUxpYkNvbmZpZy50cyIsICJwYWNrYWdlLmpzb24iLCAiY29uZmlnL2NyZWF0ZUJhbm5lci50cyIsICJjb25maWcvZ2V0UGFja2FnZXMudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvam9zZW9saXZlaXJhL0Rlc2t0b3AvUHJvamVjdHMvcGFja2FnZXMvcmVhY3QtZm9ybVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2pvc2VvbGl2ZWlyYS9EZXNrdG9wL1Byb2plY3RzL3BhY2thZ2VzL3JlYWN0LWZvcm0vdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2pvc2VvbGl2ZWlyYS9EZXNrdG9wL1Byb2plY3RzL3BhY2thZ2VzL3JlYWN0LWZvcm0vdml0ZS5jb25maWcudHNcIjsvLy8gPHJlZmVyZW5jZSB0eXBlcz1cInZpdGVzdFwiIC8+XG5cbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG4vLyBpbXBvcnQgY2hlY2tlciBmcm9tICd2aXRlLXBsdWdpbi1jaGVja2VyJztcblxuaW1wb3J0IHsgZGVmaW5lTGliQ29uZmlnIH0gZnJvbSAnLi9jb25maWcvZGVmaW5lTGliQ29uZmlnJztcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUxpYkNvbmZpZygoKSA9PiAoe1xuXHRwbHVnaW5zOiBbXG5cdFx0cmVhY3QoKVxuXHRcdC8qIGNoZWNrZXIoeyBcblx0XHRcdHR5cGVzY3JpcHQ6IHRydWUsXG5cdFx0XHRlbmFibGVCdWlsZDogdHJ1ZSxcblx0XHRcdG92ZXJsYXk6IHtcblx0XHRcdFx0aW5pdGlhbElzT3BlbjogZmFsc2Vcblx0XHRcdH0sXG5cdFx0XHRlc2xpbnQ6IHsgKi9cblx0XHQvLyBsaW50Q29tbWFuZDogJ2VzbGludCBcIi4vc3JjLyoqLyoue3RzLHRzeH1cIidcblx0XHQvKiB9XG5cdFx0fSkgKi9cblx0XVxufSkpO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvam9zZW9saXZlaXJhL0Rlc2t0b3AvUHJvamVjdHMvcGFja2FnZXMvcmVhY3QtZm9ybS9jb25maWdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9qb3Nlb2xpdmVpcmEvRGVza3RvcC9Qcm9qZWN0cy9wYWNrYWdlcy9yZWFjdC1mb3JtL2NvbmZpZy9kZWZpbmVMaWJDb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2pvc2VvbGl2ZWlyYS9EZXNrdG9wL1Byb2plY3RzL3BhY2thZ2VzL3JlYWN0LWZvcm0vY29uZmlnL2RlZmluZUxpYkNvbmZpZy50c1wiO2ltcG9ydCBkZWVwbWVyZ2UgZnJvbSAnQGZhc3RpZnkvZGVlcG1lcmdlJ1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCB0eXBlIFVzZXJDb25maWdFeHBvcnQgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IGJhbm5lciBmcm9tICd2aXRlLXBsdWdpbi1iYW5uZXInXG5pbXBvcnQgZHRzIGZyb20gJ3ZpdGUtcGx1Z2luLWR0cydcbmltcG9ydCB2aXRlVHNjb25maWdQYXRocyBmcm9tICd2aXRlLXRzY29uZmlnLXBhdGhzJ1xuXG5pbXBvcnQgUGFja2FnZUpzb24gZnJvbSAnLi4vcGFja2FnZS5qc29uJ1xuXG5pbXBvcnQgeyBjcmVhdGVCYW5uZXIgfSBmcm9tICcuL2NyZWF0ZUJhbm5lcidcbmltcG9ydCB7IHBhY2thZ2VzIH0gZnJvbSAnLi9nZXRQYWNrYWdlcydcblxuY29uc3Qge1xuXHRkZXBlbmRlbmNpZXMgPSB7fSwgZGV2RGVwZW5kZW5jaWVzID0ge30sIHBlZXJEZXBlbmRlbmNpZXMgID0ge31cbn0gPSBQYWNrYWdlSnNvbjtcblxuY29uc3QgZXh0ZXJuYWwgPSBbXG5cdCdyZWFjdC9qc3gtcnVudGltZScsXG5cdC4uLk9iamVjdC5rZXlzKHBlZXJEZXBlbmRlbmNpZXMpLFxuXHQuLi5PYmplY3Qua2V5cyhkZXBlbmRlbmNpZXMpLFxuXHQuLi5PYmplY3Qua2V5cyhkZXZEZXBlbmRlbmNpZXMpXG5dLmZpbHRlcigoa2V5KSA9PiBrZXkgIT09ICdvbi1jaGFuZ2UnKVxuXG5jb25zdCBwYWNrYWdlc05hbWVzID0gcGFja2FnZXMubWFwKChwYWNrKSA9PiBwYWNrLm5hbWUpO1xuXG5jb25zdCBlbnRyeUxpYiA9ICcuL3NyYy9saWIvaW5kZXgudHMnO1xuXG5jb25zdCBkZWVwTWVyZ2UgPSBkZWVwbWVyZ2UoKTtcblxuZXhwb3J0IGNvbnN0IGRlZmluZUxpYkNvbmZpZyA9IChcblx0Y29uZmlnOiBVc2VyQ29uZmlnRXhwb3J0LFxuXHRhZnRlckJ1aWxkPzogKCgpID0+IHZvaWQgfCBQcm9taXNlPHZvaWQ+KVxuKTogVXNlckNvbmZpZ0V4cG9ydCA9PiBkZWZpbmVDb25maWcoKG9yaWdpbmFsQ29uZmlnKSA9PiBkZWVwTWVyZ2UoXG5cdHR5cGVvZiBjb25maWcgPT09ICdmdW5jdGlvbicgPyBjb25maWcob3JpZ2luYWxDb25maWcpIDogY29uZmlnLFxuXHR7XG5cdFx0dGVzdDoge1xuXHRcdFx0Z2xvYmFsczogdHJ1ZSxcblx0XHRcdGVudmlyb25tZW50OiAnanNkb20nLFxuXHRcdFx0c2V0dXBGaWxlczogJy4vc3JjL3NldHVwVGVzdHMudHMnXG5cdFx0fSxcblx0XHRidWlsZDoge1xuXHRcdFx0bWluaWZ5OiBmYWxzZSxcblx0XHRcdGxpYjoge1xuXHRcdFx0XHRlbnRyeTogZW50cnlMaWIsXG5cdFx0XHRcdG5hbWU6ICdpbmRleCcsXG5cdFx0XHRcdGZpbGVOYW1lOiAnaW5kZXgnLFxuXHRcdFx0XHRmb3JtYXRzOiBbJ2VzJ11cblx0XHRcdH0sXG5cdFx0XHRvdXREaXI6ICcuL2Rpc3QnLFxuXHRcdFx0c291cmNlbWFwOiB0cnVlLFxuXHRcdFx0cm9sbHVwT3B0aW9uczoge1xuXHRcdFx0XHRleHRlcm5hbFxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0cmVzb2x2ZToge1xuXHRcdFx0cHJlc2VydmVTeW1saW5rczogdHJ1ZVxuXHRcdH0sXG5cdFx0cGx1Z2luczogW1xuXHRcdFx0YmFubmVyKGNyZWF0ZUJhbm5lcigpKSxcblx0XHRcdHZpdGVUc2NvbmZpZ1BhdGhzKCksXG5cdFx0XHRkdHMoe1xuXHRcdFx0XHRpbnNlcnRUeXBlc0VudHJ5OiB0cnVlLFxuXHRcdFx0XHRyb2xsdXBUeXBlczogdHJ1ZSxcblx0XHRcdFx0YnVuZGxlZFBhY2thZ2VzOiBwYWNrYWdlc05hbWVzLFxuXHRcdFx0XHRjb21waWxlck9wdGlvbnM6IHtcblx0XHRcdFx0XHRwcmVzZXJ2ZVN5bWxpbmtzOiB0cnVlLFxuXHRcdFx0XHRcdHBhdGhzOiB7fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRhZnRlckJ1aWxkXG5cdFx0XHR9KVxuXHRcdF1cblx0fVxuKSk7XG4iLCAie1xuXHRcIm5hbWVcIjogXCJAcmVzb3VyZ2UvcmVhY3QtZm9ybVwiLFxuXHRcInZlcnNpb25cIjogXCIxLjI1LjBcIixcblx0XCJkZXNjcmlwdGlvblwiOiBcInJlYWN0LWZvcm0gaXMgYSBzaW1wbGUgYW5kIGJhc2ljIGNvbnRyb2xsZWQgaG9vayBmb3JtLiBBaW1pbmcgdG8gY3JlYXRlIGZvcm1zIHdpdGggbWluaW1hbCBlZmZvcnQuXCIsXG5cdFwibWFpblwiOiBcIi4vZGlzdC9pbmRleC5qc1wiLFxuXHRcIm1vZHVsZVwiOiBcIi4vZGlzdC9pbmRleC5qc1wiLFxuXHRcInR5cGVzXCI6IFwiLi9kaXN0L2luZGV4LmQudHNcIixcblx0XCJ1bnBrZ1wiOiBcIi4vZGlzdC9pbmRleC51bWQuY2pzXCIsXG5cdFwiZXhwb3J0c1wiOiB7XG5cdFx0XCIuXCI6IHtcblx0XHRcdFwiaW1wb3J0XCI6IFwiLi9kaXN0L2luZGV4LmpzXCIsXG5cdFx0XHRcInJlcXVpcmVcIjogXCIuL2Rpc3QvaW5kZXguY2pzXCJcblx0XHR9XG5cdH0sXG5cdFwicHJpdmF0ZVwiOiBmYWxzZSxcblx0XCJ0eXBlXCI6IFwibW9kdWxlXCIsXG5cdFwicHVibGlzaENvbmZpZ1wiOiB7XG5cdFx0XCJhY2Nlc3NcIjogXCJwdWJsaWNcIlxuXHR9LFxuXHRcImtleXdvcmRzXCI6IFtcblx0XHRcInJlYWN0XCIsXG5cdFx0XCJob29rc1wiLFxuXHRcdFwiZm9ybVwiLFxuXHRcdFwiZm9ybXNcIixcblx0XHRcImZvcm0tdmFsaWRhdGlvblwiLFxuXHRcdFwidmFsaWRhdGlvblwiLFxuXHRcdFwidHlwZXNjcmlwdFwiLFxuXHRcdFwicmVhY3QtaG9va3NcIlxuXHRdLFxuXHRcImZpbGVzXCI6IFtcblx0XHRcImRpc3RcIlxuXHRdLFxuXHRcImF1dGhvclwiOiBcInJlc291cmdlXCIsXG5cdFwibGljZW5zZVwiOiBcIk1JVFwiLFxuXHRcInNjcmlwdHNcIjoge1xuXHRcdFwicG9zdGluc3RhbGxcIjogXCJucHggcGF0Y2gtcGFja2FnZVwiLFxuXHRcdFwiY29tbWl0aXplblwiOiBcImdpdC1jelwiLFxuXHRcdFwiY29tbWl0XCI6IFwiZ2l0IHB1bGwgJiYgZ2l0IGFkZCAuICYmIG5wbSBydW4gY29tbWl0aXplblwiLFxuXHRcdFwibGludFwiOiBcImVzbGludCBcXFwiLi9zcmMvKiovKi57dHMsdHN4fVxcXCJcIixcblx0XHRcImxpbnQ6cHJvZFwiOiBcImNyb3NzLWVudiBOT0RFX0VOVj1wcm9kdWN0aW9uIG5wbSBydW4gbGludFwiLFxuXHRcdFwiZGV2XCI6IFwidml0ZVwiLFxuXHRcdFwiYnVpbGRcIjogXCJ0c2MgJiYgdml0ZSBidWlsZFwiLFxuXHRcdFwidGVzdFwiOiBcInZpdGVzdCBydW5cIixcblx0XHRcInRlc3Q6d2F0Y2hcIjogXCJ2aXRlc3RcIixcblx0XHRcImNvdmVyYWdlXCI6IFwidml0ZXN0IHJ1biAtLWNvdmVyYWdlXCIsXG5cdFx0XCJzZW1hbnRpYy1yZWxlYXNlXCI6IFwic2VtYW50aWMtcmVsZWFzZVwiLFxuXHRcdFwiZXNsaW50OnRlc3RcIjogXCJUSU1JTkc9MSBERUJVRz1lc2xpbnQ6Y2xpLWVuZ2luZSB5YXJuIGVzbGludCBcXFwiLi9zcmMvKiovKi57dHMsdHN4fVxcXCIgLS1maXhcIlxuXHR9LFxuXHRcImRldkRlcGVuZGVuY2llc1wiOiB7XG5cdFx0XCJAZmFzdGlmeS9kZWVwbWVyZ2VcIjogXCJeMi4wLjBcIixcblx0XHRcIkBzZW1hbnRpYy1yZWxlYXNlL2NoYW5nZWxvZ1wiOiBcIl42LjAuM1wiLFxuXHRcdFwiQHNlbWFudGljLXJlbGVhc2UvZXhlY1wiOiBcIl42LjAuM1wiLFxuXHRcdFwiQHNlbWFudGljLXJlbGVhc2UvZ2l0XCI6IFwiXjEwLjAuMVwiLFxuXHRcdFwiQHRlc3RpbmctbGlicmFyeS9qZXN0LWRvbVwiOiBcIl42LjQuNlwiLFxuXHRcdFwiQHRlc3RpbmctbGlicmFyeS9yZWFjdFwiOiBcIl4xNi4wLjBcIixcblx0XHRcIkB0ZXN0aW5nLWxpYnJhcnkvdXNlci1ldmVudFwiOiBcIl4xNC41LjJcIixcblx0XHRcIkB0eXBlcy9ub2RlXCI6IFwiXjIwLjE0LjEwXCIsXG5cdFx0XCJAdHlwZXMvcmVhY3RcIjogXCJeMTguMy4zXCIsXG5cdFx0XCJAdHlwZXMvcmVhY3QtZG9tXCI6IFwiXjE4LjMuMFwiLFxuXHRcdFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjogXCJeNC4zLjFcIixcblx0XHRcIkB2aXRlc3QvY292ZXJhZ2UtdjhcIjogXCJeMi4wLjJcIixcblx0XHRcImFwcC1yb290LXBhdGhcIjogXCJeMy4xLjBcIixcblx0XHRcImM4XCI6IFwiXjEwLjEuMlwiLFxuXHRcdFwiY3Jvc3MtZW52XCI6IFwiXjcuMC4zXCIsXG5cdFx0XCJjei1jb252ZW50aW9uYWwtY2hhbmdlbG9nXCI6IFwiXjMuMy4wXCIsXG5cdFx0XCJlc2xpbnQtY29uZmlnLXJlc291cmdlXCI6IFwiXjEuNC4zXCIsXG5cdFx0XCJnbG9iXCI6IFwiXjExLjAuMFwiLFxuXHRcdFwianNkb21cIjogXCJeMjQuMS4wXCIsXG5cdFx0XCJvbi1jaGFuZ2VcIjogXCJeNS4wLjFcIixcblx0XHRcInBhdGNoLXBhY2thZ2VcIjogXCJeOC4wLjBcIixcblx0XHRcInJlYWN0XCI6IFwiXjE4LjMuMVwiLFxuXHRcdFwicmVhY3QtZG9tXCI6IFwiXjE4LjMuMVwiLFxuXHRcdFwic2VtYW50aWMtcmVsZWFzZVwiOiBcIl4yNC4wLjBcIixcblx0XHRcInR5cGVzY3JpcHRcIjogXCJeNS41LjNcIixcblx0XHRcInZpdGVcIjogXCJeNS4zLjNcIixcblx0XHRcInZpdGUtcGx1Z2luLWJhbm5lclwiOiBcIl4wLjcuMVwiLFxuXHRcdFwidml0ZS1wbHVnaW4tZHRzXCI6IFwiXjMuOS4xXCIsXG5cdFx0XCJ2aXRlLXRzY29uZmlnLXBhdGhzXCI6IFwiXjQuMy4yXCIsXG5cdFx0XCJ2aXRlc3RcIjogXCJeMi4wLjJcIlxuXHR9LFxuXHRcInJlcG9zaXRvcnlcIjoge1xuXHRcdFwidHlwZVwiOiBcImdpdFwiLFxuXHRcdFwidXJsXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL3Jlc291cmdlL3JlYWN0LWZvcm0uZ2l0XCJcblx0fSxcblx0XCJjb25maWdcIjoge1xuXHRcdFwiY29tbWl0aXplblwiOiB7XG5cdFx0XHRcInBhdGhcIjogXCIuL25vZGVfbW9kdWxlcy9jei1jb252ZW50aW9uYWwtY2hhbmdlbG9nXCJcblx0XHR9XG5cdH0sXG5cdFwicGVlckRlcGVuZGVuY2llc1wiOiB7XG5cdFx0XCJyZWFjdFwiOiBcIj49MTcuMC4wXCJcblx0fVxufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvam9zZW9saXZlaXJhL0Rlc2t0b3AvUHJvamVjdHMvcGFja2FnZXMvcmVhY3QtZm9ybS9jb25maWdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9qb3Nlb2xpdmVpcmEvRGVza3RvcC9Qcm9qZWN0cy9wYWNrYWdlcy9yZWFjdC1mb3JtL2NvbmZpZy9jcmVhdGVCYW5uZXIudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2pvc2VvbGl2ZWlyYS9EZXNrdG9wL1Byb2plY3RzL3BhY2thZ2VzL3JlYWN0LWZvcm0vY29uZmlnL2NyZWF0ZUJhbm5lci50c1wiO2ltcG9ydCBQYWNrYWdlSnNvbiBmcm9tICcuLi9wYWNrYWdlLmpzb24nO1xuXG5jb25zdCB7IG5hbWUsIHZlcnNpb24sIGxpY2Vuc2UsIGF1dGhvciB9ID0gUGFja2FnZUpzb247XG5cbmZ1bmN0aW9uIGdldEJhbm5lcih2ZXJzaW9uOiBzdHJpbmcpIHtcblx0cmV0dXJuIGAvKipcbiAqICR7bmFtZX0gdiR7dmVyc2lvbn1cbiAqXG4gKiBDb3B5cmlnaHQgKGMpICR7YXV0aG9yfS5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSAke2xpY2Vuc2V9IGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFLm1kIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKlxuICogQGxpY2Vuc2UgJHtsaWNlbnNlfVxuICovYDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUJhbm5lcigpIHtcblx0cmV0dXJuIGdldEJhbm5lcihwcm9jZXNzLmVudi5QUk9KRUNUX1ZFUlNJT04gPz8gdmVyc2lvbik7XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9qb3Nlb2xpdmVpcmEvRGVza3RvcC9Qcm9qZWN0cy9wYWNrYWdlcy9yZWFjdC1mb3JtL2NvbmZpZ1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2pvc2VvbGl2ZWlyYS9EZXNrdG9wL1Byb2plY3RzL3BhY2thZ2VzL3JlYWN0LWZvcm0vY29uZmlnL2dldFBhY2thZ2VzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9qb3Nlb2xpdmVpcmEvRGVza3RvcC9Qcm9qZWN0cy9wYWNrYWdlcy9yZWFjdC1mb3JtL2NvbmZpZy9nZXRQYWNrYWdlcy50c1wiO1xuaW1wb3J0IGFwcFJvb3RQYXRoIGZyb20gJ2FwcC1yb290LXBhdGgnO1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jLCByZWFkZGlyU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCB7IGdsb2JTeW5jIH0gZnJvbSAnZ2xvYic7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XG5cbmltcG9ydCBQYWNrYWdlSnNvbiBmcm9tICcuLi9wYWNrYWdlLmpzb24nO1xuXG5jb25zdCB3b3Jrc3BhY2VzID0gKFBhY2thZ2VKc29uIGFzIHVua25vd24gYXMgeyB3b3Jrc3BhY2VzOiBzdHJpbmdbXSB9KS53b3Jrc3BhY2VzID8/IFtdXG5cbmV4cG9ydCBjb25zdCBnZXRXb3Jrc3BhY2VzID0gKCkgPT4ge1xuXHRyZXR1cm4gd29ya3NwYWNlc1xuXHQuZmlsdGVyKCh3b3Jrc3BhY2UpID0+ICF3b3Jrc3BhY2Uuc3RhcnRzV2l0aCgnIScpKVxuXHQubWFwKCh3b3Jrc3BhY2UpID0+IHtcblx0XHRjb25zdCByb290ID0gam9pbihhcHBSb290UGF0aC5wYXRoLCB3b3Jrc3BhY2Uuc3Vic3RyaW5nKDEpLnJlcGxhY2UoL1xcKi9nLCAnJykpO1xuXG5cdFx0cmV0dXJuIHJlYWRkaXJTeW5jKFxuXHRcdFx0cm9vdCwgXG5cdFx0XHR7XG5cdFx0XHRcdHdpdGhGaWxlVHlwZXM6IHRydWUgXG5cdFx0XHR9XG5cdFx0KVxuXHRcdC5maWx0ZXIoZGlyZW50ID0+IGRpcmVudC5pc0RpcmVjdG9yeSgpKVxuXHRcdC5tYXAoZGlyZW50ID0+IGpvaW4ocm9vdCwgZGlyZW50Lm5hbWUpKVxuXHR9KS5mbGF0KCk7XG59XG5cbmV4cG9ydCBjb25zdCBwYWNrYWdlcyA9IGdldFdvcmtzcGFjZXMoKS5tYXAoKHdvcmtzcGFjZSkgPT4gXG5cdGdsb2JTeW5jKFxuXHRcdGAke3dvcmtzcGFjZX0vKipgXG5cdClcblx0LmZpbHRlcigocGF0aCkgPT4gcGF0aC5pbmNsdWRlcygncGFja2FnZS5qc29uJykpXG5cdC5tYXAoKHBhdGgpID0+ICh7XG5cdFx0Li4uSlNPTi5wYXJzZShcblx0XHRcdHJlYWRGaWxlU3luYyhwYXRoLCAndXRmLTgnKVxuXHRcdCksXG5cdFx0cGF0aFxuXHR9KSBhcyBjb25zdClcbilcbi5mbGF0KCk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBRUEsT0FBTyxXQUFXOzs7QUNGcVcsT0FBTyxlQUFlO0FBQzdZLFNBQVMsb0JBQTJDO0FBQ3BELE9BQU8sWUFBWTtBQUNuQixPQUFPLFNBQVM7QUFDaEIsT0FBTyx1QkFBdUI7OztBQ0o5QjtBQUFBLEVBQ0MsTUFBUTtBQUFBLEVBQ1IsU0FBVztBQUFBLEVBQ1gsYUFBZTtBQUFBLEVBQ2YsTUFBUTtBQUFBLEVBQ1IsUUFBVTtBQUFBLEVBQ1YsT0FBUztBQUFBLEVBQ1QsT0FBUztBQUFBLEVBQ1QsU0FBVztBQUFBLElBQ1YsS0FBSztBQUFBLE1BQ0osUUFBVTtBQUFBLE1BQ1YsU0FBVztBQUFBLElBQ1o7QUFBQSxFQUNEO0FBQUEsRUFDQSxTQUFXO0FBQUEsRUFDWCxNQUFRO0FBQUEsRUFDUixlQUFpQjtBQUFBLElBQ2hCLFFBQVU7QUFBQSxFQUNYO0FBQUEsRUFDQSxVQUFZO0FBQUEsSUFDWDtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNEO0FBQUEsRUFDQSxPQUFTO0FBQUEsSUFDUjtBQUFBLEVBQ0Q7QUFBQSxFQUNBLFFBQVU7QUFBQSxFQUNWLFNBQVc7QUFBQSxFQUNYLFNB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RUFDRCxFQUFXO0FBQ1osRUFDQyxLQUFLOzs7QUg1Qk4sSUFBTTtBQUFBLEVBQ0wsZUFBZSxDQUFDO0FBQUEsRUFBRyxrQkFBa0IsQ0FBQztBQUFBLEVBQUcsbUJBQW9CLENBQUM7QUFDL0QsSUFBSTtBQUVKLElBQU0sV0FBVztBQUFBLEVBQ2hCO0FBQUEsRUFDQSxHQUFHLE9BQU8sS0FBSyxnQkFBZ0I7QUFBQSxFQUMvQixHQUFHLE9BQU8sS0FBSyxZQUFZO0FBQUEsRUFDM0IsR0FBRyxPQUFPLEtBQUssZUFBZTtBQUMvQixFQUFFLE9BQU8sQ0FBQyxRQUFRLFFBQVEsV0FBVztBQUVyQyxJQUFNLGdCQUFnQixTQUFTLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSTtBQUV0RCxJQUFNLFdBQVc7QUFFakIsSUFBTSxZQUFZLFVBQVU7QUFFckIsSUFBTSxrQkFBa0IsQ0FDOUIsUUFDQSxlQUNzQixhQUFhLENBQUMsbUJBQW1CO0FBQUEsRUFDdkQsT0FBTyxXQUFXLGFBQWEsT0FBTyxjQUFjLElBQUk7QUFBQSxFQUN4RDtBQUFBLElBQ0MsTUFBTTtBQUFBLE1BQ0wsU0FBUztBQUFBLE1BQ1QsYUFBYTtBQUFBLE1BQ2IsWUFBWTtBQUFBLElBQ2I7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNOLFFBQVE7QUFBQSxNQUNSLEtBQUs7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLE1BQU07QUFBQSxRQUNOLFVBQVU7QUFBQSxRQUNWLFNBQVMsQ0FBQyxJQUFJO0FBQUEsTUFDZjtBQUFBLE1BQ0EsUUFBUTtBQUFBLE1BQ1IsV0FBVztBQUFBLE1BQ1gsZUFBZTtBQUFBLFFBQ2Q7QUFBQSxNQUNEO0FBQUEsSUFDRDtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1Isa0JBQWtCO0FBQUEsSUFDbkI7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNSLE9BQU8sYUFBYSxDQUFDO0FBQUEsTUFDckIsa0JBQWtCO0FBQUEsTUFDbEIsSUFBSTtBQUFBLFFBQ0gsa0JBQWtCO0FBQUEsUUFDbEIsYUFBYTtBQUFBLFFBQ2IsaUJBQWlCO0FBQUEsUUFDakIsaUJBQWlCO0FBQUEsVUFDaEIsa0JBQWtCO0FBQUEsVUFDbEIsT0FBTyxDQUFDO0FBQUEsUUFDVDtBQUFBLFFBQ0E7QUFBQSxNQUNELENBQUM7QUFBQSxJQUNGO0FBQUEsRUFDRDtBQUNELENBQUM7OztBRC9ERCxJQUFPLHNCQUFRLGdCQUFnQixPQUFPO0FBQUEsRUFDckMsU0FBUztBQUFBLElBQ1IsTUFBTTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFXUDtBQUNELEVBQUU7IiwKICAibmFtZXMiOiBbInZlcnNpb24iXQp9Cg==
