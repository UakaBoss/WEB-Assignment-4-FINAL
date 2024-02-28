const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const portfolioItemSchema = new Schema({
    images: String,
    name: String,
    description: String,
    mainShow: String,
    mainShow: { type: Boolean, default: false },
    createdAt: String,
    updatedAt: String,
});

const PortfolioItem = mongoose.model('PortfolioItem', portfolioItemSchema);

module.exports = PortfolioItem;
