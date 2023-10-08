# Motomon Game

## Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npm run watch` | Build project and open web server running project, watching for changes |
| `npm run dev` | Builds project and open web server, but do not watch for changes |
| `npm run build` | Builds code bundle with production settings (minification, no source maps, etc..) |

## Writing Code

Run `npm install` from the `packages/game` directory. Then, you can start the local development server by running `npm run watch`.

After starting the development server with `npm run watch`, you can edit any files in the `src` folder
and Rollup will automatically recompile and reload your server (available at `http://localhost:10001`
by default).

## zkOracle Demo

After installing with `npm install` and running `npm run watch`, open a new terminal and run the zkOracle from `packages/zk-oracle` by using `bun run ./src/oracle.ts`. Once the ElysiaJS server is running and healthy (should be a second), open the `http://localhost:10001` and navigate the player over to the sign. Make sure the player is facing up looking at the sign and hit enter. If your console is open you should see the returned object from the zkOracle.

## Configuring Rollup

* Edit the file `rollup.config.dev.js` to edit the development build.
* Edit the file `rollup.config.dist.js` to edit the distribution build.

You will find lots of comments inside the rollup config files to help you do this.

Note that due to the build process involved, it can take around 20 seconds to build the initial bundle. Times will vary based on CPU and local drive speeds. The development config does not minify the code in order to save build time, but it does generate source maps. If you do not require these, disable them in the config to speed it up further.

## Versions Used

* Phaser 3.60
* TypeScript 5.0.3
* Rollup 3.20.2
* Rollup Plugins:
  * @rollup/plugin-commonjs 24.0.1
  * @rollup/plugin-node-resolve 15.0.2
  * @rollup/plugin-replace 5.0.2
  * @rollup/plugin-terser 0.4.0
  * @rollup/plugin-typescript 11.1.0
  * rollup-plugin-serve 2.0.2
