import { useEffect, useRef } from "react";
import { useCart } from "react-use-cart";
import { useContext } from "react";
import { UserContext } from "@context/UserContext";
import CustomerServices from "@services/CustomerServices";

/**
 * useCartSync
 *
 * Runs once when the logged-in user changes:
 *  1. Fetches the customer's DB cart.
 *  2. Merges DB items into the local cart (DB wins for quantity when higher).
 *  3. Pushes any LOCAL-ONLY items (added as guest) up to the DB.
 *
 * This ensures:
 *  - Items added before login are preserved and saved to DB after login.
 *  - Items saved in DB from a previous session are restored into local cart.
 */
const useCartSync = () => {
  const { addItem, items, updateItemQuantity, getItem, emptyCart } = useCart();
  const {
    state: { userInfo },
  } = useContext(UserContext);

  const isSyncedRef = useRef(false);
  const lastUserIdRef = useRef(null);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    const syncBackendCart = async () => {
      const userId = userInfo?._id || userInfo?.id;

      // Reset sync state if user changes or logs out
      if (!userId) {
        isSyncedRef.current = false;
        lastUserIdRef.current = null;
        isSyncingRef.current = false;
        return;
      }

      // Allow re-sync if user changed
      if (lastUserIdRef.current !== userId) {
        isSyncedRef.current = false;
      }

      // If already synced for this user or currently syncing, skip
      if (isSyncedRef.current || isSyncingRef.current) {
        return;
      }

      // Mark as syncing to prevent multiple simultaneous syncs
      isSyncingRef.current = true;

      try {
        // ── Step 1: Fetch DB cart ───────────────────────────────────────────
        const res = await CustomerServices.getCustomerById(userId);
        const backendCart = res.cart || [];

        // ── Step 2: Merge DB → Local ────────────────────────────────────────
        const itemsToProcess = [];

        backendCart.forEach((cartItem) => {
          const product = cartItem.productId;
          if (!product || !product._id) return;

          const color = cartItem.color;
          const id = color ? `${product._id}-${color}` : product._id;
          const backendQty = cartItem.quantity || 1;

          const localItem = getItem(id);
          const hasVariantInCart = items.some((item) =>
            String(item.id).startsWith(String(product._id) + "-")
          );

          if (localItem) {
            // DB has higher quantity → update local
            if (backendQty > localItem.quantity) {
              itemsToProcess.push({ type: "update", id, quantity: backendQty });
            }
          } else if (!hasVariantInCart || color) {
            const effectivePrice =
              product.prices?.price || product.prices?.originalPrice || 0;

            const colorVar = color && Array.isArray(product.colorVariants)
              ? product.colorVariants.find(cv => cv.colorName === color)
              : null;
            const effectiveStock = colorVar ? colorVar.stock : (product.stock !== undefined ? product.stock : undefined);
            const effectiveImage = colorVar?.images?.[0] || (Array.isArray(product.image) ? product.image[0] : product.image || "");
            const effectiveTitle = color ? `${product.title?.en || product.title || "Product"} - ${color}` : (product.title?.en || product.title || "Product");

            itemsToProcess.push({
              type: "add",
              item: {
                id: id,
                price: effectivePrice,
                title: effectiveTitle,
                image: effectiveImage,
                color: color || undefined,
                quantity: backendQty,
                slug: product.slug,
                stock: effectiveStock,
                colorVariants: product.colorVariants || [],
              },
              quantity: backendQty,
            });
          }
        });

        // Apply DB → local updates
        itemsToProcess.forEach((action) => {
          if (action.type === "update") {
            updateItemQuantity(action.id, action.quantity);
          } else if (action.type === "add") {
            if (!getItem(action.item.id)) {
              addItem(action.item, action.quantity);
            }
          }
        });

        // ── Step 3: Merge Local → DB (push guest items into DB) ────────────
        // After applying DB items to local, push any remaining local items
        // that aren't in the DB cart back up.
        const dbProductIds = new Set(
          backendCart
            .map((c) => c.productId?._id?.toString())
            .filter(Boolean)
        );

        const localOnlyItems = items.filter((localItem) => {
          const rawId = String(localItem.id);
          const baseId = rawId.includes("-")
            ? rawId.slice(0, rawId.indexOf("-"))
            : rawId;
          const color = localItem.color || null;
          
          return !backendCart.some(
            (c) =>
              c.productId?._id?.toString() === baseId &&
              (color ? c.color === color : !c.color)
          );
        });

        // Push each local-only item up to DB in parallel
        if (localOnlyItems.length > 0) {
          await Promise.allSettled(
            localOnlyItems.map((localItem) => {
              const rawId = String(localItem.id);
              const baseId = rawId.includes("-")
                ? rawId.slice(0, rawId.indexOf("-"))
                : rawId;
              return CustomerServices.addToCartDB(
                userId,
                baseId,
                localItem.quantity,
                localItem.color
              );
            })
          );
        }

        // ── Done ────────────────────────────────────────────────────────────
        isSyncedRef.current = true;
        lastUserIdRef.current = userId;
      } catch (err) {
        console.error("[useCartSync] Error syncing cart:", err);
      } finally {
        isSyncingRef.current = false;
      }
    };

    syncBackendCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?._id, userInfo?.id]);
};

export default useCartSync;
