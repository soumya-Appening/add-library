const express = require("express");
const Route = express.Router();

/**
 * 
 * Bad Request Error Response
 * @typedef {object} BadRequestResponse
 * @property {number} status -status code
 * @property {string} statusText - status code in text
 * @property {string} statusText - error message
 *
 */
/** 
* Internal Server Error Response
* @typedef {object} internalServerErrorResponse
* @property {string} url -url
* @property {number} status - status code
* @property {string} statusText - error message
*/

/* Local files*/
/*End Local files*/

/* Middleware*/
const ApiMiddleware = require("../http/middlewares/api");
/* End Middleware*/

/* Requests*/
const AdminRequest = require("../http/requests/admin.request");
const AdsRequest = require("../http/requests/ads.request");
const DashBoardRequest = require("../http/requests/dashboard.request");
const ChartRequest = require("../http/requests/chart.request");
/* End Requests*/

/* Controllers*/
const AdminController = require("../http/controllers/api/admin/admin.controller");
const SuperVisorController = require("../http/controllers/api/admin/supervisor.controller");
const UploaderController = require("../http/controllers/api/admin/uploader.controller");
const InfluencerController = require("../http/controllers/api/admin/influencer.controller");
const BrandController = require("../http/controllers/api/admin/brand.controller");
const PlatformController = require("../http/controllers/api/admin/platform.controller");
const ProductController = require("../http/controllers/api/admin/product.controller");
const DashBoardController = require("../http/controllers/api/admin/dashboard.controller");
const AdsController = require("../http/controllers/api/admin/ads.controller");
const ChartController = require("../http/controllers/api/admin/chart.controller");
const supervisorNewController = require( "../http/controllers/api/admin/supervisorNew.controller" );
const platformNewController = require( "../http/controllers/api/admin/platformNew.controller" );
const uploaderNewController = require( "../http/controllers/api/admin/uploaderNew.controller" );
/* End Controllers*/

const validate = AdminRequest.validate;

// Route.use(ApiMiddleware.superVisorAuth)

//dashboard routes
Route.get("/home/ads", DashBoardRequest.getAdsRules(),validate, DashBoardController.getAds)
Route.get("/home/influencer", DashBoardController.getInfluencers)
Route.get("/home/influencer/:id",DashBoardRequest.getInfluencerDetailRules(), DashBoardController.getInfluencerDetails)
Route.get("/uploader/list", AdminRequest.getUploaderRules(), validate, UploaderController.getUploaderList)
//end of platform routes

// Route.use(ApiMiddleware.adminAuth)

//Admin routes
Route.post("/create", AdminRequest.getAddAdminRules(), validate,  AdminController.createAdmin);
Route.get("/list", AdminRequest.getAdminRules(), validate, AdminController.getAdmin)
Route.put("/update/:id", AdminRequest.getUpdateAdminRules(), validate, AdminController.updateAdmin)
Route.delete("/remove/:id", AdminRequest.getDeleteAdminRules(), validate, AdminController.removeAdmin)
//End admin routes

//Supervisor routes
// Route.post("/supervisor/create", AdminRequest.getAddSupervisorRules(), validate, SuperVisorController.createSuperVisor);
Route.post("/supervisor/create/:userId", AdminRequest.getAddSupervisorRules(), validate, supervisorNewController.addNewSupervisor);
// Route.get("/supervisor/list", AdminRequest.getSupervisorRules(), validate, SuperVisorController.getSuperVisorList)
// Route.put("/supervisor/update/:id", AdminRequest.getUpdateSupervisorRules(), validate, SuperVisorController.updateSuperVisor)
// Route.delete("/supervisor/remove/:id", AdminRequest.getDeleteSupervisorRules(), validate, SuperVisorController.removeSuperVisor)
Route.delete( "/supervisor/remove/:userId/:id", AdminRequest.getDeleteSupervisorRules(), validate, supervisorNewController.deleteASupervisor );
// Route.get("/supervisors", SuperVisorController.getSupervisor)
Route.get("/supervisors/:userId", supervisorNewController.getAllSupervisors)
//End supervisor routes

//Uploader routes
// Route.post("/uploader/create/:userId", AdminRequest.getAddUploaderRules(), validate, UploaderController.createUploader);
Route.post("/uploader/create/:userId", AdminRequest.getAddUploaderRules(), validate, uploaderNewController.addNewUploader);
Route.put("/uploader/update/:id", AdminRequest.getUpdateUploaderRules(), validate, UploaderController.updateUploader)
// Route.delete("/uploader/remove/:id", AdminRequest.getDeleteUploaderRules(), validate, UploaderController.removeUploader)
Route.delete("/uploader/remove/:userId/:id", AdminRequest.getDeleteUploaderRules(), validate, uploaderNewController.deleteUploader)
// Route.get("/uploaders", UploaderController.getUploader)
Route.get("/uploaders/:userId", uploaderNewController.getAllUploaders)
//End uploader routes

//Influencer routes
Route.post("/influencer/create", AdminRequest.getAddInfluencerRules(), validate, InfluencerController.addInfluencer);
Route.get("/influencer/list", AdminRequest.getInfluencerRules(), InfluencerController.getInfluencerList);
Route.get("/influencers", AdminRequest.getInfluencerRules(), InfluencerController.getInfluencerList);
Route.put("/influencer/update/:id",AdminRequest.getUpdateInfluencerRules(),validate,  InfluencerController.updateInfluencer);
//influencer routes

//brand routes
Route.post("/brand/create", AdminRequest.getAddBrandRules(), validate, BrandController.addBrand)
Route.get("/brands", BrandController.getBrands)
//end of brand routes

//product routes
Route.post("/product/create", AdminRequest.getAddProductRules(), validate, ProductController.addProduct)
Route.get("/products", AdminRequest.getProductRules(), ProductController.getProducts)
//end of product routes

//platform routes
// Route.post("/platform/create", AdminRequest.getAddPlatformRules(), validate, PlatformController.addPLatform)
Route.post("/platform/create/:userId", AdminRequest.getAddPlatformRules(), validate, platformNewController.addNewPlatform)
// Route.get("/platforms", PlatformController.getPlatforms)
Route.get( "/platforms/:userId", platformNewController.getAllPlatform )
Route.delete("/platform/remove/:userId/:id", platformNewController.deleteAPlatform);
//end of platform routes

//ads routes
Route.put("/ads/update/:id", AdsRequest.getUpdateRules(), validate, AdsController.updateAds)
//end of platform routes

//chart routes
Route.get("/chart/ads", ChartRequest.getChartAdsRules(), ChartController.getAdsChart)
Route.get("/chart/top-5", ChartRequest.getChartTop5Rules(), ChartController.getTopUsers)
//end of chart routes

module.exports = Route;
