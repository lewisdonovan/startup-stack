---
name: Shopify Orders to Xero
description: Sync Shopify orders to Xero as draft invoices for accounting.
tags: [shopify, xero]
---

# Shopify Orders → Xero Invoices

Sync Shopify orders to Xero as draft invoices for accounting.

## Description

This skill automates the creation of Xero invoices from Shopify orders. Each new Shopify order becomes a draft invoice in Xero, keeping accounting in sync with sales.

## Steps

1. Use Shopify MCP to fetch recent orders (configurable date range)
2. For each order that doesn't already have a corresponding Xero invoice:
   - Create a Xero contact from the customer (name, email, address)
   - Create a draft invoice with line items mapped from order line items
   - Map Shopify product categories to Xero chart of accounts codes
3. Set the invoice status to `DRAFT` for review before submission
4. Record the Xero invoice ID in Shopify order notes for traceability

## Example Prompts

- "Sync all orders from the last 7 days to Xero"
- "Create invoices for unprocessed Shopify orders"
- "Show me orders that haven't been synced to Xero yet"