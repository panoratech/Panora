/*
WMS Database Schema Overview

This schema follows a unified structure with the following object groups:

1. Core Objects (with id_connection, remote tracking, metadata):
   - wms_warehouses
   - wms_warehouse_customers
   - wms_shipping_methods
   - wms_products
   - wms_inventory_items
   - wms_orders
   - wms_returns
   - wms_inbound_shipments

2. Address Related:
   - wms_addresses
   - wms_warehouses_addresses
   - wms_orders_addresses
   - wms_shipments_addresses

3. Measurement Tables:
   - wms_inventory_items_measurements
   - wms_packages_measurements
   - wms_returns_shipments_measurements

4. Line Items:
   - wms_orders_line_items
   - wms_packages_line_items
   - wms_returns_line_items
   - wms_inbound_shipments_line_items
   - wms_inbound_receipts_line_items

5. Shipment Related:
   - wms_shipments
   - wms_returns_shipments
   - wms_inbound_shipments

6. Inventory Related:
   - wms_inventory_items
   - wms_inventory_levels
   - wms_inventory_locations
   - wms_inventory_substitutes

7. User Management:
   - wms_users
   - wms_permissions
   - wms_user_permissions
   - wms_audit_log
*/

-- Core tables
CREATE TABLE wms_warehouses (
    id_wms_warehouse UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    modified_at TIMESTAMP WITH TIME ZONE NOT NULL,
    id_connection UUID NOT NULL,
    remote_id TEXT,
    remote_was_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    name TEXT,
    code TEXT
);

CREATE TABLE wms_addresses (
    id_wms_address UUID PRIMARY KEY,
    full_name TEXT,
    company TEXT,
    address1 TEXT,
    address2 TEXT,
    address3 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT
);

CREATE TABLE wms_warehouses_addresses (
    id_wms_warehouse UUID REFERENCES wms_warehouses(id_wms_warehouse),
    id_wms_address UUID REFERENCES wms_addresses(id_wms_address),
    PRIMARY KEY (id_wms_warehouse)
);

CREATE TABLE wms_warehouse_customers (
    id_wms_warehouse_customer UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    modified_at TIMESTAMP WITH TIME ZONE NOT NULL,
    id_connection UUID NOT NULL,
    remote_id TEXT,
    remote_was_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    name TEXT,
    email TEXT
);

CREATE TABLE wms_shipping_methods (
    id_wms_shipping_method UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    modified_at TIMESTAMP WITH TIME ZONE NOT NULL,
    id_connection UUID NOT NULL,
    remote_id TEXT,
    remote_was_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    name TEXT,
    carrier TEXT
);

CREATE TABLE wms_channels (
    id_wms_channel UUID PRIMARY KEY,
    name TEXT
);

-- Products
CREATE TABLE wms_products (
    id_wms_product UUID PRIMARY KEY,
    id_wms_warehouse_customer UUID REFERENCES wms_warehouse_customers(id_wms_warehouse_customer),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    modified_at TIMESTAMP WITH TIME ZONE NOT NULL,
    id_connection UUID NOT NULL,
    remote_id TEXT,
    remote_was_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    name TEXT,
    sku TEXT,
    gtin TEXT,
    unit_price DECIMAL(10,2),
    is_kit BOOLEAN,
    active BOOLEAN,
    supplier TEXT,
    country_of_origin TEXT,
    harmonized_code TEXT,
    external_system_url TEXT
);

CREATE TABLE wms_products_inventory_items (
    id_wms_product UUID REFERENCES wms_products(id_wms_product),
    id_wms_inventory_item UUID,
    sku TEXT,
    unit_quantity INTEGER,
    PRIMARY KEY (id_wms_product, id_wms_inventory_item)
);

CREATE TABLE wms_products_supplier_items (
    id_wms_product UUID REFERENCES wms_products(id_wms_product),
    id_wms_supplier UUID,
    supplier_name TEXT,
    external_id TEXT,
    unit_cost DECIMAL(10,2),
    PRIMARY KEY (id_wms_product, id_wms_supplier)
);

-- Inventory
CREATE TABLE wms_inventory_items (
    id_wms_inventory_item UUID PRIMARY KEY,
    id_wms_warehouse_customer UUID REFERENCES wms_warehouse_customers(id_wms_warehouse_customer),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    modified_at TIMESTAMP WITH TIME ZONE NOT NULL,
    id_connection UUID NOT NULL,
    remote_id TEXT,
    remote_was_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    name TEXT,
    sku TEXT,
    unit_cost DECIMAL(10,2),
    active BOOLEAN,
    external_system_url TEXT
);

CREATE TABLE wms_inventory_items_measurements (
    id_wms_inventory_item UUID PRIMARY KEY REFERENCES wms_inventory_items(id_wms_inventory_item),
    length DECIMAL(10,2),
    width DECIMAL(10,2),
    height DECIMAL(10,2),
    unit TEXT,
    weight DECIMAL(10,2),
    weight_unit TEXT
);

CREATE TABLE wms_inventory_levels (
    id_wms_inventory_item UUID REFERENCES wms_inventory_items(id_wms_inventory_item),
    id_wms_warehouse UUID REFERENCES wms_warehouses(id_wms_warehouse),
    onhand INTEGER,
    committed INTEGER,
    unfulfillable INTEGER,
    fulfillable INTEGER,
    unsellable INTEGER,
    sellable INTEGER,
    awaiting INTEGER,
    PRIMARY KEY (id_wms_inventory_item, id_wms_warehouse)
);

CREATE TABLE wms_lots (
    id_wms_lot UUID PRIMARY KEY,
    id_wms_inventory_item UUID REFERENCES wms_inventory_items(id_wms_inventory_item),
    id_wms_warehouse UUID REFERENCES wms_warehouses(id_wms_warehouse),
    onhand INTEGER,
    expiration_date TIMESTAMP WITH TIME ZONE
);

CREATE TABLE wms_locations (
    id_wms_location UUID PRIMARY KEY,
    id_wms_warehouse UUID REFERENCES wms_warehouses(id_wms_warehouse)
);

CREATE TABLE wms_inventory_locations (
    id_wms_inventory_item UUID REFERENCES wms_inventory_items(id_wms_inventory_item),
    id_wms_location UUID REFERENCES wms_locations(id_wms_location),
    id_wms_warehouse UUID REFERENCES wms_warehouses(id_wms_warehouse),
    quantity INTEGER,
    PRIMARY KEY (id_wms_inventory_item, id_wms_location)
);

CREATE TABLE wms_inventory_substitutes (
    id_wms_inventory_item UUID REFERENCES wms_inventory_items(id_wms_inventory_item),
    substitute_sku TEXT,
    PRIMARY KEY (id_wms_inventory_item, substitute_sku)
);

-- Orders
CREATE TABLE wms_orders (
    id_wms_order UUID PRIMARY KEY,
    id_wms_warehouse_customer UUID REFERENCES wms_warehouse_customers(id_wms_warehouse_customer),
    id_wms_warehouse UUID REFERENCES wms_warehouses(id_wms_warehouse),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    modified_at TIMESTAMP WITH TIME ZONE NOT NULL,
    id_connection UUID NOT NULL,
    remote_id TEXT,
    remote_was_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    reference_id TEXT,
    order_number TEXT,
    -- Status can be one of:
    -- 'open'                  - Order has been placed
    -- 'confirmed'             - Order has been confirmed by the warehouse
    -- 'processing'            - Order is being processed and items are being picked
    -- 'picked'                - Items in order have been picked
    -- 'packed'                - Items in order have been packed
    -- 'partially_fulfilled'   - Order has been partially fulfilled
    -- 'fulfilled'             - Order has been fulfilled and shipped
    -- 'backordered'          - Order cannot be fulfilled because of a lack of available inventory
    -- 'exception'             - There is an issue with the order
    -- 'cancelled'             - Order has been cancelled by either the warehouse or the customer
    -- 'other'                 - Status can't be determined. See raw_status field for more information
    status TEXT,
    -- Contains the original status from the external system when status is 'other'
    raw_status TEXT,
    id_wms_channel UUID REFERENCES wms_channels(id_wms_channel),
    -- The type of order, such as d2c or b2b
    -- Available options:
    -- 'd2c'      - Direct to Consumer order
    -- 'b2b'      - Business to Business order
    -- 'dropship' - Dropship order
    type TEXT,
    trading_partner TEXT,
    id_wms_shipping_method UUID REFERENCES wms_shipping_methods(id_wms_shipping_method),
    is_third_party_freight BOOLEAN,
    invoice_currency_code TEXT,
    total_price DECIMAL(10,2),
    total_tax DECIMAL(10,2),
    total_discount DECIMAL(10,2),
    total_shipping DECIMAL(10,2),
    required_ship_date TIMESTAMP WITH TIME ZONE,
    external_system_url TEXT
);

CREATE TABLE wms_orders_addresses (
    id_wms_order UUID REFERENCES wms_orders(id_wms_order),
    id_wms_address UUID REFERENCES wms_addresses(id_wms_address),
    type TEXT,
    PRIMARY KEY (id_wms_order, type)
);

CREATE TABLE wms_orders_line_items (
    id_wms_order_line_item UUID PRIMARY KEY,
    id_wms_order UUID REFERENCES wms_orders(id_wms_order),
    id_wms_product UUID,
    sku TEXT,
    quantity INTEGER,
    unit_price DECIMAL(10,2),
    is_picked BOOLEAN,
    discount_amount DECIMAL(10,2)
);

-- Shipments
CREATE TABLE wms_shipments (
    id_wms_shipment UUID PRIMARY KEY,
    id_wms_order UUID REFERENCES wms_orders(id_wms_order),
    id_wms_warehouse UUID REFERENCES wms_warehouses(id_wms_warehouse),
    shipped_date TIMESTAMP WITH TIME ZONE,
    raw_status TEXT,
    status TEXT,
    id_wms_shipping_method UUID REFERENCES wms_shipping_methods(id_wms_shipping_method)
);

CREATE TABLE wms_shipments_addresses (
    id_wms_shipment UUID REFERENCES wms_shipments(id_wms_shipment),
    id_wms_address UUID REFERENCES wms_addresses(id_wms_address),
    type TEXT,
    PRIMARY KEY (id_wms_shipment, type)
);

-- Packages
CREATE TABLE wms_packages (
    id_wms_package UUID PRIMARY KEY,
    id_wms_shipment UUID REFERENCES wms_shipments(id_wms_shipment),
    package_name TEXT,
    tracking_number TEXT,
    tracking_url TEXT,
    id_wms_shipping_method UUID REFERENCES wms_shipping_methods(id_wms_shipping_method),
    carrier TEXT,
    scac TEXT,
    shipping_cost DECIMAL(10,2)
);

CREATE TABLE wms_packages_measurements (
    id_wms_package UUID PRIMARY KEY REFERENCES wms_packages(id_wms_package),
    length DECIMAL(10,2),
    width DECIMAL(10,2),
    height DECIMAL(10,2),
    unit TEXT,
    weight DECIMAL(10,2),
    weight_unit TEXT
);

CREATE TABLE wms_packages_line_items (
    id_wms_package_line_item UUID PRIMARY KEY,
    id_wms_package UUID REFERENCES wms_packages(id_wms_package),
    id_wms_inventory_item UUID,
    sku TEXT,
    quantity INTEGER,
    id_wms_lot UUID,
    expiration_date TIMESTAMP WITH TIME ZONE,
    id_wms_parent_product UUID
);

-- Returns
CREATE TABLE wms_returns (
    id_wms_return UUID PRIMARY KEY,
    id_wms_warehouse_customer UUID REFERENCES wms_warehouse_customers(id_wms_warehouse_customer),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    modified_at TIMESTAMP WITH TIME ZONE NOT NULL,
    id_connection UUID NOT NULL,
    remote_id TEXT,
    remote_was_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT,
    raw_status TEXT,
    id_wms_order UUID REFERENCES wms_orders(id_wms_order),
    external_system_url TEXT
);

CREATE TABLE wms_returns_notes (
    id_wms_return UUID REFERENCES wms_returns(id_wms_return),
    note TEXT,
    PRIMARY KEY (id_wms_return, note)
);

CREATE TABLE wms_returns_line_items (
    id_wms_return_line_item UUID PRIMARY KEY,
    id_wms_return UUID REFERENCES wms_returns(id_wms_return),
    id_wms_inventory_item UUID,
    sku TEXT,
    expected_quantity INTEGER,
    received_quantity INTEGER,
    restocked_quantity INTEGER,
    return_reason TEXT,
    quantity INTEGER,
    id_wms_warehouse UUID REFERENCES wms_warehouses(id_wms_warehouse),
    returned_date TIMESTAMP WITH TIME ZONE
);

CREATE TABLE wms_returns_shipments (
    id_wms_return_shipment UUID PRIMARY KEY,
    id_wms_return UUID REFERENCES wms_returns(id_wms_return),
    tracking_number TEXT,
    shipped_date TIMESTAMP WITH TIME ZONE,
    arrived_date TIMESTAMP WITH TIME ZONE,
    id_wms_warehouse UUID REFERENCES wms_warehouses(id_wms_warehouse),
    carrier TEXT,
    shipping_cost DECIMAL(10,2)
);

CREATE TABLE wms_returns_shipments_measurements (
    id_wms_return_shipment UUID PRIMARY KEY REFERENCES wms_returns_shipments(id_wms_return_shipment),
    length DECIMAL(10,2),
    width DECIMAL(10,2),
    height DECIMAL(10,2),
    unit TEXT,
    weight DECIMAL(10,2),
    weight_unit TEXT
);

CREATE TABLE wms_returns_shipments_items (
    id_wms_return_shipment_item UUID PRIMARY KEY,
    id_wms_return_shipment UUID REFERENCES wms_returns_shipments(id_wms_return_shipment),
    id_wms_inventory_item UUID,
    sku TEXT,
    quantity INTEGER
);

CREATE TABLE wms_returns_receiving_details (
    id_wms_return_shipment_item UUID REFERENCES wms_returns_shipments_items(id_wms_return_shipment_item),
    quantity INTEGER,
    condition TEXT,
    disposition TEXT,
    PRIMARY KEY (id_wms_return_shipment_item, condition, disposition)
);

-- Inbound Shipments
CREATE TABLE wms_inbound_shipments (
    id_wms_inbound_shipment UUID PRIMARY KEY,
    id_wms_warehouse_customer UUID REFERENCES wms_warehouse_customers(id_wms_warehouse_customer),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    modified_at TIMESTAMP WITH TIME ZONE NOT NULL,
    id_connection UUID NOT NULL,
    remote_id TEXT,
    remote_was_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    purchase_order_number TEXT,
    status TEXT,
    raw_status TEXT,
    supplier TEXT,
    expected_arrival_date TIMESTAMP WITH TIME ZONE,
    id_wms_warehouse UUID REFERENCES wms_warehouses(id_wms_warehouse),
    external_system_url TEXT
);

CREATE TABLE wms_inbound_shipments_line_items (
    id_wms_inbound_shipment_line_item UUID PRIMARY KEY,
    id_wms_inbound_shipment UUID REFERENCES wms_inbound_shipments(id_wms_inbound_shipment),
    id_wms_inventory_item UUID,
    sku TEXT,
    expected_quantity INTEGER,
    received_quantity INTEGER,
    unit_cost DECIMAL(10,2),
    external_id TEXT
);

CREATE TABLE wms_inbound_receipts (
    id_wms_inbound_receipt UUID PRIMARY KEY,
    id_wms_inbound_shipment UUID REFERENCES wms_inbound_shipments(id_wms_inbound_shipment),
    arrived_date TIMESTAMP WITH TIME ZONE
);

CREATE TABLE wms_inbound_receipts_line_items (
    id_wms_inbound_receipt_line_item UUID PRIMARY KEY,
    id_wms_inbound_receipt UUID REFERENCES wms_inbound_receipts(id_wms_inbound_receipt),
    id_wms_inventory_item UUID,
    sku TEXT,
    quantity INTEGER
);

CREATE TABLE wms_inbound_tracking_numbers (
    id_wms_inbound_shipment UUID REFERENCES wms_inbound_shipments(id_wms_inbound_shipment),
    tracking_number TEXT,
    PRIMARY KEY (id_wms_inbound_shipment, tracking_number)
);

CREATE TABLE wms_inbound_notes (
    id_wms_inbound_shipment UUID REFERENCES wms_inbound_shipments(id_wms_inbound_shipment),
    note TEXT,
    PRIMARY KEY (id_wms_inbound_shipment, note)
);

-- Stock Movements
CREATE TABLE wms_stock_movements (
    id_wms_stock_movement UUID PRIMARY KEY,
    id_wms_inventory_item UUID,
    id_wms_warehouse UUID REFERENCES wms_warehouses(id_wms_warehouse),
    movement_type TEXT,
    quantity INTEGER,
    id_wms_from_location UUID REFERENCES wms_locations(id_wms_location),
    id_wms_to_location UUID REFERENCES wms_locations(id_wms_location),
    id_wms_reference UUID,
    reference_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    id_wms_user UUID
);

-- Users and Permissions
CREATE TABLE wms_users (
    id_wms_user UUID PRIMARY KEY,
    email TEXT,
    name TEXT,
    role TEXT
);

CREATE TABLE wms_permissions (
    id_wms_permission UUID PRIMARY KEY,
    name TEXT,
    description TEXT
);

CREATE TABLE wms_user_permissions (
    id_wms_user UUID REFERENCES wms_users(id_wms_user),
    id_wms_permission UUID REFERENCES wms_permissions(id_wms_permission),
    PRIMARY KEY (id_wms_user, id_wms_permission)
);

CREATE TABLE wms_audit_log (
    id_wms_audit_log UUID PRIMARY KEY,
    id_wms_user UUID,
    action TEXT,
    entity_type TEXT,
    entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create metadata table
CREATE TABLE wms_metadata (
    id_wms_metadata UUID PRIMARY KEY,
    entity_type TEXT NOT NULL,  -- e.g., 'wms_order', 'wms_product', etc.
    entity_id UUID NOT NULL,    -- reference to the entity
    key TEXT NOT NULL CHECK (length(key) <= 40),
    value TEXT CHECK (value IS NULL OR length(value) <= 500),  -- Allow NULL values
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (entity_type, entity_id, key)
);

-- Add indexes for efficient querying
CREATE INDEX idx_wms_metadata_entity ON wms_metadata(entity_type, entity_id);
CREATE INDEX idx_wms_metadata_key ON wms_metadata(key);

-- Indexes
CREATE INDEX idx_wms_warehouses_code ON wms_warehouses(code);
CREATE INDEX idx_wms_warehouse_customers_email ON wms_warehouse_customers(email);
CREATE INDEX idx_wms_products_sku ON wms_products(sku);
CREATE INDEX idx_wms_inventory_items_sku ON wms_inventory_items(sku);
CREATE INDEX idx_wms_orders_number ON wms_orders(order_number);
CREATE INDEX idx_wms_orders_status ON wms_orders(status);