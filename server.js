'use strict';

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const mongoose = require('mongoose');

const server = express();

server.use(cors());
server.use(express.json());

const PORT = process.env.PORT;

mongoose.connect('mongodb://localhost:27017/digimons',{ useNewUrlParser: true, useUnifiedTopology: true });

const digimonSchema = new mongoose.Schema({
    name:String,
    img:String,
    level:String
});

const DigimonModel = mongoose.model('digimon', digimonSchema);

server.get('/', testHandler);
server.get('/digimons', digimonsHandler)
server.post('/addToFav', addToFavHandler)
server.get('/getFavDigimons', getFavDigimonsHandler)
server.delete('/deleteDigimon/:id', deleteDigimonHandler)
server.put('/updateDigimon/:id', updateDigimonHandler)

function testHandler (req,res){
    res.send('test route');
}

function digimonsHandler (req,res){
    const url =`https://digimon-api.vercel.app/api/digimon`;

    axios.get(url).then(item=>{
        const digimonsArr = item.data.map(element=>{
            return new Digimon(element)
        })

        res.send(digimonsArr);
    })
}

function addToFavHandler(req,res){
    const {name, img, level} = req.body;

    const newDigimon = new DigimonModel({
        name:name,
        img:img,
        level:level
    })
    newDigimon.save();
}

function getFavDigimonsHandler (req,res){
    DigimonModel.find({}, (error, data)=>{
        res.send(data);
    })
}

function deleteDigimonHandler (req,res){
    const id = req.params.id;

    DigimonModel.remove({_id:id},(error,deleteData)=>{
        DigimonModel.find({}, (error, remainingData)=>{
            res.send(remainingData);
        })
    })
}

function updateDigimonHandler (req,res){
    const id = req.params.id;
    const {name, img, level} = req.body;

    DigimonModel.findOne({_id:id}, (error,data)=>{
        data.name=name;
        data.img=img;
        data.level=level;
        data.save().then(()=>{
            DigimonModel.find({}, (error,updatedData)=>{
                res.send(updatedData);
            })
        })
    })
}

class Digimon {
    constructor(data){
        this.name=data.name;
        this.img=data.img;
        this.level=data.level;
    }
}

server.listen(PORT,()=>{
    console.log(`Listening on PORT ${PORT}`);
})