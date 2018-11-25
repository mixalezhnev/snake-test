var path = require('path');
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var LiveReloadPlugin = require('webpack-livereload-plugin');

module.exports = [{
    entry: "./src/components/index.tsx",
    output: {
        filename: "bundle.js",
        path: __dirname + "/dist/js"
    },
    plugins:[
        // new UglifyJSPlugin({
        //     compress: true,
        //     beautify: false,
        //     comments: false,
        //     sourceMap: true
        // }),
        new LiveReloadPlugin()
    ],
    devServer: {
        contentBase: 'dist'
    },
    devtool: "source-map",
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"]
    },
    module: {
        rules: [
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },

},
//*
{
    entry: './src/sass/common.scss',
    output: {
        path: path.resolve(__dirname, 'dist/css'),
        filename: 'styles.css'
        },
    module: {
        rules: [
        {
            test: /\.scss$/,
            use: ExtractTextPlugin.extract(
            {
                fallback: "style-loader",
                use: ["css-loader", "sass-loader?outputStyle=expanded"]
            }
            )
        }
        ]
    },
    plugins: [
        new ExtractTextPlugin("styles.css"),
    ]
}
//*/
]
