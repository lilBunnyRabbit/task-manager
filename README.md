# NPM Package Template

[![npm version](https://img.shields.io/npm/v/@lilbunnyrabbit/<package-name>.svg)](https://www.npmjs.com/package/@lilbunnyrabbit/<package-name>)
[![npm downloads](https://img.shields.io/npm/dt/@lilbunnyrabbit/<package-name>.svg)](https://www.npmjs.com/package/@lilbunnyrabbit/<package-name>)

This repository serves as a template for creating npm packages, simplifying the setup and development process for your npm packages. Replace all the `<package-name>` and `<repo-name>` with the name of the repository and/or package.

## Installation

To use this package in your project, run:

```sh
npm i @lilbunnyrabbit/<package-name>
```

## Development

This section provides a guide for developers to set up the project environment and utilize various npm scripts defined in the project for efficient development and release processes.

### Setting Up

Clone the repository and install dependencies:

```sh
git clone https://github.com/lilBunnyRabbit/<repo-name>.git
cd <repo-name>
npm install
```

### NPM Scripts

The project includes several npm scripts to streamline common tasks such as building, testing, and cleaning up the project.

| Script              | Description                                                                                                                                                                                       | Command                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| **`build`**         | Compiles the [TypeScript](https://www.typescriptlang.org/) source code to JavaScript, placing the output in the `dist` directory. Essential for preparing the package for publication or testing. | `npm run build`         |
| **`test`**          | Executes the test suite using [Jest](https://jestjs.io/). Crucial for ensuring that your code meets all defined tests and behaves as expected.                                                    | `npm test`              |
| **`clean`**         | Removes both the `dist` directory and the `node_modules` directory. Useful for resetting the project's state during development or before a fresh install.                                        | `npm run clean`         |
| **`changeset`**     | Manages versioning and changelog generation based on conventional commit messages. Helps prepare for a new release by determining which parts of the package need version updates.                | `npm run changeset`     |
| **`release`**       | Publishes the package to npm. Uses `changeset publish` to automatically update package versions and changelogs before publishing. Streamlines the release process.                                | `npm run release`       |
| **`generate:docs`** | Generates project documentation using [Typedoc](https://typedoc.org/). Facilitates the creation of comprehensive and accessible API documentation.                                                | `npm run generate:docs` |

These scripts are designed to facilitate the development process, from cleaning and building the project to running tests and releasing new versions. Feel free to use and customize them as needed for your development workflow.

## Contribution

Contributions are always welcome! For any enhancements or bug fixes, please open a pull request linked to the relevant issue. If there's no existing issue related to your contribution, feel free to create one.

## Support

Your support is greatly appreciated! If this package has been helpful, consider supporting by buying me a coffee.

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/lilBunnyRabbit)

## License

MIT © Andraž Mesarič-Sirec