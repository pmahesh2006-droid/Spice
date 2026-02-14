const express = require("express");

const app = express();
app.use(express.json());

// Prices in SGD
const biryaniPrice = 8.50;
const drinkPrice = 2.00;
const gstRate = 0.09; // 9% GST

app.post("/webhook", (req, res) => {
    const intent = req.body.queryResult.intent.displayName;
    const parameters = req.body.queryResult.parameters;
    const contexts = req.body.queryResult.outputContexts;

    let responseText = "";

    // Extract quantity from session if stored
    let quantity = parameters.number;

    // Sometimes quantity is stored in context
    if (!quantity && contexts && contexts.length > 0) {
        const contextParams = contexts[0].parameters;
        quantity = contextParams.number;
    }

    // Intent 07: Provide_Quantity
    if (intent === "Provide_Quantity") {
        const subtotal = quantity * biryaniPrice;

        responseText =
`🇸🇬 Spice Machan SG
Biryani x${quantity} = SGD ${subtotal.toFixed(2)}

Would you like to add a drink? (SGD 2.00)`;

    }

    // Intent 08: Select_drink (Yes)
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

    // Return response to Dialogflow
    res.json({
        fulfillmentText: responseText
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Webhook running on port ${PORT}`);
});