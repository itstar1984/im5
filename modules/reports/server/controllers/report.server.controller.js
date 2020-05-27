const mongoose = require('mongoose');
const aqp = require('api-query-params');
const Ventas = mongoose.model('Venta');
const Compras = mongoose.model('Compra');
const Users = mongoose.model('User');
const CostCenters = mongoose.model('Costcenter')

const processQuery = async (data) => {
    return data.reduce(async (previous, current) => {
        const acu = await previous;
        const user = await Users.findOne({_id: current.user}).exec();
        const { centroDeCosto } = user;
        const CostCenter = await CostCenters.findOne({_id: centroDeCosto }).exec();
        const { name } = CostCenter;
        const { products, condicionVenta, tipoComprobante, cliente, proveedor } = current;
        const items = products.map(product => ({ ...product, tipoComprobante, cliente, proveedor }));
        return {
            ...acu,
            [centroDeCosto]: {
                salesCondition: {
                    ...(() => {
                        if (acu[centroDeCosto]) return acu[centroDeCosto].salesCondition;
                        return undefined
                    })(),
                    [condicionVenta.name]: {
                        quantity: (() => {
                            if (acu[centroDeCosto] && acu[centroDeCosto].salesCondition[condicionVenta.name]) return acu[centroDeCosto].salesCondition[condicionVenta.name].quantity + 1;
                            return 1;
                        })(),
                        total: (()=> {
                            if (acu[centroDeCosto] && acu[centroDeCosto].salesCondition[condicionVenta.name]) return acu[centroDeCosto].salesCondition[condicionVenta.name].total + current.total;
                            return current.total;
                        })(),
                    }
                },
                vouchers: {
                    ...(() => {
                        if (acu[centroDeCosto]) return acu[centroDeCosto].vouchers;
                        return undefined
                    })(),
                    [tipoComprobante.name]: {
                        quantity: (() => {
                            if (acu[centroDeCosto] && acu[centroDeCosto].vouchers[tipoComprobante.name]) return acu[centroDeCosto].vouchers[tipoComprobante.name].quantity + 1;
                            return 1;
                        })(),
                        total: (()=> {
                            if (acu[centroDeCosto] && acu[centroDeCosto].vouchers[tipoComprobante.name]) return acu[centroDeCosto].vouchers[tipoComprobante.name].total + current.total;
                            return current.total;
                        })(),
                    }
                },
                name,
                products: !acu[centroDeCosto] ? items : [...acu[centroDeCosto].products, ...items],
                total: !acu[centroDeCosto] ? current.total : acu[centroDeCosto].total + current.total,
                quantity: !acu[centroDeCosto] ? 1 : acu[centroDeCosto].quantity + 1
            }
        }
    }, Promise.resolve({}))
}

const getSalesReport = async (req, res) => {
    const { filter, sort } = aqp(req.query);
    try {
        const sales = await Ventas.find(filter)
            .sort(sort)
            .populate('tipoComprobante')
            .populate('condicionVenta')
            .populate('cliente')
            .lean()
            .exec()
        const data = await processQuery(sales);
        res.send(Object.keys(data).map((k) => ({
            ...data[k],
            salesCondition: Object.keys(data[k].salesCondition).map(key => ({ name: key, ...data[k].salesCondition[key]})),
            vouchers: Object.keys(data[k].vouchers).map(key => ({ name: key, ...data[k].vouchers[key]})),
            id: k
        })));
    }
    catch (error) {
        console.log(error)
    }
};

const getPurchasesReport = async (req, res) => {
    const { filter, sort } = aqp(req.query);
    try {
        const purchases = await Compras.find(filter)
            .sort(sort)
            .populate('tipoComprobante')
            .populate('condicionVenta')
            .populate('proveedor')
            .lean()
            .exec()

        const data = await processQuery(purchases);
        res.send(Object.keys(data).map((k) => ({
            ...data[k],
            salesCondition: Object.keys(data[k].salesCondition).map(key => ({ name: key, ...data[k].salesCondition[key]})),
            vouchers: Object.keys(data[k].vouchers).map(key => ({ name: key, ...data[k].vouchers[key]})),
            id: k
        })));
    }
    catch (error) {
        console.log(error)
    }
};

module.exports = {
    getSalesReport,
    getPurchasesReport
}