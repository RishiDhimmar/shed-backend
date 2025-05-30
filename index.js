const express = require('express');
const cors = require('cors');
const dxfRouter = require('./routes/dxf')

require('dotenv').config();
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/api/dxf', dxfRouter)


app.get('/test', (req, res) => {
    res.json("working branch");
});
app.post('/echo', (req, res) => {
    res.json(req.body);
});
console.log(process.env.PORT)

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
