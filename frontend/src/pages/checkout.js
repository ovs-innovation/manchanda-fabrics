import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  IoReturnUpBackOutline,
  IoArrowForward,
  IoBagHandle,
  IoWalletSharp,
  IoClose,
  IoChevronForward,
  IoLocationOutline,
  IoLockClosedOutline,
  IoShieldCheckmarkOutline
} from "react-icons/io5";
import { FiLoader, FiEdit } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { ImCreditCard } from "react-icons/im";
import useTranslation from "next-translate/useTranslation";
import { getUserSession } from "@lib/auth";

//internal import

import Layout from "@layout/Layout";
import Label from "@components/form/Label";
import Error from "@components/form/Error";
import CartItem from "@components/cart/CartItem";
import InputArea from "@components/form/InputArea";
import useGetSetting from "@hooks/useGetSetting";
import InputShipping from "@components/form/InputShipping";
import InputPayment from "@components/form/InputPayment";
import useCheckoutSubmit from "@hooks/useCheckoutSubmit";
import useUtilsFunction from "@hooks/useUtilsFunction";
import SettingServices from "@services/SettingServices";
import CustomerServices from "@services/CustomerServices";
import LocationServices from "@services/LocationServices";
import SwitchToggle from "@components/form/SwitchToggle";
import { notifySuccess, notifyError } from "@utils/toast";
import { isProfileComplete, getDisplayEmail } from "@utils/profileAuth";

const Checkout = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const formRef = useRef(null);
  const [portalReady, setPortalReady] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
    zipCode: "",
    phone: "",
    addressType: "Home",
    isDefault: false
  });
  const userInfo = getUserSession();
  const { showingTranslateValue, currency } = useUtilsFunction();

  // Custom Redesign State
  const [currentStep, setCurrentStep] = useState(1);
  const [localShippingMethod, setLocalShippingMethod] = useState("Standard");

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!showAddressModal) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showAddressModal]);
  const { storeCustomizationSetting } = useGetSetting();

  const { data: storeSetting } = useQuery({
    queryKey: ["storeSetting"],
    queryFn: async () => await SettingServices.getStoreSetting(),
    staleTime: 4 * 60 * 1000, // Api request after 4 minutes
  });

  // Fetch user's shipping addresses
  const { data: shippingAddressesResponse, refetch: refetchAddresses } = useQuery({
    queryKey: ["shippingAddresses", userInfo?._id],
    queryFn: async () => {
      if (!userInfo?._id) return null;
      const response = await CustomerServices.getShippingAddress({ userId: userInfo._id });
      return response?.shippingAddress || [];
    },
    enabled: !!userInfo?._id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Normalize shippingAddresses to always be an array
  const shippingAddresses = Array.isArray(shippingAddressesResponse)
    ? shippingAddressesResponse
    : shippingAddressesResponse
      ? [shippingAddressesResponse]
      : [];

  // Set default selected address on load
  React.useEffect(() => {
    if (shippingAddresses && shippingAddresses.length > 0 && !selectedAddress) {
      const defaultAddress = shippingAddresses.find(addr => addr.isDefault) || shippingAddresses[0];
      setSelectedAddress(defaultAddress);
    }
  }, [shippingAddresses]);

  const {
    error,
    couponInfo,
    couponRef,
    total,
    isEmpty,
    items,
    cartTotal,
    register,
    errors,
    watch,
    showCard,
    setShowCard,
    handleSubmit,
    submitHandler,
    handleShippingCost,
    handleCouponCode,
    discountAmount,
    shippingCost,
    isCheckoutSubmit,
    useExistingAddress,
    hasShippingAddress,
    isCouponAvailable,
    availableCoupons,
    selectedCouponCode,
    setSelectedCouponCode,
    handleDefaultShippingAddress,
    taxSummary,
    setValue,
    isCouponApplied,
    handleRemoveCoupon,
  } = useCheckoutSubmit(storeSetting);

  const selectedPaymentMethod = watch("paymentMethod");

  // Update form values when selected address changes
  React.useEffect(() => {
    if (selectedAddress && setValue) {
      const nameParts = (selectedAddress.name || "").split(" ");
      setValue("firstName", nameParts[0] || "");
      setValue("lastName", nameParts.slice(1).join(" ") || "");
      setValue("email", getDisplayEmail(userInfo) || "");
      setValue("contact", selectedAddress.phone || "");
      setValue("address", selectedAddress.address || "");
      setValue("address2", "");
      setValue("city", selectedAddress.city || "");
      setValue("state", selectedAddress.country || "");
      setValue("country", selectedAddress.country || "India");
      setValue("zipCode", selectedAddress.zipCode || "");
    }
  }, [selectedAddress, setValue, userInfo]);

  // Calculate totals for order summary
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

  // Handle address form input changes
  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm({
      ...addressForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Auto fetch location by pincode
  React.useEffect(() => {
    const fetchLocation = async () => {
      if (addressForm.zipCode && addressForm.zipCode.length === 6 && /^\d+$/.test(addressForm.zipCode)) {
        try {
          const response = await fetch(`https://api.postalpincode.in/pincode/${addressForm.zipCode}`);
          const data = await response.json();
          if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
            const postOffice = data[0].PostOffice[0];
            setAddressForm(prev => ({
              ...prev,
              city: postOffice.District || postOffice.Block || postOffice.Name,
              country: postOffice.State
            }));
            notifySuccess(`Location fetched: ${postOffice.District || postOffice.Block || postOffice.Name}, ${postOffice.State}`);
          }
        } catch (error) {
          console.error("Error fetching location details:", error);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      fetchLocation();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [addressForm.zipCode]);

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

            // Extract address components
            let street = "";
            let city = "";
            let state = "";
            let zip = "";

            // Street address parts
            const streetNumber = result.address_components.find(c => c.types.includes("street_number"))?.long_name || "";
            const route = result.address_components.find(c => c.types.includes("route"))?.long_name || "";
            const sublocality = result.address_components.find(c => c.types.includes("sublocality"))?.long_name || "";

            street = [streetNumber, route, sublocality].filter(Boolean).join(", ");

            // If street is still empty, use formatted_address part
            if (!street) {
              street = result.formatted_address.split(",")[0];
            }

            city = result.address_components.find(c => c.types.includes("locality"))?.long_name || "";
            state = result.address_components.find(c => c.types.includes("administrative_area_level_1"))?.long_name || "";
            zip = result.address_components.find(c => c.types.includes("postal_code"))?.long_name || "";

            setAddressForm(prev => ({
              ...prev,
              address: street || prev.address,
              city: city || prev.city,
              country: state || prev.country,
              zipCode: zip || prev.zipCode
            }));

            notifySuccess("Location updated successfully!");
          } else {
            notifyError("Unable to fetch current location. Please try again.");
          }
        } catch (error) {
          console.error("Location error:", error);
          notifyError("Unable to fetch current location. Please try again.");
        } finally {
          setIsLocationLoading(false);
        }
      },
      (error) => {
        setIsLocationLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          notifyError("Location permission denied. Please allow location access.");
        } else {
          notifyError("Unable to fetch current location. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Open modal for adding new address
  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      name: userInfo?.name || "",
      address: "",
      city: "",
      country: "",
      zipCode: "",
      phone: userInfo?.phone || "",
      addressType: "Home",
      isDefault: shippingAddresses.length === 0
    });
    setShowAddressModal(true);
  };

  // Open modal for editing address
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      name: address.name || "",
      address: address.address || "",
      city: address.city || "",
      country: address.country || "",
      zipCode: address.zipCode || "",
      phone: address.phone || "",
      addressType: address.addressType || "Home",
      isDefault: address.isDefault || false
    });
    setShowAddressModal(true);
  };

  // Handle address submission (add or update)
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      // GUEST CHECKOUT: If no user session, save address only in local state
      if (!userInfo || !userInfo._id) {
        const guestAddress = {
          ...addressForm,
          _id: `guest-${Date.now()}`,
          isDefault: true,
        };
        setSelectedAddress(guestAddress);
        setShowAddressModal(false);
        setAddressForm({
          name: "",
          address: "",
          city: "",
          country: "",
          zipCode: "",
          phone: "",
          addressType: "Home",
          isDefault: false
        });
        notifySuccess("Address saved for this order!");
        return;
      }

      let response;
      if (editingAddress && editingAddress._id) {
        // Update existing address
        response = await CustomerServices.updateShippingAddress({
          userId: userInfo._id,
          shippingId: editingAddress._id,
          shippingAddressData: addressForm
        });
      } else {
        // Add new address
        response = await CustomerServices.addShippingAddress({
          userId: userInfo._id,
          shippingAddressData: addressForm
        });
      }

      if (response.success || response.message) {
        setShowAddressModal(false);
        setEditingAddress(null);
        // Reset form
        setAddressForm({
          name: "",
          address: "",
          city: "",
          country: "",
          zipCode: "",
          phone: "",
          addressType: "Home",
          isDefault: false
        });
        // Refetch addresses to get the latest
        await refetchAddresses();
        // If this was set as default or is first address, select it
        if (addressForm.isDefault || shippingAddresses.length === 0) {
          const updatedResponse = await CustomerServices.getShippingAddress({ userId: userInfo._id });
          const updatedAddresses = Array.isArray(updatedResponse?.shippingAddress)
            ? updatedResponse.shippingAddress
            : [];
          const newDefault = updatedAddresses.find(addr => addr.isDefault) || updatedAddresses[updatedAddresses.length - 1];
          if (newDefault) setSelectedAddress(newDefault);
        }
        notifySuccess(editingAddress ? "Address updated successfully" : "Address added successfully");
      } else {
        notifyError(response.message || "Failed to save address");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      notifyError(error?.response?.data?.message || error?.message || "Failed to save address");
    }
  };

  // Handle address deletion
  const handleDeleteAddress = async (addressId) => {
    // GUEST: just clear the selected address from state
    if (!userInfo || !userInfo._id) {
      if (selectedAddress?._id === addressId) {
        setSelectedAddress(null);
      }
      notifySuccess("Address removed");
      return;
    }

    try {
      const response = await CustomerServices.deleteShippingAddress({
        userId: userInfo._id,
        shippingId: addressId
      });

      if (response.message || response.success) {
        await refetchAddresses();
        // If deleted address was selected, select first available
        if (selectedAddress?._id === addressId) {
          const updatedResponse = await CustomerServices.getShippingAddress({ userId: userInfo._id });
          const updatedAddresses = Array.isArray(updatedResponse?.shippingAddress)
            ? updatedResponse.shippingAddress
            : [];
          if (updatedAddresses.length > 0) {
            setSelectedAddress(updatedAddresses[0]);
          } else {
            setSelectedAddress(null);
          }
        }
        notifySuccess("Address deleted successfully");
      } else {
        notifyError(response.message || "Failed to delete address");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      notifyError(error?.response?.data?.message || error?.message || "Failed to delete address");
    }
  };

  const totals = calculateTotals();

  return (
    <>
      <Layout title="Checkout" description="this is checkout page">
        <div className="bg-[#FCF9F5] min-h-screen">
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10">
            <div className="py-8 sm:py-12 w-full flex flex-col lg:flex-row lg:gap-16 xl:gap-20">

              {/* LEFT SIDE (65%) */}
              <div className="w-full lg:w-[60%] xl:w-[65%] flex flex-col min-w-0 pb-20 lg:pb-0">

                {/* Progress Indicator */}
                <div className="flex items-center gap-2 mb-10 text-xs sm:text-sm font-semibold tracking-widest uppercase">
                  <Link href="/cart" className="text-[#3B2A25]/60 hover:text-[#9C6A5A] transition-colors">Cart</Link>
                  <IoChevronForward className="text-[#3B2A25]/40" />
                  <button onClick={() => setCurrentStep(1)} className={`${currentStep >= 1 ? 'text-[#C8A15A]' : 'text-[#3B2A25]/60'}`}>Information</button>
                  <IoChevronForward className="text-[#3B2A25]/40" />
                  <button onClick={() => selectedAddress && setCurrentStep(2)} disabled={!selectedAddress} className={`${currentStep >= 2 ? 'text-[#C8A15A]' : 'text-[#3B2A25]/60'} ${!selectedAddress ? 'cursor-not-allowed' : ''}`}>Shipping</button>
                  <IoChevronForward className="text-[#3B2A25]/40" />
                  <button onClick={() => selectedAddress && setCurrentStep(3)} disabled={!selectedAddress} className={`${currentStep >= 3 ? 'text-[#C8A15A]' : 'text-[#3B2A25]/60'} ${!selectedAddress ? 'cursor-not-allowed' : ''}`}>Payment</button>
                </div>

                <div className="mt-2 lg:mt-0">
                  <form ref={formRef} onSubmit={handleSubmit(submitHandler)}>

                    {/* STEP 1: INFORMATION */}
                    {currentStep === 1 && (
                      <div className="animate-fade-in-up">
                        <div className="flex justify-between items-end mb-6">
                          <h2 className="text-2xl sm:text-3xl font-serif text-[#3B2A25] font-light">
                            Contact & Delivery
                          </h2>
                          {hasShippingAddress && (
                            <SwitchToggle
                              id="shipping-address"
                              title="Use Default"
                              processOption={useExistingAddress}
                              handleProcess={handleDefaultShippingAddress}
                            />
                          )}
                        </div>

                        {/* Saved Addresses as Premium Cards */}
                        <div className="space-y-4 mb-8">
                          {(() => {
                            // For guests, show selectedAddress if it exists and starts with 'guest-'
                            const guestAddress = !userInfo?._id && selectedAddress ? [selectedAddress] : [];
                            const displayAddresses = shippingAddresses && shippingAddresses.length > 0
                              ? shippingAddresses
                              : guestAddress;

                            return displayAddresses.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {displayAddresses.map((address) => {
                                  const isSelected = selectedAddress?._id === address._id || selectedAddress?.id === address.id;
                                  return (
                                    <div
                                      key={address._id || address.id || Math.random()}
                                      onClick={() => {
                                        setSelectedAddress(address);
                                        // Update hook form
                                        const nameParts = (address.name || "").split(" ");
                                        setValue("firstName", nameParts[0] || "");
                                        setValue("lastName", nameParts.slice(1).join(" ") || "");
                                        setValue("email", getDisplayEmail(userInfo) || "");
                                        setValue("contact", address.phone || "");
                                        setValue("address", address.address || "");
                                        setValue("address2", "");
                                        setValue("city", address.city || "");
                                        setValue("state", address.country || "");
                                        setValue("country", address.country || "India");
                                        setValue("zipCode", address.zipCode || "");
                                      }}
                                      className={`relative cursor-pointer transition-all duration-300 rounded-[20px] p-5 border-2 ${isSelected
                                          ? 'border-[#9C6A5A] bg-[#FAF7F5] shadow-[0_8px_30px_rgb(156,106,90,0.12)] transform -translate-y-1'
                                          : 'border-[#E6D1CB]/40 bg-white hover:border-[#9C6A5A]/50 hover:shadow-md'
                                        }`}
                                    >
                                      {isSelected && (
                                        <div className="absolute top-4 right-4 text-[#C8A15A]">
                                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                          </svg>
                                        </div>
                                      )}
                                      <div className="mb-3">
                                        <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9C6A5A] bg-[#9C6A5A]/10 rounded-full">
                                          {address.addressType || 'Home'}
                                        </span>
                                      </div>
                                      <h3 className="text-base font-bold text-[#3B2A25] mb-1">{address.name}</h3>
                                      <p className="text-sm text-[#3B2A25]/70 leading-relaxed mb-3">
                                        {address.address}, {address.city}, {address.country} {address.zipCode}
                                      </p>
                                      <p className="text-sm font-medium text-[#3B2A25] flex items-center gap-2">
                                        <svg className="w-4 h-4 text-[#C8A15A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                        {address.phone}
                                      </p>

                                      <div className="absolute bottom-4 right-4 flex gap-2">
                                        <button type="button" onClick={(e) => { e.stopPropagation(); handleEditAddress(address); }} className="p-2 text-[#3B2A25]/40 hover:text-[#9C6A5A] transition-colors"><FiEdit size={16} /></button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="bg-white border border-[#E6D1CB]/40 rounded-[20px] p-8 text-center shadow-sm">
                                <p className="text-[#3B2A25]/60 mb-4">You don't have any saved addresses yet.</p>
                              </div>
                            );
                          })()}

                          <button
                            type="button"
                            onClick={handleAddAddress}
                            className="w-full sm:w-auto mt-4 px-6 py-4 border-2 border-dashed border-[#C8A15A]/40 rounded-[20px] text-[#9C6A5A] font-semibold text-sm uppercase tracking-widest hover:border-[#C8A15A] hover:bg-[#FAF7F5] transition-all flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            Add New Address
                          </button>
                        </div>

                        <div className="flex justify-end pt-6 border-t border-[#E6D1CB]/40">
                          <button
                            type="button"
                            disabled={!selectedAddress}
                            onClick={() => setCurrentStep(2)}
                            className={`h-[58px] px-10 rounded-[18px] text-base font-bold tracking-wider text-white transition-all transform hover:-translate-y-1 shadow-lg ${selectedAddress ? 'bg-[#6D3D2E] hover:bg-[#4A291E]' : 'bg-gray-400 cursor-not-allowed shadow-none hover:translate-y-0'
                              }`}
                          >
                            Continue to Shipping
                          </button>
                        </div>
                      </div>
                    )}
                    {/* STEP 2: SHIPPING METHOD */}
                    {currentStep === 2 && (
                      <div className="animate-fade-in-up">
                        <div className="flex items-center gap-4 mb-8">
                          <h2 className="text-2xl sm:text-3xl font-serif text-[#3B2A25] font-light">
                            Shipping Method
                          </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                          {/* Standard Delivery */}
                          <div
                            onClick={() => {
                              setLocalShippingMethod("Standard");
                              handleShippingCost(0);
                            }}
                            className={`relative cursor-pointer transition-all duration-300 rounded-[20px] p-6 border-2 flex flex-col justify-between min-h-[140px] ${localShippingMethod === "Standard"
                                ? 'border-[#9C6A5A] bg-[#FAF7F5] shadow-[0_8px_30px_rgb(156,106,90,0.12)] transform -translate-y-1'
                                : 'border-[#E6D1CB]/40 bg-white hover:border-[#9C6A5A]/50 hover:shadow-md'
                              }`}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="w-10 h-10 rounded-full bg-[#9C6A5A]/10 flex items-center justify-center text-[#9C6A5A]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                              </div>
                              {localShippingMethod === "Standard" && (
                                <div className="text-[#C8A15A]">
                                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex justify-between items-baseline mb-1">
                                <h3 className="text-lg font-bold text-[#3B2A25]">Standard</h3>
                                <span className="font-bold text-[#6D3D2E] uppercase tracking-wide">Free</span>
                              </div>
                              <p className="text-sm text-[#3B2A25]/60">3–5 Business Days</p>
                            </div>
                          </div>

                          {/* Express Delivery */}
                          <div
                            onClick={() => {
                              setLocalShippingMethod("Express");
                              handleShippingCost(99);
                            }}
                            className={`relative cursor-pointer transition-all duration-300 rounded-[20px] p-6 border-2 flex flex-col justify-between min-h-[140px] ${localShippingMethod === "Express"
                                ? 'border-[#9C6A5A] bg-[#FAF7F5] shadow-[0_8px_30px_rgb(156,106,90,0.12)] transform -translate-y-1'
                                : 'border-[#E6D1CB]/40 bg-white hover:border-[#9C6A5A]/50 hover:shadow-md'
                              }`}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="w-10 h-10 rounded-full bg-[#C8A15A]/10 flex items-center justify-center text-[#C8A15A]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                              </div>
                              {localShippingMethod === "Express" && (
                                <div className="text-[#C8A15A]">
                                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex justify-between items-baseline mb-1">
                                <h3 className="text-lg font-bold text-[#3B2A25]">Express</h3>
                                <span className="font-bold text-[#6D3D2E]">₹99.00</span>
                              </div>
                              <p className="text-sm text-[#3B2A25]/60">1–2 Business Days</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-6 border-t border-[#E6D1CB]/40">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="text-[#9C6A5A] font-semibold text-sm tracking-wider hover:text-[#6D3D2E] flex items-center gap-2"
                          >
                            <IoChevronForward className="rotate-180" /> Return to Information
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(3)}
                            className="h-[58px] px-10 rounded-[18px] text-base font-bold tracking-wider text-white bg-[#6D3D2E] hover:bg-[#4A291E] transition-all transform hover:-translate-y-1 shadow-lg"
                          >
                            Continue to Payment
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: PAYMENT */}
                    {currentStep === 3 && (
                      <div className="animate-fade-in-up">
                        <div className="flex items-center gap-4 mb-8">
                          <h2 className="text-2xl sm:text-3xl font-serif text-[#3B2A25] font-light">
                            Payment
                          </h2>
                        </div>
                        <p className="text-sm text-[#3B2A25]/60 mb-4">All transactions are secure and encrypted.</p>

                        <div className="border border-[#E6D1CB]/40 rounded-[20px] overflow-hidden bg-white mb-6">
                          {/* Option 1: Credit / Debit Card */}
                          <label className={`flex flex-col p-6 cursor-pointer border-b border-[#E6D1CB]/40 transition-colors ${selectedPaymentMethod === 'Card' ? 'bg-[#FAF7F5]' : 'hover:bg-gray-50'}`}>
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  type="radio"
                                  value="Card"
                                  {...register("paymentMethod", { required: "Payment Method is required!" })}
                                  className="w-5 h-5 text-[#C8A15A] focus:ring-[#C8A15A] border-gray-300"
                                  defaultChecked
                                />
                              </div>
                              <div className="ml-4 flex-1">
                                <div className="flex justify-between items-center">
                                  <span className="block text-sm font-bold text-[#3B2A25]">Credit / Debit Card</span>
                                  <div className="flex gap-1.5 flex-wrap items-center">
                                    {/* Mastercard */}
                                    <span className="inline-flex items-center justify-center w-[34px] h-[22px] rounded bg-[#1A1A1A] shadow-xs px-1">
                                      <div className="flex -space-x-1.5">
                                        <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B]"></div>
                                        <div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B]/95"></div>
                                      </div>
                                    </span>
                                    {/* Visa */}
                                    <span className="inline-flex items-center justify-center w-[34px] h-[22px] rounded bg-[#1A1F71] text-white font-black italic text-[9px] tracking-wider shadow-xs">
                                      VISA
                                    </span>
                                    {/* RuPay */}
                                    <span className="inline-flex items-center justify-center w-[42px] h-[22px] rounded bg-white border border-[#E6D1CB]/50 text-[8px] font-black italic shadow-xs">
                                      <span className="text-[#00529B]">Ru</span><span className="text-[#E57E24]">Pay</span>
                                    </span>
                                    {/* +3 */}
                                    <span className="inline-flex items-center justify-center w-[24px] h-[22px] rounded bg-white border border-[#E6D1CB]/50 text-[9px] font-bold text-[#00529B]">
                                      +3
                                    </span>
                                  </div>
                                </div>
                                <span className="block text-xs text-[#3B2A25]/60 mt-1">Pay securely using your Visa, Mastercard, or RuPay card.</span>
                              </div>
                            </div>

                            {/* Card Details form inside the card option */}
                            {selectedPaymentMethod === 'Card' && (
                              <div className="mt-6 pt-6 border-t border-[#E6D1CB]/40 space-y-4 animate-fade-in">
                                <div>
                                  <label className="block text-xs font-semibold text-[#3B2A25]/70 mb-1.5 uppercase tracking-wider">Card Number</label>
                                  <input
                                    type="text"
                                    placeholder="1234 5678 9012 3456"
                                    {...register("cardNumber", { required: selectedPaymentMethod === 'Card' ? "Card number is required" : false })}
                                    className="w-full h-[50px] px-4 rounded-[12px] border border-[#E6D1CB]/60 focus:outline-none focus:border-[#9C6A5A] text-sm text-[#3B2A25]"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs font-semibold text-[#3B2A25]/70 mb-1.5 uppercase tracking-wider">Expiration Date</label>
                                    <input
                                      type="text"
                                      placeholder="MM/YY"
                                      {...register("cardExpiry", { required: selectedPaymentMethod === 'Card' ? "Expiry is required" : false })}
                                      className="w-full h-[50px] px-4 rounded-[12px] border border-[#E6D1CB]/60 focus:outline-none focus:border-[#9C6A5A] text-sm text-[#3B2A25]"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-[#3B2A25]/70 mb-1.5 uppercase tracking-wider">Security Code (CVV)</label>
                                    <input
                                      type="password"
                                      placeholder="123"
                                      maxLength={4}
                                      {...register("cardCVC", { required: selectedPaymentMethod === 'Card' ? "CVV is required" : false })}
                                      className="w-full h-[50px] px-4 rounded-[12px] border border-[#E6D1CB]/60 focus:outline-none focus:border-[#9C6A5A] text-sm text-[#3B2A25]"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-[#3B2A25]/70 mb-1.5 uppercase tracking-wider">Name on Card</label>
                                  <input
                                    type="text"
                                    placeholder="John Doe"
                                    {...register("cardName", { required: selectedPaymentMethod === 'Card' ? "Cardholder name is required" : false })}
                                    className="w-full h-[50px] px-4 rounded-[12px] border border-[#E6D1CB]/60 focus:outline-none focus:border-[#9C6A5A] text-sm text-[#3B2A25]"
                                  />
                                </div>
                              </div>
                            )}
                          </label>

                          {/* Option 2: UPI ID */}
                          <label className={`flex flex-col p-6 cursor-pointer border-b border-[#E6D1CB]/40 transition-colors ${selectedPaymentMethod === 'UPI' ? 'bg-[#FAF7F5]' : 'hover:bg-gray-50'}`}>
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  type="radio"
                                  value="UPI"
                                  {...register("paymentMethod", { required: "Payment Method is required!" })}
                                  className="w-5 h-5 text-[#C8A15A] focus:ring-[#C8A15A] border-gray-300"
                                />
                              </div>
                              <div className="ml-4 flex-1">
                                <div className="flex justify-between items-center">
                                  <span className="block text-sm font-bold text-[#3B2A25]">UPI ID</span>
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[9px] font-black text-emerald-600 shadow-sm">UPI</span>
                                </div>
                                <span className="block text-xs text-[#3B2A25]/60 mt-1">Pay instantly using any UPI app (PhonePe, Google Pay, Paytm).</span>
                              </div>
                            </div>

                            {/* UPI ID input inside the option */}
                            {selectedPaymentMethod === 'UPI' && (
                              <div className="mt-6 pt-6 border-t border-[#E6D1CB]/40 space-y-4 animate-fade-in">
                                <div>
                                  <label className="block text-xs font-semibold text-[#3B2A25]/70 mb-1.5 uppercase tracking-wider">UPI ID / VPA</label>
                                  <input
                                    type="text"
                                    placeholder="username@upi"
                                    {...register("upiId", { required: selectedPaymentMethod === 'UPI' ? "UPI ID is required" : false })}
                                    className="w-full h-[50px] px-4 rounded-[12px] border border-[#E6D1CB]/60 focus:outline-none focus:border-[#9C6A5A] text-sm text-[#3B2A25]"
                                  />
                                </div>
                              </div>
                            )}
                          </label>

                          {/* Option 3: Razorpay (Wallets & Netbanking) */}
                          <label className={`flex flex-col p-6 cursor-pointer transition-colors ${selectedPaymentMethod === 'RazorPay' ? 'bg-[#FAF7F5]' : 'hover:bg-gray-50'}`}>
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  type="radio"
                                  value="RazorPay"
                                  {...register("paymentMethod", { required: "Payment Method is required!" })}
                                  className="w-5 h-5 text-[#C8A15A] focus:ring-[#C8A15A] border-gray-300"
                                />
                              </div>
                              <div className="ml-4 flex-1">
                                <div className="flex justify-between items-center">
                                  <span className="block text-sm font-bold text-[#3B2A25]">Razorpay Secure (Netbanking & Wallets)</span>
                                </div>
                                <span className="block text-xs text-[#3B2A25]/60 mt-1">Pay securely via Net Banking, Wallets, or international cards.</span>
                              </div>
                            </div>
                          </label>
                        </div>
                        <Error errorMessage={errors.paymentMethod} />

                        {/* Terms and Conditions */}
                        <div className="mb-8 flex items-start gap-3 bg-[#FAF7F5] p-5 rounded-[16px]">
                          <div className="flex items-center h-5">
                            <input
                              type="checkbox"
                              id="agreeToTerms"
                              checked={agreeToTerms}
                              onChange={(e) => setAgreeToTerms(e.target.checked)}
                              className="w-5 h-5 text-[#9C6A5A] focus:ring-[#9C6A5A] border-gray-300 rounded cursor-pointer"
                            />
                          </div>
                          <label htmlFor="agreeToTerms" className="text-sm text-[#3B2A25]/80 font-medium cursor-pointer leading-relaxed">
                            I agree to the{" "}
                            <Link href="/terms" className="text-[#9C6A5A] hover:text-[#6D3D2E] underline font-bold">Terms & Conditions</Link>
                            {" "}and{" "}
                            <Link href="/privacy" className="text-[#9C6A5A] hover:text-[#6D3D2E] underline font-bold">Privacy Policy</Link>
                          </label>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap justify-center gap-6 mb-8 text-[#3B2A25]/50">
                          <div className="flex items-center gap-2"><IoLockClosedOutline size={20} /><span className="text-xs font-bold uppercase tracking-wider">Secure Checkout</span></div>
                          <div className="flex items-center gap-2"><IoShieldCheckmarkOutline size={20} /><span className="text-xs font-bold uppercase tracking-wider">256-bit Encryption</span></div>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 pt-6 border-t border-[#E6D1CB]/40">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="text-[#9C6A5A] font-semibold text-sm tracking-wider hover:text-[#6D3D2E] flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
                          >
                            <IoChevronForward className="rotate-180" /> Return to Shipping
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              if (!agreeToTerms) {
                                notifyError("Please agree to Terms & Conditions to place order");
                                return;
                              }
                              if (formRef.current) formRef.current.requestSubmit();
                            }}
                            disabled={isEmpty || isCheckoutSubmit || !agreeToTerms}
                            className={`w-full sm:w-auto h-[58px] px-10 rounded-[18px] text-base font-bold tracking-wider text-white transition-all transform hover:-translate-y-1 shadow-lg flex items-center justify-center gap-2 ${isEmpty || isCheckoutSubmit || !agreeToTerms
                                ? 'bg-gray-400 cursor-not-allowed shadow-none hover:translate-y-0'
                                : 'bg-[#6D3D2E] hover:bg-[#4A291E]'
                              }`}
                          >
                            {isCheckoutSubmit ? (
                              <><img src="/loader/spinner.gif" alt="Loading" width={20} height={20} /> Processing...</>
                            ) : (
                              <><IoLockClosedOutline size={18} /> Pay & Place Order</>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              </div>

              <div className="w-full lg:w-[40%] xl:w-[35%] flex flex-col self-start mt-8 lg:mt-0 lg:sticky lg:top-10 lg:max-h-[calc(100dvh-5rem)] lg:overflow-y-auto scrollbar-hide">
                <div className="border border-[#E6D1CB]/40 p-6 sm:p-8 lg:p-10 rounded-[20px] bg-[#FAF7F5] shadow-[0_8px_30px_rgb(156,106,90,0.06)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8A15A]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#9C6A5A]/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                  <h2 className="font-semibold font-serif text-2xl pb-6 border-b border-[#E6D1CB]/40 text-[#3B2A25] relative z-10">
                    {showingTranslateValue(
                      storeCustomizationSetting?.checkout?.order_summary
                    )}
                  </h2>

                  {/* Cart Items */}
                  <div className="py-6 border-b border-[#E6D1CB]/40 relative z-10">
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-4 items-center">
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-[#E6D1CB]/40 shrink-0 bg-white">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#3B2A25] text-white text-xs flex items-center justify-center rounded-full font-bold shadow-md z-10 border-2 border-[#FAF7F5]">
                              {item.quantity}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm sm:text-base font-bold text-[#3B2A25] truncate">{item.title}</h4>
                            {item.variant && (
                              <p className="text-xs text-[#3B2A25]/60 mt-0.5">{item.variant}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-sm font-bold text-[#3B2A25]">
                              {currency}{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}

                      {isEmpty && (
                        <div className="text-center py-6">
                          <p className="text-sm text-[#3B2A25]/60">Your cart is empty.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Coupon Section */}
                  <div className="relative z-10 mt-6">
                    <form className="w-full">
                      {couponInfo.couponCode ? (
                        <div className="relative bg-emerald-50 border-2 border-dashed border-emerald-400 rounded-lg p-5 w-full overflow-hidden shadow-sm">
                          {/* Cutouts for coupon effect */}
                          <div className="absolute top-1/2 -left-3 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full border-r-2 border-dashed border-emerald-400 z-10"></div>
                          <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full border-l-2 border-dashed border-emerald-400 z-10"></div>

                          <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" /></svg>
                                Coupon Applied
                              </span>
                              <span className="text-xl sm:text-2xl font-black text-emerald-800 tracking-widest uppercase font-serif">
                                {couponInfo.couponCode}
                              </span>
                            </div>
                            <div className="bg-emerald-500 text-[#3B2A25] p-1.5 rounded-full shadow-sm mt-1">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>

                          <div className="border-t-2 border-dashed border-emerald-200 my-4 relative"></div>

                          <div className="flex justify-between items-center">
                            <div className="text-sm text-emerald-800 font-medium">
                              You save <span className="font-bold text-lg text-emerald-600">{currency}{discountAmount.toFixed(2)}</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={handleRemoveCoupon}
                                className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider"
                              >
                                Remove
                              </button>
                              <span className="text-emerald-300">|</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveCoupon()}
                                className="text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors uppercase tracking-wider"
                              >
                                Change
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-xs text-gray-500 italic mb-2">
                            * Applying a new coupon will replace the existing coupon.
                          </p>
                          {availableCoupons && availableCoupons.length > 0 ? (
                            <>
                              <select
                                value={selectedCouponCode}
                                onChange={(e) => setSelectedCouponCode(e.target.value)}
                                className="form-select py-2 px-3 md:px-4 w-full appearance-none transition ease-in-out border text-input text-sm rounded-md h-12 duration-200 bg-white border-[#E6D1CB]/60 focus:ring-0 focus:outline-none focus:border-[#9C6A5A]"
                              >
                                <option value="">
                                  {t("Select a coupon")}
                                </option>
                                {availableCoupons.map((coupon) => (
                                  <option key={coupon._id} value={coupon.couponCode}>
                                    {coupon.couponCode} — Min ₹
                                    {Number(coupon.minimumAmount || 0).toFixed(2)}
                                  </option>
                                ))}
                              </select>

                              <div className="flex flex-col sm:flex-row items-start justify-end">
                                {isCouponAvailable ? (
                                  <button
                                    disabled
                                    type="button"
                                    className={`md:text-sm leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold text-center justify-center border border-[#E6D1CB]/60 rounded-md placeholder-white focus-visible:outline-none focus:outline-none px-5 md:px-6 lg:px-8 py-3 md:py-3.5 lg:py-3 mt-3 sm:mt-0 sm:ml-3 md:mt-0 md:ml-3 lg:mt-0 lg:ml-3 bg-gray-100 h-12 text-sm lg:text-base w-full sm:w-auto`}
                                  >
                                    <img
                                      src="/loader/spinner.gif"
                                      alt="Loading"
                                      width={20}
                                      height={10}
                                    />
                                    <span className=" ml-2 font-light">Processing</span>
                                  </button>
                                ) : (
                                  <button
                                    disabled={isCouponAvailable || !selectedCouponCode}
                                    onClick={handleCouponCode}
                                    className={`md:text-sm leading-4 inline-flex items-center cursor-pointer bg-[#9C6A5A] transition ease-in-out duration-300 font-semibold text-center justify-center border border-[#E6D1CB]/60 rounded-md placeholder-white focus-visible:outline-none focus:outline-none px-5 md:px-6 lg:px-8 py-3 md:py-3.5 lg:py-3 mt-3 sm:mt-0 sm:ml-3 md:mt-0 md:ml-3 lg:mt-0 lg:ml-3 hover:text-[#3B2A25] hover:bg-[#FAF7F5] h-12 text-sm text-[#3B2A25] lg:text-base w-full sm:w-auto ${!selectedCouponCode ? "opacity-60 cursor-not-allowed" : ""
                                      }`}
                                  >
                                    {showingTranslateValue(
                                      storeCustomizationSetting?.checkout?.apply_button
                                    ) || "Apply"}
                                  </button>
                                )}
                              </div>

                              {discountAmount > 0 && (
                                <p className="text-xs text-green-600 font-semibold">
                                  You save {currency}
                                  {discountAmount.toFixed(2)} with this coupon.
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-xs text-gray-500">
                              No coupons available for this order amount.
                            </p>
                          )}
                        </div>
                      )}
                    </form>
                  </div>
                  <div className="py-6 relative z-10 space-y-3">
                    {/* Total MRP */}
                    <div className="flex items-center text-sm w-full font-medium text-[#3B2A25]/80">
                      Total MRP
                      <span className="ml-auto font-bold text-[#3B2A25]">
                        {currency}{totals.totalMRP.toFixed(2)}
                      </span>
                    </div>

                    {/* Total Discount */}
                    {totals.totalDiscount > 0 && (
                      <div className="flex items-center text-sm w-full font-medium text-[#C8A15A]">
                        Total Discount
                        <span className="ml-auto font-bold">
                          -{currency}{totals.totalDiscount.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {/* Tax Display */}
                    {taxSummary?.inclusiveTax > 0 && (
                      <div className="flex items-center text-sm w-full font-medium text-[#3B2A25]/60">
                        GST (included in price)
                        <span className="ml-auto font-bold text-[#3B2A25]/80">
                          {currency}{Number(taxSummary.inclusiveTax).toFixed(2)}
                        </span>
                      </div>
                    )}
                    {taxSummary?.exclusiveTax > 0 && (
                      <div className="flex items-center text-sm w-full font-medium text-[#3B2A25]/60">
                        GST (added at checkout)
                        <span className="ml-auto font-bold text-[#3B2A25]/80">
                          {currency}{Number(taxSummary.exclusiveTax).toFixed(2)}
                        </span>
                      </div>
                    )}

                    {/* Coupon Offer / Additional Discount */}
                    {discountAmount > 0 && (
                      <div className="flex items-center text-sm w-full font-medium text-[#C8A15A]">
                        {isCouponApplied ? "Coupon Offer" : showingTranslateValue(storeCustomizationSetting?.checkout?.discount)}
                        <span className="ml-auto font-bold">
                          -{currency}{discountAmount.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {/* Shipping Cost */}
                    <div className="flex items-center text-sm w-full font-medium text-[#3B2A25]/80">
                      Shipping Cost
                      <span className={`ml-auto font-bold ${shippingCost === 0 ? 'text-[#C8A15A] uppercase tracking-widest' : 'text-[#3B2A25]'}`}>
                        {shippingCost === 0 ? 'FREE' : `${currency}${shippingCost.toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#E6D1CB]/40 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-serif font-bold text-lg text-[#3B2A25]">
                          Estimated Payable
                        </span>
                        <span className="text-xs text-[#3B2A25]/60 uppercase tracking-widest mt-1">
                          INCLUDES TAXES
                        </span>
                      </div>
                      <span className="font-serif font-extrabold text-3xl text-[#6D3D2E]">
                        {currency}{parseFloat(total).toFixed(2)}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>

      {/* Address Modal — portal + high z-index so it sits above header/categories */}
      {portalReady && showAddressModal && createPortal(
        <div className="fixed inset-0 z-[10050]">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowAddressModal(false)}
          />

          {/* Modal Panel - full screen on mobile, below header on desktop */}
          <div className="absolute right-0 w-full sm:max-w-md lg:max-w-lg flex flex-col top-16 h-[calc(100dvh-4rem)] lg:top-[148px] lg:h-[calc(100dvh-148px)]">
            <div className="flex flex-col flex-1 min-h-0 bg-white shadow-xl">
              {/* Header */}
              <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#E6D1CB]/60">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 pr-2">
                  {editingAddress ? "Edit Shipping Address" : "Add Shipping Address"}
                </h3>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition-colors"
                  onClick={() => {
                    setShowAddressModal(false);
                    setEditingAddress(null);
                    setAddressForm({
                      name: "",
                      address: "",
                      city: "",
                      country: "",
                      zipCode: "",
                      phone: "",
                      addressType: "Home",
                      isDefault: false
                    });
                  }}
                >
                  <IoClose className="h-6 w-6" />
                </button>
              </div>

              <form
                onSubmit={handleAddressSubmit}
                className="flex flex-col flex-1 min-h-0"
              >
                <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4">
                  <div className="space-y-4">
                    {/* Use Current Location Button */}
                    <div className="mb-4">
                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        disabled={isLocationLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-semibold text-sm hover:bg-emerald-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLocationLoading ? (
                          <FiLoader className="animate-spin" size={18} />
                        ) : (
                          <IoLocationOutline size={18} />
                        )}
                        {isLocationLoading ? "Fetching Location..." : "Use Current Location"}
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={addressForm.name}
                        onChange={handleAddressChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-store-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <textarea
                        name="address"
                        value={addressForm.address}
                        onChange={handleAddressChange}
                        required
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-store-500 focus:border-transparent"
                        placeholder="123 Main St, Apt 4B"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={addressForm.city}
                          onChange={handleAddressChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-store-500 focus:border-transparent"
                          placeholder="New York"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State/Province
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={addressForm.country}
                          onChange={handleAddressChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-store-500 focus:border-transparent"
                          placeholder="NY"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP/Postal Code
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={addressForm.zipCode}
                        onChange={handleAddressChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-store-500 focus:border-transparent"
                        placeholder="10001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={addressForm.phone}
                        onChange={handleAddressChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-store-500 focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address Type
                        </label>
                        <select
                          name="addressType"
                          value={addressForm.addressType}
                          onChange={handleAddressChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-store-500 focus:border-transparent"
                        >
                          <option value="Home">Home</option>
                          <option value="Work">Work</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="flex items-center pt-0 sm:pt-7">
                        <input
                          type="checkbox"
                          name="isDefault"
                          checked={addressForm.isDefault}
                          onChange={handleAddressChange}
                          className="h-4 w-4 text-[#9C6A5A] focus:ring-store-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                          Set as default address
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons - always visible */}
                <div className="flex-shrink-0 border-t border-[#E6D1CB]/60 px-4 sm:px-6 py-3 sm:py-4 bg-white pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:space-x-3 sm:gap-0">
                    <button
                      type="button"
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-store-500"
                      onClick={() => setShowAddressModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2.5 border border-transparent rounded-md text-sm font-medium text-[#3B2A25] bg-[#FAF7F5] hover:bg-[#9C6A5A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-store-500"
                    >
                      {editingAddress ? "Update Address" : "Save Address"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default dynamic(() => Promise.resolve(Checkout), { ssr: false });
