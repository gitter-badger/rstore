/**
 * Created by ndyumin on 25.12.2015.
 */
module.exports = {
    entry: "./src/index.js",
    output: {
        libraryTarget: "umd",
        path: './dist',
        filename: "rstore.js"
    },
    externals: [
        { 'baconjs': true }
    ],
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader'
            }
        ]
    }
};