const { model } = require("mongoose");
const { mongoose } = require("../config/mongoose");


const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const User = new Schema({
    email : {type : String , unique : true},
    password : String,
    hotelName : String,
})

const Data = new Schema({
    userId : { type: ObjectId, ref: 'users-datas' },
    phoneNumber : String,
    openingTime : String,
})

const UserModel = mongoose.model('users-datas', User);
const DataModel = mongoose.model('hotel-datas',Data);

module.exports = {
    UserModel : UserModel,
    DataModel : DataModel,
}
