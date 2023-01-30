import axios from 'axios';
import { get, post } from "./utilities";
const url = "http://localhost:3000/items";
export const getItems = ()=>get("/api/items");
export const createItem = (item)=>post("/api/items",item);