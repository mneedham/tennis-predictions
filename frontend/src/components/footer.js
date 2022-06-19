import React from "react";
import { FooterHyperlink } from "./footer-hyperlink";

export const Footer = () => {
  const resourceList = [
    {
      path: "https://auth0.com/why-auth0/",
      label: "Why Auth0",
    },
    {
      path: "https://auth0.com/docs/get-started",
      label: "How It Works",
    },
    {
      path: "https://auth0.com/blog/developers/",
      label: "Developer Blog",
    },
    {
      path: "https://auth0.com/contact-us",
      label: "Contact an Expert",
    },
  ];

  return (
    <footer className="footer">
    <div className="footer-brand">
      <img
        className="footer-brand__logo"
        src="/noun-tennis-1922615-71D358.png"
        alt="Auth0"
        width="20"
        height="22.22"
      />
      &nbsp;Developed by&nbsp;
      <FooterHyperlink path="https://twitter.com/markhneedham">
        @markhneedham
      </FooterHyperlink>
    </div>

</footer>
  );
};
