import React from "react";
import { Helmet } from "react-helmet";

const PageTitle = ({ title, description }) => {
  return (
    <Helmet>
      <title>
        {" "}
        {title
          ? `${title} | eCommerce Admin Dashboard`
          : " eCommerce Admin Dashboard"}
      </title>
      <meta
        name="description"
        content={
          description
            ? ` ${description} `
            : " e-commerce Admin Dashboard"
        }
      />
    </Helmet>
  );
};

export default PageTitle;
