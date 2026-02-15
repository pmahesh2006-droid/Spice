const express = require("express");

const app = express();

// Prices
const biryaniPrice = 8.50;
const drinkPrice = 2.00;
const gstRate = 0.09;

// Health check (Render uses this)
app.get("/", (req, res) => {
    res.send("Server is running.");
});

// Handle ONLY POST requests to webhook
app.post("/webhook", express.json(), (req, res) => {
    try {
        // If no JSON body, return safely
        if (!req.body || !req.body.queryResult) {
            return res.status(200).send("OK");
        }

        const intent = req.body.queryResult.intent.displayName;
        const parameters = req.body.queryResult.parameters || {};
        const contexts = req.body.queryResult.outputContexts || [];

        let quantity = parameters.number;

        if (!quantity) {
            contexts.forEach(context => {
                if (context.parameters?.number) {
                    quantity = context.parameters.number;
                }
            });
        }

        quantity = Number(quantity) || 1;

        let responseText = "";

        if (intent === "Provide_Quantity") {
            const subtotal = quantity * biryaniPrice;

            responseText =
`🇸🇬 Spice Machan SG
Biryani x${quantity} = SGD ${subtotal.toFixed(2)}

Would you like to add a drink? (SGD 2.00)`;
        }

        else if (intent === "Select_drink") {
            const subtotal = (quantity * biryaniPrice) + drinkPrice;
            const gst = subtotal * gstRate;
            const total = subtotal + gst;

            responseText =
`Drink added 🥤

Subtotal: SGD ${subtotal.toFixed(2)}
GST (9%): SGD ${gst.toFixed(2)}
Total: SGD ${total.toFixed(2)}`;
        }

        else if (intent === "No_Drink") {
            const subtotal = quantity * biryaniPrice;
            const gst = subtotal * gstRate;
            const total = subtotal + gst;

            responseText =
`No drink added.

Subtotal: SGD ${subtotal.toFixed(2)}
GST (9%): SGD ${gst.toFixed(2)}
Total: SGD ${total.toFixed(2)}`;
        }

        else {
            responseText = "Sorry, I didn’t understand that.";
        }

        res.status(200).json({
            fulfillmentText: responseText
        });

    } catch (error) {
        console.error("Webhook error:", error);
        res.status(200).json({
            fulfillmentText: "Something went wrong."
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Webhook running on port ${PORT}`);
});
