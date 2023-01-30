import * as api from './api';
const getItems = async()=>{
try {
const {data} = await api.getItems();
return data
} catch (error) {
console.log(error)
}
}
const createItem = async(todo)=>{
try {
const {data} = await api.createItem(todo);
return data
} catch (error) {
console.log(error)
}
}

export{getItems, createItem }