//[THIRD-PARTY-LIBRARIES]
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const SessionStore = require("connect-mongo")(session);

//<[TESTING]>
const dbTest = require("./test/populate-db");

//[APP-MODULES]
const registration = require("./api/registration");
const authetication = require("./api/authentication");
const admin = require("./api/admin");
const worker = require("./api/worker");
const company = require("./api/company");

//[CONFIG]
const PORT = process.env.PORT || 3000;
const dbURI = "mongodb://127.0.0.1/PIA";
const clientOrigin = "http://localhost:4200";
const sessionSecret = "PIA_EXPRESS_SESSION_KEY#060520";

//[START-UP]
const app = express();
app.listen(PORT, () => {
  console.info(`[APP]: Server running @localhost:${PORT}.`);
});

//[DB-CONNECT]
mongoose.connect(
  dbURI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) {
      console.error(
        "[APP][DB]: Database-Connection-Exception: Connection failed."
      );
      console.error(err);
    } else {
      console.info("[APP][DB]: Database-Connection: Success.");
    }
  }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "[ERROR][DB]:\n"));

//[MIDDLEWARE]
//>Cross-Origin-Resource-Sharing
app.use(
  cors({
    origin: [clientOrigin],
    credentials: true,
  })
);
//>Request-Processing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//>Session-Management
app.use(
  session({
    secret: sessionSecret,
    saveUninitialized: false,
    resave: false,
    store: new SessionStore({
      url: dbURI,
      touchAfter: 24 * 60 * 60,
    }),
  })
);

//[EXPORTS]
exports.app = app;
exports.db = db;

//<====[API]====>

//[REGISTRATION]
const registrationPath = "/api/registration";

app.post(
  `${registrationPath}/worker`,
  registration.processWorkerRegistrationRequest
);

app.post(
  `${registrationPath}/company`,
  registration.processCompanyRegistrationRequest
);

//[USER-AUTHETICATION]
const authenticationPath = "/api/authentication";

app.post(`${authenticationPath}/login`, authetication.loginUser);

app.get(`${authenticationPath}/login`, authetication.userLoggedIn);

app.post(
  `${authenticationPath}/logout`,
  authetication.hasSession,
  authetication.logoutUser
);

app.post(
  `${authenticationPath}/change-password`,
  authetication.hasSession,
  authetication.changePassword
);

//[USER-ADMIN-MODULE]
const adminPath = "/api/admin";

app.get(
  `${adminPath}/pending`,
  admin.checkAdminPrivilege,
  admin.getPendingRequests
);

app.post(
  `${adminPath}/pending`,
  admin.checkAdminPrivilege,
  admin.acceptOrRejectPendingRequest
);

app.get(`${adminPath}/users`, admin.checkAdminPrivilege, admin.getAllUsers);

app.post(
  `${adminPath}/users/search`,
  admin.checkAdminPrivilege,
  admin.searchUsers
);

app.post(
  `${adminPath}/users/role`,
  admin.checkAdminPrivilege,
  admin.getUsersByRole
);

app.post(
  `${adminPath}/users/delete`,
  admin.checkAdminPrivilege,
  admin.deleteUser
);

app.post(
  `${adminPath}/user/details`,
  admin.checkAdminPrivilege,
  admin.getUserDetails
);

app.post(`${adminPath}/user/edit`, admin.checkAdminPrivilege, admin.editUser);

app.post(`${adminPath}/user`, admin.checkAdminPrivilege, admin.createNewUser);

//[USER-WORKER-MODULE]
const workerPath = "/api/worker";

app.post(
  `${workerPath}/hothouse/create`,
  worker.checkWorkerPermission,
  worker.createHothouse
);

app.get(
  `${workerPath}/hothouse`,
  worker.checkWorkerPermission,
  worker.getHothouses
);

app.post(
  `${workerPath}/hothouse/warehouse`,
  worker.checkWorkerPermission,
  worker.getWarehouse
);

app.post(
  `${workerPath}/hothouse/warehouse/filter`,
  worker.checkWorkerPermission,
  worker.filterWarehouse
);

app.post(
  `${workerPath}/hothouse/dashboard`,
  worker.checkWorkerPermission,
  worker.getHothouseDashboardData
);

app.post(
  `${workerPath}/hothouse/seedling`,
  worker.checkWorkerPermission,
  worker.createSeedling
);

app.post(
  `${workerPath}/hothouse/warehouse/update`,
  worker.checkWorkerPermission,
  worker.updateWarehouseItem
);

app.post(
  `${workerPath}/hothouse/seedling/update`,
  worker.checkWorkerPermission,
  worker.updateSeedling
);

app.post(
  `${workerPath}/hothouse/update`,
  worker.checkWorkerPermission,
  worker.updateHothouse
);

app.post(
  `${workerPath}/hothouse/notify`,
  worker.checkWorkerPermission,
  worker.hothouseLowConditionsNotify
);

app.get(
  `${workerPath}/store`,
  worker.checkWorkerPermission,
  worker.getStoreProducts
);

app.post(
  `${workerPath}/store/order`,
  worker.checkWorkerPermission,
  worker.makeNewOrder
);

app.post(
  `${workerPath}/store/check-order-history`,
  worker.checkWorkerPermission,
  worker.checkOrderHistory
);

app.post(
  `${workerPath}/store/product/comments`,
  worker.checkWorkerPermission,
  worker.updateProductComments
);

app.post(
  `${workerPath}/orders`,
  worker.checkWorkerPermission,
  worker.getUndeliveredUserOrders
);

app.post(
  `${workerPath}/orders/cancel`,
  worker.checkWorkerPermission,
  worker.cancelOrder
);

app.get(
  `${workerPath}/warehouses`,
  worker.checkWorkerPermission,
  worker.getWarehouses
);

//[USER-COMPANY-MODULE]
const companyPath = "/api/company";

app.get(
  `${companyPath}/catalog`,
  company.checkCompanyPermission,
  company.getCompanyCatalog
);

app.post(
  `${companyPath}/catalog/product`,
  company.checkCompanyPermission,
  company.getProduct
);

app.post(
  `${companyPath}/catalog/product/availability`,
  company.checkCompanyPermission,
  company.toggleProductAvailability
);

app.post(
  `${companyPath}/catalog/add`,
  company.checkCompanyPermission,
  company.addProduct
);

app.get(
  `${companyPath}/analytics`,
  company.checkCompanyPermission,
  company.getAnalytics
);

app.post(
  `${companyPath}/orders`,
  company.checkCompanyPermission,
  company.getOrdersBacklog
);

app.get(
  `${companyPath}/orders/by-status`,
  company.checkCompanyPermission,
  company.getOrdersBacklogByStatus
);

app.get(
  `${companyPath}/couriers`,
  company.checkCompanyPermission,
  company.getCouriers
);

app.post(
  `${companyPath}/orders/accept`,
  company.checkCompanyPermission,
  company.acceptOrder
);

app.post(
  `${companyPath}/orders/reject`,
  company.checkCompanyPermission,
  company.rejectOrder
);

app.post(
  `${companyPath}/couriers/deliver`,
  company.checkCompanyPermission,
  company.deliverOrder
);

app.post(
  `${companyPath}/couriers/done`,
  company.checkCompanyPermission,
  company.returnToHQ
);

//<====[TESTING]====>
app.get("/test/add-admin", dbTest.addMasterAdmin);
