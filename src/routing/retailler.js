const express = require("express");
const router = new express.Router();
const {
    checkAuthenticated,
    checkNotAuthenticated,
    checkIsRetailler,
    checkIsNGO
} = require("../utils/middleware");
const connection = require("../utils/dbconnection");

router.get("/retailer_dashboard",[checkAuthenticated, checkIsRetailler] ,(req, res) => {
    let ngo = false, retailler = false;
    if(!req.user){
    }else if(req.user.status === "ngo"){
        ngo = true;
    }else{
        retailler = true;
    }
    const sql = "select * from retailler where email = '" +req.user.email+ "'";
    try {
        connection.query(sql, (err, rows) => {
            const data = rows[0];
            const sql2 = "select * from items where email = '" +req.user.email+ "'";
            connection.query(sql2, (err2, rows2) => {
                res.render("retailer_dashboard",{
                    rows2,
                    data,
                    retailler,
                    ngo                
                })
            })
        })
    } catch (error) {
        console.log(error);
        res.render("index",{
            ngo,
            retailler
        })
    }
})
router.get("/fooditems", (req, res) => {
    let ngo = false, retailler = false;
    if(!req.user){
    }else if(req.user.status === "ngo"){
        ngo = true;
    }else{
        retailler = true;
    }
    const sql = "select * from items, retailler where items.email = retailler.email;";
    connection.query(sql, (err, rows)=>{
        let date2 = new Date()
        let t2 = date2.getTime();
        let newrows = [];
        for(let i=0; i<rows.length; i++) {
            let curprice = rows[i].discounted_price;
            let date1 = new Date(rows[1].expiry);
            let t1 = date1.getTime();
            var Difference_In_Time = t1 - t2;
            if(Difference_In_Time < 0) continue;
            var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
            console.log("diffrence in days ",Difference_In_Days);
            rows[i].discounted_price = Math.ceil(curprice - curprice*Difference_In_Days*0.01);
            newrows.push(rows[i]);
        }
        // console.log("newrows",newrows);
        res.render("fooditems", {
            newrows,
            ngo,
            retailler
        })
    })
})
router.get("/additem",[checkAuthenticated, checkIsRetailler] ,(req, res) => {
    let ngo = false, retailler = false;
    if(!req.user){
    }else if(req.user.status === "ngo"){
        ngo = true;
    }else{
        retailler = true;
    }
    res.render("additem", {
        ngo,
        retailler
    })
})
router.post("/additem", (req, res) => {
    const product_name = req.body.product_name;
    const brand = req.body.brand
    const quantity = req.body.quantity
    const expiry = req.body.expiry
    const actual_price = req.body.actual_price
    const discounted_price = req.body.discounted_price
    const retailler = true;
    try {
        const sql = "INSERT INTO `items` (`id`, `email`, `product_name`, `brand`, `expiry`, `quantity`, `actual_price`, `discounted_price`) VALUES (NULL, '"+req.user.email+"', '"+product_name+"', '"+brand+"', '"+expiry+"', '"+quantity+"', '"+actual_price+"', '"+discounted_price+"');"
        connection.query(sql, (err, rows)=> {
            res.render("additem",{
                retailler,
                rows,
                msg : "Item Added"
            });
        })
    } catch (error) {
        console.log(error);
        res.render("additem",{
            msg : "Item is not added",
            retailler
        })
    }
})
router.get("/shopinfo" ,(req, res) => {
    let ngo = false, retailler = false;
    if(!req.user){
    }else if(req.user.status === "ngo"){
        ngo = true;
    }else{
        retailler = true;
    }
    const sql = "select * from retailler where email = '" +req.query.email+ "'";
    try {
        connection.query(sql, (err, rows) => {
            const data = rows[0];
            const sql2 = "select * from items where email = '" +req.query.email+ "'";
            connection.query(sql2, (err2, rows2) => {
                res.render("shopinfo",{
                    rows2,
                    data,
                    retailler,
                    ngo                
                })
            })
        })
    } catch (error) {
        console.log(error);
        res.render("index",{
            ngo,
            retailler
        })
    }
})
router.get("/temp", (req, res) => {
    res.render("temp");
})
module.exports = router;