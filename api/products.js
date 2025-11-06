// api/products.js
export default async function handler(req, res) {
  try {
    const STORE_DOMAIN = process.env.SHOPIFY_DOMAIN; // e.g. toplineclearys.myshopify.com
    const TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;
    const API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-10';

    const isPost = req.method === 'POST';
    const body = isPost
      ? (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {}))
      : {};
    const q = (req.query?.query || body.query || 'paint').replace(/"/g, '\\"');

    const gql = String.raw;
    const QUERY = gql`
      query Products($q: String!) {
        products(first: 6, query: $q) {
          edges {
            node {
              id
              title
              handle
              vendor
              productType
              onlineStoreUrl
              variants(first: 1) {
                edges {
                  node {
                    availableForSale
                    price { amount currencyCode }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const resp = await fetch(`https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': TOKEN,
      },
      body: JSON.stringify({ query: QUERY, variables: { q } }),
    });

    const json = await resp.json();
    if (json.errors) {
      return res.status(200).json({ error: true, message: json.errors });
    }
    const items = (json.data?.products?.edges || []).map(e => e.node);
    return res.status(200).json({ items });
  } catch (e) {
    return res.status(200).json({ error: true, message: String(e) });
  }
}
