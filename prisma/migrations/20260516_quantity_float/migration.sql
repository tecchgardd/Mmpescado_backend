-- AlterTable: quantity para Float em Inventory
ALTER TABLE "Inventory" ALTER COLUMN "quantity" TYPE DOUBLE PRECISION;
ALTER TABLE "Inventory" ALTER COLUMN "minQuantity" TYPE DOUBLE PRECISION;

-- AlterTable: quantity para Float em OrderItem
ALTER TABLE "OrderItem" ALTER COLUMN "quantity" TYPE DOUBLE PRECISION;

-- AlterTable: quantity para Float em CartItem
ALTER TABLE "CartItem" ALTER COLUMN "quantity" TYPE DOUBLE PRECISION;
