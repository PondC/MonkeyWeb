var path=require("path");
var webpack=require("webpack");
var htmlWebpackPlugin=require("html-webpack-plugin");

module.exports={
    entry:{
        app:path.resolve(__dirname,"src/app.jsx"),
        vendors:["react","react-dom"]
    },
    output:{
        path:path.resolve(__dirname,"dist"),
        filename:"[name].js"
    },
    module:{
        loaders:[
            {
                test: /\.jsx$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            },{
                test: /\.(scss)$/,
                use: [{
                    loader: 'style-loader', // inject CSS to page
                }, {
                    loader: 'css-loader', // translates CSS into CommonJS modules
                }, {
                    loader: 'postcss-loader', // Run post css actions
                    options: {
                        plugins: function () { // post css plugins, can be exported to postcss.config.js
                            return [
                                // require('precss'),
                                require('autoprefixer')
                            ];
                        }
                    }
                },{
                    loader: 'sass-loader' // compiles SASS to CSS
                }]
            }
        ]
    },
    plugins: [
        // new webpack.optimize.UglifyJsPlugin(),
        new webpack.optimize.CommonsChunkPlugin({name:"vendors",filename:"[name].js"}),
        new htmlWebpackPlugin({
            template:"src/main.html",
            filename:"main.html"
        }),
        new webpack.ProvidePlugin({
            $:"jquery",
            jQuery:"jquery",
            "window.jQuery":"jquery",
            Popper:["popper.js","default"]
        })
    ]
};
