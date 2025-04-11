const express = require('express');
const cors = require('cors');
const dxfRouter = require('./routes/dxf')

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/dxf', dxfRouter)

app.get('/echo', (req, res) => {
    res.json("hii");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
