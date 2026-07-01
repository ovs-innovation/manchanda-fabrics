# Manchanda Admin Architecture

> **Manchanda Admin Architecture**

## Core platform modules (reused)

- Auth / JWT
- Product, Order, Coupon, Cart, Checkout APIs
- Payment integration (Stripe, Razorpay, COD)
- Shiprocket
- Reviews & notifications
- Admin RBAC

## Removed from Admin

- Prescriptions, Wholesalers, Retailers
- Pharmacy product fields (batch, expiry, composition, etc.)
- POS / New Sale (hidden from sidebar — route still exists if needed)
- Legacy grocery homepage tabs

## Manchanda Admin Sidebar

```
Dashboard
Orders
Catalog (Products, Categories, Reviews)
Inventory
Customers & Marketing
Settings
Admins
```

## Product Form Fields

Name, Brand, Category, Gender, MRP, Sale Price, Sizes, Colors, Stock, SKU, Description, Gallery, Homepage flags (Featured / New Arrival / Trending / Sale).

## Homepage settings

Saved under `storeCustomizationSetting.setting.manchandaHomepage`:

- Hero slides (copy + links)
- Brands section toggle
- Instagram posts
- Trending / New Arrival product picks
- Category banners

## DB Seeds

```bash
node backend/script/migrateManchandaCategories.js
node backend/script/migrateManchandaBrands.js
```
