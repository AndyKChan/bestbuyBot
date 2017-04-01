require('../index.js').load({
    libDir: process.cwd()+'/lib',
    libKey: 'lib',
    exclude: [
        'oops.json',
        '*ail.js'
    ]
});

// see runner.js for the magic
require('./runner.js');