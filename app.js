///Libraries added ---------------------->..>>>>>>>
const express = require("express");

const bodyParser = require("body-parser");

const mongoose = require("mongoose");

// App Initialization ................>
const app = express();

app.set("view engine", "ejs");

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

// Connecting mongoose to localhost .................>
mongoose.connect("mongodb+srv://admin:test123@cluster0.49mmaxn.mongodb.net/todolistDB");

// Schema for item in the list.......................>
const itemSchema = {
    name: String, 
};

// Schema for custom-list .......................>
const listSchema = {
    name: String,
    items: [itemSchema],
};

const Item = new mongoose.model("Item", itemSchema);

const List = new mongoose.model("List", listSchema);

// item initialization ...............................>
const Item1 = new Item({
    name: "Welcome to List",
});

const Item2 = new Item({
    name: "Click on + to add new item to list",
});
const Item3 = new Item({
    name: "Click on checkbox to mark it as done",
});

// items added to DB.....................Item.........>
const defaultItems = [Item1, Item2, Item3];

var port = 3000;

// command to use all statitc files in public folder ...............//////.>
app.use(express.static("public"));

// Get Request for '/' root page ###########################################
app.get("/", (req, res) => {
    Item.find()
        .then((result) => {
            const newTs = result;

            if (newTs.length === 0) {
                res.render("index", {
                    listName: "Today",
                    list: [{name : "click + down below to add item "}],
                });

                res.redirect("/");
            } else {
                res.render("index", {
                    listName: "Today",
                    list: newTs,
                });
            }
        })
        .catch((err) => {
            console.log(err);
        });
});
// ######################################//

// POST request Handling for '/' root site #################
app.post("/", (req, res) => {
    var newT = req.body.newTask;

    let listName = req.body.list;

    if (!newT.replace(/\s/g, "").length) {
        console.log(
            "string only contains whitespace (ie. spaces, tabs or line breaks)"
        );
        res.redirect("/");
    } else {
        const item5 = new Item({
            name: newT,
        });

        if (listName === "Today") {
            Item.insertMany(item5);
            res.redirect("/");
        } else {
            List.findOne({
                name: listName,
            }).then((result) => {
                result.items.push(item5);

                result.save();
                res.redirect("/" + listName);
            });
        }
    }
});

// #######################################//

// Handling Delete Requests #####################
app.post("/delete", (req, res) => {
    const checkedItemID = req.body.check;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemID).catch((err) => {
            console.log(err);
        });

        res.redirect("/");
    } else {
        List.findOne({
            name: listName,
        }).then((foundList) => {
            foundList.items.pull({
                _id: checkedItemID,
            });
            foundList.save();

            res.redirect("/" + listName);
        });
    }
});

// For customList WebPage #######################
app.get("/:customList", (req, res) => {
    let  customList = req.params.customList;

    let firstLetterCapt = customList.slice(0,1).toUpperCase() + customList.slice(1,customList.length).toLowerCase()

    customList  = firstLetterCapt ; 

    List.findOne({
            name: customList,
        })

        .then((foundItem) => {
            if (!foundItem) {
                const list = new List({
                    name: customList,
                    items: defaultItems,
                });

                console.log("Not Found");
                list.save()
                .then(()=>{res.redirect("/" + customList)})
            } else {
                console.log(foundItem.items);
                res.render("index", {
                    listName: foundItem.name,
                    list: foundItem.items,
                });
            }
        })

        .catch((err) => {
            console.log(err);
        });
});

// Finally app listen command
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});