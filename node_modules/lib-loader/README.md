lib-loader
==========

This is a small module for making library and config loading 100x easier but mostly just less verbose.


#### Cache your libs
This is an example library structure
```
|_ index.js
|_ libRunning.js
|_ systemLib/
    |_ settings.json
    |_ awesome_system_module/
        |_ index.js
```

Place this statment where ever you want to first cache your library. You can only call this once per library otherwise you will recieve an error.
```js
// index.js
require('lib-loader').load({
    // this is the directory your library files reside
    libDir: './systemLib', // defaults to process.cwd()+'/lib'

    // this is the key the library will be cached under
    libKey: 'system', // defaults to 'lib'
});
```


#### Use your libraries
You can access your cached libraries by using this statment. Notice I use the `.system` attribute. This is determined by the value we place in `libKey`.
All files and folders are `required` and cached under `require('lib-loader')` for easy access.

```js
// libRunning.js
var system = require('lib-loader').system;
system.settings // equivalent to the return of require('./systemLib/settings.json')
system.awesome_system_module // equivalent to the return of require('./systemLib/awesome_system_module/index.js');
```


#### Load many libraries
If you are like me you may have several libraries to load.

```js
require('lib-loader').loadMany([
    { libDir: 'systemLib',  libKey: 'system' },
    { libDir: 'webLib',     libKey: 'web' },
    { libDir: 'systemLib2', libKey: 'system2' }
]);
```

#### Exluding files
Exclude files using globs checkout [minimatch][1] for what is possible.
```js
require('lib-loader').load({
    libDir: './lib',
    libKey: 'lib',
    exclude: [
        '*.json',
        'iDontWantToLoadThis.js'
    ]
});
```

Checkout the `tests` directory for a real example.

[1]: https://www.npmjs.org/package/minimatch