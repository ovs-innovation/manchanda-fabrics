import React, { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import {
  IoChevronForward,
  IoLocationOutline,
  IoLockClosedOutline,
  IoShieldCheckmarkOutline,
  IoHelpCircleOutline
} from "react-icons/io5";
import { FiLoader, FiShoppingBag } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";

import { getUserSession } from "@lib/auth";

// Internal imports
import Layout from "@layout/Layout";
import Error from "@components/form/Error";
import useCheckoutSubmit from "@hooks/useCheckoutSubmit";
import useUtilsFunction from "@hooks/useUtilsFunction";
import SettingServices from "@services/SettingServices";
import CustomerServices from "@services/CustomerServices";
import LocationServices from "@services/LocationServices";
import { notifySuccess, notifyError } from "@utils/toast";
import { getDisplayEmail } from "@utils/profileAuth";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];

const Checkout = () => {
  const { t } = useTranslation("common");
  const formRef = useRef(null);

  const [agreeToTerms, setAgreeToTerms] = useState(true);
  const [saveInfoForNextTime, setSaveInfoForNextTime] = useState(true);
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const userInfo = getUserSession();
  const { currency, formatPrice } = useUtilsFunction();

  const { data: storeSetting } = useQuery({
    queryKey: ["storeSetting"],
    queryFn: async () => await SettingServices.getStoreSetting(),
    staleTime: 4 * 60 * 1000,
  });

  // Fetch user's saved shipping addresses
  const { data: shippingAddressesResponse } = useQuery({
    queryKey: ["shippingAddresses", userInfo?._id],
    queryFn: async () => {
      if (!userInfo?._id) return [];
      const response = await CustomerServices.getShippingAddress({ userId: userInfo._id });
      return response?.shippingAddress || [];
    },
    enabled: !!userInfo?._id,
    staleTime: 5 * 60 * 1000,
  });

  const shippingAddresses = Array.isArray(shippingAddressesResponse)
    ? shippingAddressesResponse
    : shippingAddressesResponse
      ? [shippingAddressesResponse]
      : [];

  const {
    total,
    isEmpty,
    items,
    cartTotal,
    register,
    errors,
    watch,
    handleSubmit,
    submitHandler,
    discountAmount,
    shippingCost,
    isCheckoutSubmit,
    taxSummary,
    setValue,
  } = useCheckoutSubmit(storeSetting);

  const selectedPaymentMethod = watch("paymentMethod") || "PhonePe";
  const watchZipCode = watch("zipCode");

  const populateAddressFields = useCallback((addr) => {
    if (!addr) return;
    const nameParts = (addr.name || "").trim().split(" ");
    setValue("firstName", nameParts[0] || "");
    setValue("lastName", nameParts.slice(1).join(" ") || "");
    setValue("contact", addr.phone || userInfo?.phone || "");
    setValue("address", addr.address || "");
    setValue("address2", addr.address2 || "");
    setValue("city", addr.city || "");
    setValue("state", addr.country || addr.state || "");
    setValue("country", "India");
    setValue("zipCode", addr.zipCode || "");
  }, [setValue, userInfo]);

  // Default values initialization
  useEffect(() => {
    setValue("country", "India");
    setValue("paymentMethod", "PhonePe");
    setValue("shippingOption", "Standard");

    const displayEmail = getDisplayEmail(userInfo);
    if (displayEmail) {
      setValue("email", displayEmail);
    }
    if (userInfo?.phone) {
      setValue("contact", userInfo.phone);
    }
    if (userInfo?.name) {
      const parts = userInfo.name.trim().split(" ");
      setValue("firstName", parts[0] || "");
      setValue("lastName", parts.slice(1).join(" ") || "");
    }
  }, [setValue, userInfo]);

  // Handle saved address auto-fill
  useEffect(() => {
    if (shippingAddresses && shippingAddresses.length > 0 && !selectedAddressId) {
      const defaultAddr = shippingAddresses.find(addr => addr.isDefault) || shippingAddresses[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id || defaultAddr.id || "default");
        populateAddressFields(defaultAddr);
      }
    }
  }, [shippingAddresses, selectedAddressId, populateAddressFields]);

  const handleSavedAddressChange = (e) => {
    const val = e.target.value;
    setSelectedAddressId(val);
    if (val === "new") {
      setValue("firstName", "");
      setValue("lastName", "");
      setValue("address", "");
      setValue("address2", "");
      setValue("city", "");
      setValue("state", "");
      setValue("zipCode", "");
    } else {
      const found = shippingAddresses.find(
        (a) => (a._id || a.id) === val
      );
      if (found) populateAddressFields(found);
    }
  };

  // Auto fetch location by PIN code
  useEffect(() => {
    const fetchLocationByPin = async () => {
      if (watchZipCode && watchZipCode.length === 6 && /^\d+$/.test(watchZipCode)) {
        try {
          const response = await fetch(`https://api.postalpincode.in/pincode/${watchZipCode}`);
          const data = await response.json();
          if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
            const postOffice = data[0].PostOffice[0];
            const city = postOffice.District || postOffice.Block || postOffice.Name;
            const state = postOffice.State;
            if (city) setValue("city", city);
            if (state) setValue("state", state);
            notifySuccess(`Detected: ${city}, ${state}`);
          }
        } catch (error) {
          console.error("Error fetching PIN details:", error);
        }
      }
    };

    const timer = setTimeout(() => {
      fetchLocationByPin();
    }, 450);

    return () => clearTimeout(timer);
  }, [watchZipCode, setValue]);

  // Handle Use Current Location
  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      notifyError("Geolocation is not supported by your browser");
      return;
    }

    setIsLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const geocodeData = await LocationServices.getReverseGeocode({ lat: latitude, lng: longitude });

          if (geocodeData.status === 'OK' && geocodeData.results && geocodeData.results.length > 0) {
            const result = geocodeData.results[0];

            let street = "";
            let city = "";
            let state = "";
            let zip = "";

            const streetNumber = result.address_components.find(c => c.types.includes("street_number"))?.long_name || "";
            const route = result.address_components.find(c => c.types.includes("route"))?.long_name || "";
            const sublocality = result.address_components.find(c => c.types.includes("sublocality"))?.long_name || "";

            street = [streetNumber, route, sublocality].filter(Boolean).join(", ");
            if (!street) {
              street = result.formatted_address.split(",")[0];
            }

            city = result.address_components.find(c => c.types.includes("locality"))?.long_name || "";
            state = result.address_components.find(c => c.types.includes("administrative_area_level_1"))?.long_name || "";
            zip = result.address_components.find(c => c.types.includes("postal_code"))?.long_name || "";

            if (street) setValue("address", street);
            if (city) setValue("city", city);
            if (state) setValue("state", state);
            if (zip) setValue("zipCode", zip);

            notifySuccess(t("Location detected successfully!"));
          } else {
            notifyError(t("Unable to fetch current location. Please fill manually."));
          }
        } catch (error) {
          console.error("Location error:", error);
          notifyError(t("Unable to fetch current location."));
        } finally {
          setIsLocationLoading(false);
        }
      },
      (error) => {
        setIsLocationLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          notifyError(t("Location permission denied. Please allow location access."));
        } else {
          notifyError(t("Unable to fetch current location."));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Calculate MRP savings
  const calculateTotals = () => {
    let totalMRP = 0;
    let totalDiscount = 0;

    items.forEach(item => {
      const originalPrice = item.originalPrice || item.mrp || item.prices?.original || (item.price * 1.2);
      const currentPrice = item.price || item.prices?.sale || 0;
      const quantity = item.quantity || 1;

      totalMRP += originalPrice * quantity;
      totalDiscount += (originalPrice - currentPrice) * quantity;
    });

    return {
      totalMRP,
      totalDiscount,
      subtotal: cartTotal,
      taxAmount: taxSummary?.exclusiveTax || 0,
      total: parseFloat(total)
    };
  };

  const totals = calculateTotals();

  return (
    <Layout title="Checkout" description="Complete your order with Manchanda Fabrics">
      <div className="bg-[#FAF9F7] min-h-screen text-[#2D2A26]">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 xl:gap-16 items-start">

            {/* ================= LEFT COLUMN: FORM (60%) ================= */}
            <div className="w-full lg:w-[58%] xl:w-[60%] flex flex-col min-w-0">

              {/* Minimal Clean Breadcrumb */}
              <div className="flex items-center gap-2 mb-6 text-xs text-gray-500 font-medium">
                <Link href="/cart" className="hover:text-black transition-colors">
                  {t("Cart")}
                </Link>
                <IoChevronForward className="text-gray-400 text-[10px]" />
                <span className="text-gray-900 font-semibold">{t("Information & Payment")}</span>
              </div>

              <form ref={formRef} onSubmit={handleSubmit(submitHandler)} className="space-y-8">

                {/* 1. CONTACT SECTION */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                  <div className="mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight">
                      {t("Contact")}
                    </h2>
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        placeholder={t("Email or mobile phone number")}
                        {...register("email", {
                          required: t("Email address is required"),
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: t("Please enter a valid email address"),
                          },
                        })}
                        className={`w-full h-12 px-3.5 pr-10 text-sm rounded-lg border transition-colors bg-white focus:outline-none focus:ring-1 ${
                          errors.email
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:border-black focus:ring-black"
                        }`}
                      />
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 group cursor-pointer">
                        <IoHelpCircleOutline size={18} />
                        <span className="sr-only">Help</span>
                      </div>
                    </div>
                    <Error errorMessage={errors.email?.message} />
                  </div>
                </div>

                {/* 2. DELIVERY SECTION */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight">
                      {t("Delivery")}
                    </h2>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={isLocationLoading}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6D3D2E] hover:text-black transition-colors disabled:opacity-50"
                    >
                      {isLocationLoading ? (
                        <FiLoader className="animate-spin" size={14} />
                      ) : (
                        <IoLocationOutline size={14} />
                      )}
                      <span>{t("Use current location")}</span>
                    </button>
                  </div>

                  {/* Saved Address Selector (if logged in & has addresses) */}
                  {shippingAddresses && shippingAddresses.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">
                        {t("Saved addresses")}
                      </label>
                      <select
                        value={selectedAddressId}
                        onChange={handleSavedAddressChange}
                        className="w-full h-11 px-3 text-sm rounded-lg border border-gray-300 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black cursor-pointer transition-colors"
                      >
                        {shippingAddresses.map((addr, idx) => (
                          <option key={addr._id || addr.id || idx} value={addr._id || addr.id || idx}>
                            {addr.name || "Address"} — {addr.address}, {addr.city} ({addr.zipCode}) {addr.isDefault ? `[${t("Default")}]` : ""}
                          </option>
                        ))}
                        <option value="new">{t("+ Enter a different address")}</option>
                      </select>
                    </div>
                  )}

                  <div className="space-y-3.5">
                    {/* Country / Region */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        {t("Country / Region")}
                      </label>
                      <select
                        {...register("country", { required: t("Country is required") })}
                        className="w-full h-12 px-3.5 text-sm rounded-lg border border-gray-300 bg-gray-50 text-gray-800 font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black cursor-pointer"
                        defaultValue="India"
                      >
                        <option value="India">India</option>
                      </select>
                    </div>

                    {/* First name & Last name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <input
                          type="text"
                          placeholder={t("First name (optional)")}
                          {...register("firstName")}
                          className="w-full h-12 px-3.5 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder={t("Last name")}
                          {...register("lastName", { required: t("Last name is required") })}
                          className={`w-full h-12 px-3.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-1 transition-colors ${
                            errors.lastName
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:border-black focus:ring-black"
                          }`}
                        />
                        <Error errorMessage={errors.lastName?.message} />
                      </div>
                    </div>

                    {/* Street Address */}
                    <div>
                      <input
                        type="text"
                        placeholder={t("Address (House/Flat No., Street, Area)")}
                        {...register("address", { required: t("Address is required") })}
                        className={`w-full h-12 px-3.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-1 transition-colors ${
                          errors.address
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:border-black focus:ring-black"
                        }`}
                      />
                      <Error errorMessage={errors.address?.message} />
                    </div>

                    {/* Apartment, suite (optional) */}
                    <div>
                      <input
                        type="text"
                        placeholder={t("Apartment, suite, landmark, etc. (optional)")}
                        {...register("address2")}
                        className="w-full h-12 px-3.5 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                      />
                    </div>

                    {/* City, State, PIN code */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <input
                          type="text"
                          placeholder={t("City")}
                          {...register("city", { required: t("City is required") })}
                          className={`w-full h-12 px-3.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-1 transition-colors ${
                            errors.city
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:border-black focus:ring-black"
                          }`}
                        />
                        <Error errorMessage={errors.city?.message} />
                      </div>

                      <div>
                        <select
                          {...register("state", { required: t("State is required") })}
                          defaultValue=""
                          className={`w-full h-12 px-3 text-sm rounded-lg border bg-white focus:outline-none focus:ring-1 transition-colors cursor-pointer ${
                            errors.state
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:border-black focus:ring-black"
                          }`}
                        >
                          <option value="" disabled>{t("State")}</option>
                          {INDIAN_STATES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <Error errorMessage={errors.state?.message} />
                      </div>

                      <div>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder={t("PIN code")}
                          {...register("zipCode", {
                            required: t("PIN code is required"),
                            pattern: {
                              value: /^[0-9]{6}$/,
                              message: t("Valid 6-digit PIN required")
                            }
                          })}
                          className={`w-full h-12 px-3.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-1 transition-colors ${
                            errors.zipCode
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:border-black focus:ring-black"
                          }`}
                        />
                        <Error errorMessage={errors.zipCode?.message} />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <div className="relative">
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder={t("Phone (10 digits)")}
                          {...register("contact", {
                            required: t("Phone number is required"),
                            pattern: {
                              value: /^[0-9]{10}$/,
                              message: t("Enter a valid 10-digit mobile number")
                            }
                          })}
                          className={`w-full h-12 px-3.5 pr-10 text-sm rounded-lg border bg-white focus:outline-none focus:ring-1 transition-colors ${
                            errors.contact
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:border-black focus:ring-black"
                          }`}
                        />
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 group cursor-pointer" title="In case there are questions regarding your order">
                          <IoHelpCircleOutline size={18} />
                        </div>
                      </div>
                      <Error errorMessage={errors.contact?.message} />
                    </div>

                    {/* Save this information checkbox */}
                    <label className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-600 cursor-pointer pt-1 select-none">
                      <input
                        type="checkbox"
                        checked={saveInfoForNextTime}
                        onChange={(e) => setSaveInfoForNextTime(e.target.checked)}
                        className="w-4 h-4 text-[#6D3D2E] focus:ring-[#6D3D2E] border-gray-300 rounded cursor-pointer"
                      />
                      <span>{t("Save this information for next time")}</span>
                    </label>
                  </div>
                </div>

                {/* 3. PAYMENT SECTION */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                  <div className="mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight">
                      {t("Payment")}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t("All transactions are secure and encrypted.")}
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200 mb-5">

                    {/* Option 1: PhonePe Gateway */}
                    <label
                      className={`flex flex-col p-4 cursor-pointer transition-colors ${
                        selectedPaymentMethod === "PhonePe" ? "bg-[#FAF7F5]" : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            value="PhonePe"
                            {...register("paymentMethod", { required: t("Payment Method is required!") })}
                            className="w-4 h-4 text-[#6D3D2E] focus:ring-[#6D3D2E] border-gray-300 cursor-pointer"
                            defaultChecked
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">
                                {t("PhonePe Secure Gateway")}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#5f259f] text-white">
                                {t("Recommended")}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {t("UPI, Google Pay, PhonePe, Paytm, Cards & Netbanking")}
                            </p>
                          </div>
                        </div>

                        {/* Payment brand badges */}
                        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                          <span className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[10px] font-extrabold text-[#5f259f]">
                            PhonePe
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[10px] font-bold text-emerald-700">
                            UPI
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[10px] font-bold text-blue-700">
                            VISA
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[10px] font-bold text-red-600">
                            Master
                          </span>
                        </div>
                      </div>
                    </label>

                    {/* Option 2: Razorpay (if enabled in settings) */}
                    {storeSetting?.razorpay_status && (
                      <label
                        className={`flex flex-col p-4 cursor-pointer transition-colors ${
                          selectedPaymentMethod === "RazorPay" ? "bg-[#FAF7F5]" : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              value="RazorPay"
                              {...register("paymentMethod", { required: t("Payment Method is required!") })}
                              className="w-4 h-4 text-[#6D3D2E] focus:ring-[#6D3D2E] border-gray-300 cursor-pointer"
                            />
                            <div>
                              <span className="text-sm font-semibold text-gray-900">
                                {t("Razorpay Secure (Cards, Wallets & Netbanking)")}
                              </span>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {t("International Cards, Netbanking & Wallets")}
                              </p>
                            </div>
                          </div>
                          <span className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[10px] font-bold text-[#0C2340]">
                            Razorpay
                          </span>
                        </div>
                      </label>
                    )}

                    {/* Option 3: Cash on Delivery (COD) */}
                    <label
                      className={`flex flex-col p-4 cursor-pointer transition-colors ${
                        selectedPaymentMethod === "Cash" ? "bg-[#FAF7F5]" : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            value="Cash"
                            {...register("paymentMethod", { required: t("Payment Method is required!") })}
                            className="w-4 h-4 text-[#6D3D2E] focus:ring-[#6D3D2E] border-gray-300 cursor-pointer"
                          />
                          <div>
                            <span className="text-sm font-semibold text-gray-900">
                              {t("Cash on Delivery (COD)")}
                            </span>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {t("Pay in cash upon doorstep delivery")}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase">
                          COD
                        </span>
                      </div>
                    </label>
                  </div>
                  <Error errorMessage={errors.paymentMethod?.message} />

                  {/* Billing address match */}
                  <div className="mb-4">
                    <label className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={useShippingAsBilling}
                        onChange={(e) => setUseShippingAsBilling(e.target.checked)}
                        className="w-4 h-4 text-[#6D3D2E] focus:ring-[#6D3D2E] border-gray-300 rounded cursor-pointer"
                      />
                      <span>{t("Use shipping address as billing address")}</span>
                    </label>
                  </div>

                  {/* Terms & Conditions Agreement */}
                  <div className="mb-6 p-3.5 rounded-lg bg-gray-50 border border-gray-200">
                    <label className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        id="agreeToTerms"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                        className="w-4 h-4 mt-0.5 text-[#6D3D2E] focus:ring-[#6D3D2E] border-gray-300 rounded cursor-pointer shrink-0"
                      />
                      <span>
                        {t("I agree to the")}{" "}
                        <Link href="/terms-and-conditions" target="_blank" className="text-[#6D3D2E] underline font-medium hover:text-[#4A291E]">
                          {t("Terms & Conditions")}
                        </Link>{" "}
                        {t("and")}{" "}
                        <Link href="/privacy-policy" target="_blank" className="text-[#6D3D2E] underline font-medium hover:text-[#4A291E]">
                          {t("Privacy Policy")}
                        </Link>
                      </span>
                    </label>
                  </div>

                  {/* Pay Now Main Action Button */}
                  <button
                    type="submit"
                    disabled={isEmpty || isCheckoutSubmit || !agreeToTerms}
                    className={`w-full h-14 rounded-xl text-base font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 ${
                      isEmpty || isCheckoutSubmit || !agreeToTerms
                        ? "bg-gray-400 cursor-not-allowed shadow-none"
                        : "bg-[#6D3D2E] hover:bg-[#4A291E] active:scale-[0.99]"
                    }`}
                  >
                    {isCheckoutSubmit ? (
                      <>
                        <FiLoader className="animate-spin text-white" size={20} />
                        <span>{t("Processing order...")}</span>
                      </>
                    ) : (
                      <>
                        <IoLockClosedOutline size={18} />
                        <span>
                          {selectedPaymentMethod === "Cash"
                            ? `${t("Place Order")} (${currency}${formatPrice(total)})`
                            : `${t("Pay now")} — ${currency}${formatPrice(total)}`}
                        </span>
                      </>
                    )}
                  </button>

                  {/* Security Assurance Badges */}
                  <div className="flex items-center justify-center gap-6 mt-5 text-gray-400 text-xs">
                    <div className="flex items-center gap-1.5">
                      <IoLockClosedOutline size={16} />
                      <span>{t("Secure 256-bit SSL")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <IoShieldCheckmarkOutline size={16} />
                      <span>{t("Encrypted Checkout")}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Copyright */}
                <div className="pt-2 text-center text-xs text-gray-500 space-y-2">
                  <p>{t("All rights reserved Manchanda Fabrics")}</p>
                  <div className="flex justify-center gap-4 text-[11px] text-gray-400">
                    <Link href="/refund-return-policy" className="hover:underline">{t("Refund policy")}</Link>
                    <span>•</span>
                    <Link href="/shipping-delivery-policy" className="hover:underline">{t("Shipping policy")}</Link>
                    <span>•</span>
                    <Link href="/privacy-policy" className="hover:underline">{t("Privacy policy")}</Link>
                    <span>•</span>
                    <Link href="/terms-and-conditions" className="hover:underline">{t("Terms of service")}</Link>
                  </div>
                </div>

              </form>
            </div>


            {/* ================= RIGHT COLUMN: ORDER SUMMARY (40% - Sticky) ================= */}
            <div className="w-full lg:w-[42%] xl:w-[40%] flex flex-col self-start lg:sticky lg:top-24">
              <div className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">

                <div className="flex items-center justify-between pb-5 border-b border-gray-200">
                  <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                    <FiShoppingBag className="text-gray-500" />
                    <span>{t("Order Summary")}</span>
                  </h3>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    {items.length} {items.length === 1 ? t("item") : t("items")}
                  </span>
                </div>

                {/* Cart Items List */}
                <div className="py-5 border-b border-gray-200 space-y-4 max-h-[340px] overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3.5">
                      {/* Thumbnail with overlay quantity badge */}
                      <div className="relative w-16 h-16 rounded-xl border border-gray-200/80 bg-gray-50 overflow-visible shrink-0 flex items-center justify-center">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-neutral-700 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-sm">
                          {item.quantity}
                        </span>
                      </div>

                      {/* Product Title & Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate leading-snug">
                          {item.title}
                        </h4>
                        {item.color && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {t("Color")}: <span className="font-medium text-gray-700">{t(item.color)}</span>
                          </p>
                        )}
                        {item.variant && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {typeof item.variant === "object"
                              ? Object.values(item.variant).filter(Boolean).map(v => t(v)).join(", ")
                              : t(item.variant)}
                          </p>
                        )}
                      </div>

                      {/* Price */}
                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-gray-900">
                          {currency}{formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {isEmpty && (
                    <div className="text-center py-6 text-gray-400 text-sm">
                      {t("Your cart is empty.")}
                    </div>
                  )}
                </div>

                {/* Subtotal & Breakdown Lines */}
                <div className="py-5 border-b border-gray-200 space-y-2.5 text-sm">
                  {/* Total MRP */}
                  {totals.totalMRP > cartTotal && (
                    <div className="flex justify-between text-gray-500">
                      <span>{t("Total MRP")}</span>
                      <span>{currency}{formatPrice(totals.totalMRP)}</span>
                    </div>
                  )}

                  {/* MRP Discount */}
                  {totals.totalDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>{t("Bag Discount")}</span>
                      <span>-{currency}{formatPrice(totals.totalDiscount)}</span>
                    </div>
                  )}

                  {/* Subtotal */}
                  <div className="flex justify-between text-gray-700 font-medium">
                    <span>{t("Subtotal")}</span>
                    <span>{currency}{formatPrice(cartTotal)}</span>
                  </div>

                  {/* Shipping */}
                  <div className="flex justify-between text-gray-700 font-medium">
                    <span>{t("Shipping")}</span>
                    <span className={shippingCost === 0 ? "text-emerald-700 font-bold uppercase text-xs" : ""}>
                      {shippingCost === 0 ? t("FREE") : `${currency}${formatPrice(shippingCost)}`}
                    </span>
                  </div>

                  {/* Coupon Discount */}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>{t("Coupon Discount")}</span>
                      <span>-{currency}{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  {/* GST Taxes */}
                  {taxSummary?.inclusiveTax > 0 && (
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{t("GST (included in prices)")}</span>
                      <span>{currency}{formatPrice(taxSummary.inclusiveTax)}</span>
                    </div>
                  )}
                  {taxSummary?.exclusiveTax > 0 && (
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{t("GST (added)")}</span>
                      <span>{currency}{formatPrice(taxSummary.exclusiveTax)}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="pt-5 flex items-baseline justify-between">
                  <div>
                    <span className="text-base font-bold text-gray-900 block">{t("Total")}</span>
                    <span className="text-xs text-gray-500">{t("Including taxes")}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-gray-500 mr-1.5 uppercase">INR</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                      {currency}{formatPrice(total)}
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(Checkout), { ssr: false });
