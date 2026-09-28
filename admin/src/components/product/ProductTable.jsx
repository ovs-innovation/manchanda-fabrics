import React, { useState } from "react";
import {
  Avatar,
  Badge,
  TableBody,
  TableCell,
  TableRow,
} from "@windmill/react-ui";
import { t } from "i18next";
import { FiZoomIn, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";

//internal import
import CheckBox from "@/components/form/others/CheckBox";
import DeleteModal from "@/components/modal/DeleteModal";
import EditDeleteButton from "@/components/table/EditDeleteButton";
import ShowHideButton from "@/components/table/ShowHideButton";
import Tooltip from "@/components/tooltip/Tooltip";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import { getOptimizedThumbnailUrl } from "@/utils/cloudinaryUrl";

//internal import

const ProductTable = ({ products, isCheck, setIsCheck }) => {
  const [previewImage, setPreviewImage] = useState(null);
  const { title, serviceId, handleModalOpen, handleUpdate } = useToggleDrawer();
  const { currency, showingTranslateValue, getNumberTwo } = useUtilsFunction();

  const handleClick = (e) => {
    const { id, checked } = e.target;
    // console.log("id", id, checked);

    setIsCheck([...isCheck, id]);
    if (!checked) {
      setIsCheck(isCheck.filter((item) => item !== id));
    }
  };

  return (
    <>
      {isCheck?.length < 1 && <DeleteModal id={serviceId} title={title} />}

      {/* Quick Image Preview Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs transition-opacity"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-sm sm:max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl p-4 border border-gray-100 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate pr-2">
                {previewImage.title || "Product Design Preview"}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <FiX className="text-lg" />
              </button>
            </div>
            <div className="max-h-[70vh] flex items-center justify-center overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
              <img
                src={previewImage.url}
                alt={previewImage.title || "Product"}
                className="max-h-[65vh] w-auto max-w-full object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/manchandalogo.png";
                }}
              />
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">
              Tap anywhere outside or click ✕ to close
            </p>
          </div>
        </div>
      )}

      <TableBody>
        {products?.map((product, i) => (
          <TableRow key={i + 1}>
            <TableCell>
              <CheckBox
                type="checkbox"
                name={product?.title?.en}
                id={product._id}
                handleClick={handleClick}
                isChecked={isCheck?.includes(product._id)}
              />
            </TableCell>

            <TableCell className="min-w-[190px] sm:min-w-[230px]">
              <div className="flex items-center">
                {(() => {
                  const itemImg =
                    product?.featuredImage ||
                    (Array.isArray(product?.image) ? product?.image[0] : product?.image) ||
                    (Array.isArray(product?.images) ? product?.images[0] : product?.images) ||
                    null;
                  const fallbackImg = "/manchandalogo.png";
                  const thumbImg =
                    (itemImg ? getOptimizedThumbnailUrl(itemImg, 140, 160) : null) ||
                    itemImg ||
                    fallbackImg;
                  const fullImg = itemImg || fallbackImg;
                  const prodTitle = showingTranslateValue(product?.title);

                  return (
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewImage({
                          url: fullImg,
                          title: prodTitle,
                        })
                      }
                      className="relative flex-shrink-0 w-12 h-14 sm:w-14 sm:h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 mr-2.5 shadow-xs cursor-pointer group hover:ring-2 hover:ring-store-500 transition-all text-left focus:outline-none"
                      title="Click to view full photo"
                    >
                      <img
                        src={thumbImg}
                        alt={prodTitle || "product"}
                        className="w-full h-full object-cover object-top transition-transform duration-200 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = fallbackImg;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <FiZoomIn className="text-white drop-shadow-md text-sm" />
                      </div>
                    </button>
                  );
                })()}
                <div>
                  <h2
                    className={`text-sm font-medium ${
                      product?.title.length > 30 ? "wrap-long-title" : ""
                    }`}
                  >
                    {showingTranslateValue(product?.title)?.substring(0, 28)}
                  </h2>
                </div>
              </div>
            </TableCell>

            <TableCell>
              <span className="text-sm whitespace-nowrap">
                {showingTranslateValue(product?.category?.name)}
              </span>
            </TableCell>

            <TableCell className="text-center whitespace-nowrap">
              <span className="text-sm font-semibold">
                {currency}
                {product?.isCombination
                  ? getNumberTwo(product?.variants[0]?.originalPrice)
                  : getNumberTwo(product?.prices?.originalPrice)}
              </span>
            </TableCell>

            <TableCell className="text-center whitespace-nowrap">
              <span className="text-sm font-semibold">
                {currency}
                {product?.isCombination
                  ? getNumberTwo(product?.variants[0]?.price)
                  : getNumberTwo(product?.prices?.price)}
              </span>
            </TableCell>

            <TableCell className="text-center whitespace-nowrap">
              {product?.isShippingFree || Number(product?.shippingCost || 0) === 0 ? (
                <Badge type="neutral">Free</Badge>
              ) : (
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {currency}{getNumberTwo(product?.shippingCost)}
                </span>
              )}
            </TableCell>

            <TableCell className="text-center min-w-[80px] whitespace-nowrap">
              <span
                className={`text-sm font-bold ${
                  product.stock <= 0
                    ? "text-red-500 font-extrabold"
                    : product.stock <= 10
                    ? "text-amber-600 dark:text-amber-400 font-extrabold"
                    : "text-gray-700 dark:text-gray-200"
                }`}
              >
                {Math.max(0, product.stock)}
              </span>
            </TableCell>

            <TableCell className="text-center min-w-[120px] whitespace-nowrap">
              {product.stock > 10 ? (
                <Badge type="success">{t("Selling") || "Selling"}</Badge>
              ) : product.stock > 0 ? (
                <Badge type="warning">Low Stock</Badge>
              ) : (
                <Badge type="danger">{t("SoldOut") || "Sold Out"}</Badge>
              )}
            </TableCell>
            <TableCell>
              <Link
                to={`/product/${product._id}`}
                className="flex justify-center text-gray-400 hover:text-store-600"
              >
                <Tooltip
                  id="view"
                  Icon={FiZoomIn}
                  title={t("DetailsTbl")}
                  bgColor="#10B981"
                />
              </Link>
            </TableCell>
            <TableCell className="text-center">
              <ShowHideButton id={product._id} status={product.status} />
              {/* {product.status} */}
            </TableCell>
            <TableCell>
              <EditDeleteButton
                id={product._id}
                product={product}
                isCheck={isCheck}
                handleUpdate={handleUpdate}
                handleModalOpen={handleModalOpen}
                title={showingTranslateValue(product?.title)}
                editHref={`/products/edit/${product._id}`}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </>
  );
};

export default React.memo(ProductTable);
