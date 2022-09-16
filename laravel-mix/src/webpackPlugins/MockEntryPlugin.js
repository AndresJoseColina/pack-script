let File = require('../File');
let path = require('path');

class MockEntryPlugin {
    /**
     * Handle the deletion of the temporary mix.js
     * output file that was generated by webpack.
     *
     * This file is created when the user hasn't
     * requested any JavaScript compilation, but
     * webpack still requires an entry.
     *
     * @param {import("webpack").Compiler} compiler
     */
    apply(compiler) {
        compiler.hooks.done.tap('MockEntryPlugin', stats => {
            let temporaryOutputFile = stats
                .toJson()
                .assets.find(asset => asset.name === 'mix.js');

            if (temporaryOutputFile) {
                delete stats.compilation.assets[temporaryOutputFile.name];

                File.find(
                    path.resolve(Config.publicPath, temporaryOutputFile.name)
                ).delete();
            }
        });
    }
}

module.exports = MockEntryPlugin;
