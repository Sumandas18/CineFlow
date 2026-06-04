const Plan = require('../models/Plan');

class PlanController {
    // Get all plans (public)
    static async getPlans(req, res, next) {
        try {
            let plans = await Plan.find();
            
            // Seed defaults if empty
            if (plans.length === 0) {
                const defaults = [
                    { name: 'Starter', price: 199 },
                    { name: 'Creator Pro', price: 499 },
                    { name: 'Unlimited Pro+', price: 899 }
                ];
                await Plan.insertMany(defaults);
                plans = await Plan.find();
            }

            res.status(200).json({ success: true, plans });
        } catch (error) {
            next(error);
        }
    }

    // Update a plan's price (admin only)
    static async updatePlan(req, res, next) {
        try {
            const { name, price } = req.body;
            if (!name || price === undefined) {
                return res.status(400).json({ message: 'Name and price are required' });
            }

            const updatedPlan = await Plan.findOneAndUpdate(
                { name },
                { price: Number(price) },
                { new: true, upsert: true }
            );

            res.status(200).json({ success: true, plan: updatedPlan });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = PlanController;
