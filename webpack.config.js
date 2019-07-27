const webpack = require('webpack')

module.exports = {
    entry: './src/index.js',
	optimization: {
		minimize: false
	},
    plugins: [
        new webpack.ExtendedAPIPlugin(),
        {
            apply: (compiler) => {
                compiler.hooks.afterCompile.tap({
                    name: 'output hash'
                }, (c) => {
                    console.log("Compiled")
                    console.log(c.hash)
                });
            }
        }
    ]
}
