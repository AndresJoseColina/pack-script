"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pitch = pitch;
exports.default = _default;

var _path = _interopRequireDefault(require("path"));

var _loaderUtils = _interopRequireDefault(require("loader-utils"));

var _schemaUtils = require("schema-utils");

var _utils = require("./utils");

var _loaderOptions = _interopRequireDefault(require("./loader-options.json"));

var _index = _interopRequireWildcard(require("./index"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function hotLoader(content, context) {
  const accept = context.locals ? '' : 'module.hot.accept(undefined, cssReload);';
  return `${content}
    if(module.hot) {
      // ${Date.now()}
      var cssReload = require(${_loaderUtils.default.stringifyRequest(context.context, _path.default.join(__dirname, 'hmr/hotModuleReplacement.js'))})(module.id, ${JSON.stringify({ ...context.options,
    locals: !!context.locals
  })});
      module.hot.dispose(cssReload);
      ${accept}
    }
  `;
}

function pitch(request) {
  const options = _loaderUtils.default.getOptions(this) || {};
  (0, _schemaUtils.validate)(_loaderOptions.default, options, {
    name: 'Mini CSS Extract Plugin Loader',
    baseDataPath: 'options'
  });
  const callback = this.async();

  if (!this[_index.pluginSymbol]) {
    callback(new Error("You forgot to add 'mini-css-extract-plugin' plugin (i.e. `{ plugins: [new MiniCssExtractPlugin()] }`), please read https://github.com/webpack-contrib/mini-css-extract-plugin#getting-started"));
    return;
  }

  const loaders = this.loaders.slice(this.loaderIndex + 1);
  this.addDependency(this.resourcePath);
  const childFilename = '*';
  const publicPath = typeof options.publicPath === 'string' ? options.publicPath === 'auto' ? '' : options.publicPath === '' || options.publicPath.endsWith('/') ? options.publicPath : `${options.publicPath}/` : typeof options.publicPath === 'function' ? options.publicPath(this.resourcePath, this.rootContext) : this._compilation.outputOptions.publicPath === 'auto' ? '' : this._compilation.outputOptions.publicPath;
  const outputOptions = {
    filename: childFilename,
    publicPath
  };

  const childCompiler = this._compilation.createChildCompiler(`${_index.pluginName} ${request}`, outputOptions); // TODO simplify after drop  webpack v4
  // eslint-disable-next-line global-require


  const webpack = this._compiler.webpack || require('webpack');

  const {
    NodeTemplatePlugin
  } = webpack.node;
  const NodeTargetPlugin = webpack.node.NodeTargetPlugin ? webpack.node.NodeTargetPlugin : // eslint-disable-next-line global-require
  require('webpack/lib/node/NodeTargetPlugin');
  new NodeTemplatePlugin(outputOptions).apply(childCompiler);
  new NodeTargetPlugin().apply(childCompiler);
  const {
    EntryOptionPlugin
  } = webpack;

  if (EntryOptionPlugin) {
    const {
      library: {
        EnableLibraryPlugin
      }
    } = webpack;
    new EnableLibraryPlugin('commonjs2').apply(childCompiler);
    EntryOptionPlugin.applyEntryOption(childCompiler, this.context, {
      child: {
        library: {
          type: 'commonjs2'
        },
        import: [`!!${request}`]
      }
    });
  } else {
    const {
      LibraryTemplatePlugin,
      SingleEntryPlugin
    } = webpack;
    new LibraryTemplatePlugin(null, 'commonjs2').apply(childCompiler);
    new SingleEntryPlugin(this.context, `!!${request}`, _index.pluginName).apply(childCompiler);
  }

  const {
    LimitChunkCountPlugin
  } = webpack.optimize;
  new LimitChunkCountPlugin({
    maxChunks: 1
  }).apply(childCompiler);
  const NormalModule = webpack.NormalModule ? webpack.NormalModule : // eslint-disable-next-line global-require
  require('webpack/lib/NormalModule');
  childCompiler.hooks.thisCompilation.tap(`${_index.pluginName} loader`, compilation => {
    const normalModuleHook = typeof NormalModule.getCompilationHooks !== 'undefined' ? NormalModule.getCompilationHooks(compilation).loader : compilation.hooks.normalModuleLoader;
    normalModuleHook.tap(`${_index.pluginName} loader`, (loaderContext, module) => {
      if (module.request === request) {
        // eslint-disable-next-line no-param-reassign
        module.loaders = loaders.map(loader => {
          return {
            loader: loader.path,
            options: loader.options,
            ident: loader.ident
          };
        });
      }
    });
  });
  let source;
  const isWebpack4 = childCompiler.webpack ? false : typeof childCompiler.resolvers !== 'undefined';

  if (isWebpack4) {
    childCompiler.hooks.afterCompile.tap(_index.pluginName, compilation => {
      source = compilation.assets[childFilename] && compilation.assets[childFilename].source(); // Remove all chunk assets

      compilation.chunks.forEach(chunk => {
        chunk.files.forEach(file => {
          delete compilation.assets[file]; // eslint-disable-line no-param-reassign
        });
      });
    });
  } else {
    childCompiler.hooks.compilation.tap(_index.pluginName, compilation => {
      compilation.hooks.processAssets.tap(_index.pluginName, () => {
        source = compilation.assets[childFilename] && compilation.assets[childFilename].source(); // console.log(source);
        // Remove all chunk assets

        compilation.chunks.forEach(chunk => {
          chunk.files.forEach(file => {
            compilation.deleteAsset(file);
          });
        });
      });
    });
  }

  childCompiler.runAsChild((error, entries, compilation) => {
    const assets = Object.create(null);
    const assetsInfo = new Map();

    for (const asset of compilation.getAssets()) {
      assets[asset.name] = asset.source;
      assetsInfo.set(asset.name, asset.info);
    }

    const addDependencies = dependencies => {
      if (!Array.isArray(dependencies) && dependencies != null) {
        throw new Error(`Exported value was not extracted as an array: ${JSON.stringify(dependencies)}`);
      }

      const identifierCountMap = new Map();
      let lastDep;

      for (const dependency of dependencies) {
        if (!dependency.identifier) {
          // eslint-disable-next-line no-continue
          continue;
        }

        const count = identifierCountMap.get(dependency.identifier) || 0;

        const CssDependency = _index.default.getCssDependency(webpack);

        this._module.addDependency(lastDep = new CssDependency(dependency, dependency.context, count));

        identifierCountMap.set(dependency.identifier, count + 1);
      }

      if (lastDep) {
        lastDep.assets = assets;
        lastDep.assetsInfo = assetsInfo;
      }
    };

    if (error) {
      return callback(error);
    }

    if (compilation.errors.length > 0) {
      return callback(compilation.errors[0]);
    }

    compilation.fileDependencies.forEach(dep => {
      this.addDependency(dep);
    }, this);
    compilation.contextDependencies.forEach(dep => {
      this.addContextDependency(dep);
    }, this);

    if (!source) {
      return callback(new Error("Didn't get a result from child compiler"));
    }

    let locals;
    const esModule = typeof options.esModule !== 'undefined' ? options.esModule : true;
    const namedExport = esModule && options.modules && options.modules.namedExport;

    try {
      const originalExports = (0, _utils.evalModuleCode)(this, source, request); // eslint-disable-next-line no-underscore-dangle

      exports = originalExports.__esModule ? originalExports.default : originalExports;

      if (namedExport) {
        Object.keys(originalExports).forEach(key => {
          if (key !== 'default') {
            if (!locals) {
              locals = {};
            }

            locals[key] = originalExports[key];
          }
        });
      } else {
        locals = exports && exports.locals;
      }

      let dependencies;

      if (!Array.isArray(exports)) {
        dependencies = [[null, exports]];
      } else {
        dependencies = exports.map(([id, content, media, sourceMap]) => {
          const module = (0, _utils.findModuleById)(compilation, id);
          return {
            identifier: module.identifier(),
            context: module.context,
            content: Buffer.from(content),
            media,
            sourceMap: sourceMap ? Buffer.from(JSON.stringify(sourceMap)) : // eslint-disable-next-line no-undefined
            undefined
          };
        });
      }

      addDependencies(dependencies);
    } catch (e) {
      return callback(e);
    }

    const result = locals ? namedExport ? Object.keys(locals).map(key => `\nexport const ${key} = ${JSON.stringify(locals[key])};`).join('') : `\n${esModule ? 'export default' : 'module.exports ='} ${JSON.stringify(locals)};` : esModule ? `\nexport {};` : '';
    let resultSource = `// extracted by ${_index.pluginName}`;
    resultSource += this.hot ? hotLoader(result, {
      context: this.context,
      options,
      locals
    }) : result;
    return callback(null, resultSource);
  });
} // eslint-disable-next-line func-names


function _default() {}