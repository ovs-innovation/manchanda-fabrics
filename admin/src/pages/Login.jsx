import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Input } from "@windmill/react-ui";
import { ImFacebook, ImGoogle } from "react-icons/im";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useTranslation } from "react-i18next";

//internal import
import Error from "@/components/form/others/Error";
import LabelArea from "@/components/form/selectOption/LabelArea";
import InputArea from "@/components/form/input/InputArea";
import useLoginSubmit from "@/hooks/useLoginSubmit";
import CMButton from "@/components/form/button/CMButton";
import { SidebarContext } from "@/context/SidebarContext";
import { ADMIN_BRAND_LOGO } from "@/utils/cloudinaryUrl";

const Login = () => {
  const { t } = useTranslation();
  const { globalSetting } = useContext(SidebarContext);
  const { onSubmit, register, handleSubmit, errors, loading } =
    useLoginSubmit();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <div className="flex items-center min-h-screen p-6 bg-store-50 dark:bg-store-900">
        <div className="flex-1 h-full max-w-2xl mx-auto overflow-hidden bg-white rounded-lg shadow-xl border border-store-200 dark:bg-store-900 dark:border-store-700/40">
          <div className="flex flex-col overflow-y-auto">
            <div className="w-full flex justify-center p-6">
              <img
                aria-hidden="true"
                className="object-contain h-32 w-auto max-w-[280px]"
                src={ADMIN_BRAND_LOGO}
                alt={globalSetting?.company_name || "Manchanda Fabrics"}
              />
            </div>
            <main className="flex items-center justify-center p-6 sm:p-12">
              <div className="w-full max-w-sm">
                <h1 className="mb-2 text-2xl font-semibold text-store-800 dark:text-store-100 text-center">
                  Login
                </h1>
                <form onSubmit={handleSubmit(onSubmit)} className="text-left">
                  <LabelArea label="Email" />
                  <InputArea
                    required={true}
                    register={register}
                    label="Email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    placeholder="john@doe.com"
                  />
                  <Error errorName={errors.email} />
                  <div className="mt-6"></div>
                  <LabelArea label="Password" />
                  <div className="relative">
                    <Input
                      {...register("password", {
                        required: "Password is required!",
                      })}
                      type={showPassword ? "text" : "password"}
                      placeholder="***************"
                      name="password"
                      autoComplete="current-password"
                      className="mr-2 h-12 p-2 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <FiEyeOff className="h-5 w-5" />
                      ) : (
                        <FiEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <Error errorName={errors.password} />

                  {loading ? (
                    <CMButton
                      disabled={loading}
                      type="submit"
                      className={`bg-store-600 rounded-md mt-4 h-12 w-full`}
                      to="/dashboard"
                    />
                  ) : (
                    <Button
                      disabled={loading}
                      type="submit"
                      className="mt-4 h-12 w-full"
                      to="/dashboard"
                    >
                      {t("LoginTitle")}
                    </Button>
                  )}
                  {/* <hr className="my-10" />
                  <button
                    disabled
                    className="text-sm inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold font-serif text-center justify-center rounded-md focus:outline-none text-gray-700 bg-gray-100 shadow-sm my-2 md:px-2 lg:px-3 py-4 md:py-3.5 lg:py-4 hover:text-white hover:bg-blue-600 h-11 md:h-12 w-full mr-2"
                  >
                    <ImFacebook className="w-4 h-4 mr-2" />{" "}
                    <span className="ml-2"> {t("LoginWithFacebook")} </span>
                  </button>
                  <button
                    disabled
                    className="text-sm inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold font-serif text-center justify-center rounded-md focus:outline-none text-gray-700 bg-gray-100 shadow-sm my-2  md:px-2 lg:px-3 py-4 md:py-3.5 lg:py-4 hover:text-white hover:bg-red-500 h-11 md:h-12 w-full"
                  >
                    <ImGoogle className="w-4 h-4 mr-2" />{" "}
                    <span className="ml-2">{t("LoginWithGoogle")}</span>
                  </button> */}
                </form>
                <p className="mt-4">
                  <Link
                    className="text-sm font-medium text-store-500 dark:text-store-400 hover:underline"
                    to="/forgot-password"
                  >
                    {t("ForgotPassword")}
                  </Link>
                </p>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
