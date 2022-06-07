import React from "react";

export const HeroBanner = () => {
  const logo = "noun-tennis-1922615-71D358.png";

  const openCodeSample = () => {
    window.open(
      "https://auth0.com/developers/hub/code-samples/spa/react-javascript/",
      "_blank",
      "noopener noreferrer"
    );
  };

  return (
    <div className="hero-banner">
      
      <h1 className="hero-banner__headline">Hello, React World!</h1>
      <p className="hero-banner__description">
        This is a sample application that demonstrates the authentication flow
        for a React app using <strong>Auth0</strong>. It is awesome.
      </p>

      <button onClick={openCodeSample} className="button button--secondary">
        Check out the code sample →
      </button>
    </div>
  );
};
