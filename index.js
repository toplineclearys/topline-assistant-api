// index.js
import express from "express";
import fetch from "node-fetch";

const app = express();

// simple product search endpoint
app.get("/api/products", async (req, res) => {
  const query = req.query.query || "paint";

  try {
    const response = await fetch(
      `https://${process.env.SHOPIFY_DOMAIN}/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_STOREFRONT_TOKEN,
        },
        body: JSON.stringify({
          query: `
            {
              products(first: 5, query: "${query}") {
                edges {
                  node {
                    id
                    title
                    description
                    onlineStoreUrl
                    variants(first: 1) {
                      edges {
                        node {
                          price {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          `,
        }),
      }
    );

    const data = await response.json();
    res.json(data.data.products.edges.map(e => e.node));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// vercel needs a default export
export default app;
