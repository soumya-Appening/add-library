const express = require('express');
const Route = express.Router();
var adminApiRoutes = require('./admin.routes');
var uploaderRoutes = require('./uploader.routes');
var apiRoutes = require('./api');

Route.use('/admin', adminApiRoutes);
Route.use('/uploader', uploaderRoutes);
Route.use('/', apiRoutes);

module.exports = Route;
