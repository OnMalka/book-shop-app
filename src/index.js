const express = require('express'); 
const cors = require('cors');
const path = require('path');
const hbs = require('hbs');
const cookieParser = require('cookie-parser')

const port = process.env.Port
require('./db/mongoose');
const usersRouter = require('./routers/usersRaouter');
const booksRouter = require('./routers/booksRouter');
const itemsRouter = require('./routers/itemsRouter');




const app = express();
const publicDirectoryPath = path.join(__dirname, '../public');
const partialsPath = path.join(__dirname, '../views/partials');

app.engine('html', require('hbs').__express);
app.set('view engine', 'hbs');
app.set('view options', { layout: '../views/layouts/layout' });
app.use(express.static(publicDirectoryPath));
hbs.registerPartials(partialsPath);
hbs.registerHelper("when", (operand_1, operator, operand_2, options) => {
        var operators = {
            'eq': function(l,r) { return l == r; },
            'noteq': function(l,r) { return l != r; },
            'gt': function(l,r) { return Number(l) > Number(r); },
            'or': function(l,r) { return l || r; },
            'and': function(l,r) { return l && r; },
            '%': function(l,r) { return (l % r) === 0; }
        }
        , result = operators[operator](operand_1,operand_2);
      
        if (result) return options.fn(this);
        else  return options.inverse(this);
    });

app.use(cookieParser());
app.use(express.json());
app.use(cors());
app.use(usersRouter);
app.use(booksRouter);
app.use(itemsRouter);

app.listen(port,()=>{
    console.log('Server conecctes port: ',port);
});












// const app = express();


// // Define paths for Express config
// const publicDirectoryPath = path.join(__dirname, '../public');
// const partialsPath = path.join(__dirname, '../views/partials')
// // app.use(express.static(publicDirectoryPath));
// // Setup handlebars engine and views location
// app.set('view engine', 'hbs')
// hbs.registerPartials(partialsPath)

// const app = express();
// const publicDirectoryPath = path.join(__dirname, '../public');
// const viewsPath = path.join(__dirname, '../templates/views');
// const partialsPath = path.join(__dirname, '../templates/partials');

// app.set('view engine', 'hbs');
// app.set('views', viewsPath);
// app.use(express.static(publicDirectoryPath));
// hbs.registerPartials(partialsPath);