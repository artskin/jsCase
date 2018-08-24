
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');


const config = {
    mode:'development',
    entry:'./src/js/FE.js',
    output:{
        path:path.resolve(__dirname,'../dist/js'),
        filename:'[name].min.js'
    },
    // moudule:{
    //     rules:[
    //         {test:/\.txt$/,use:'raw-loader'}
    //     ]
    // }
    devServer:{
        contentBase:path.join(__dirname,'dist'),
        port:7000,
        host:'0.0.0.0'
    }
}

module.exports = config;