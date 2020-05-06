import { combineReducers } from "redux";
import alert from "./alert.js";
import auth from "./auth.js";
export default combineReducers({ alert, auth });
