const express = require("express");

const app = express();
app.use(express.json());

// Prices in SGD
const biryaniPrice = 8.50;
const drinkPrice = 2.00;
const gstRate = 0.09; // 9% GST

app.post("/webhook", (req, res) => {
    try {
        const intent = req.body.queryResult?.intent?.displayName;
        const parameters = req.body.queryResult?.parameters || {};
        const contexts = req.body.queryResult?.outputContexts || [];

        let responseText = "";
        let quantity = parameters.number;

        // Try to get quantity from context if not provided
        if (!quantity && contexts.length > 0) {
            contexts.forEach(context => {
                if (context.parameters?.number) {
                    quantity = context.parameters.number;
                }
            });
        }

        // Default quantity to 1 if still missing
        quantity = Number(quantity) || 1;

        // Intent 07: Provide_Quantity
        if (intent === "Provide_Quantity") {
            const subtotal = quantity * biryaniPrice;

            responseText =
`🇸🇬 Spice Machan SG
Biryani x${quantity} = SGD ${subtotal.toFixed(2)}

Would you like to add a drink? (SGD 2.00)`;
        }

        // Intent 08: Select_drink
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

        // Intent 09: No_Drink
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

        // Fallback
        else {
            responseText = "Sorry, I didn’t understand that.";
        }

        res.json({
            fulfillmentText: responseText
        });

    } catch (error) {
        console.error("Webhook error:", error);
        res.json({
            fulfillmentText: "Something went wrong. Please try again."
        });
    }
});

// Health check route (important for some deploy platforms)
app.get("/", (req, res) => {
    res.send("Webhook server is running.");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Webhook running on port ${PORT}`);
});
