import React from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

/**
 * <Swagger url="/apidocs/rasenmaeher/openapi.json" />
 * (You can also pass a `spec` object instead of `url`.)
 */
export default function Swagger({
  url,
  spec,
  docExpansion = "list",
  defaultModelsExpandDepth = 0,
  defaultModelExpandDepth = 1,
}: {
  url?: string;
  spec?: unknown;
  docExpansion?: "list" | "full" | "none";
  defaultModelsExpandDepth?: number;
  defaultModelExpandDepth?: number;
}) {
  const resolvedUrl = url ? useBaseUrl(url) : undefined;

  return (
    <div style={{ background: "#0b0b0b", borderRadius: 8, padding: "0.5rem" }}>
      <SwaggerUI
        url={resolvedUrl}
        spec={spec}
        deepLinking
        docExpansion={docExpansion}
        defaultModelsExpandDepth={defaultModelsExpandDepth}
        defaultModelExpandDepth={defaultModelExpandDepth}
        displayRequestDuration
        filter
        tryItOutEnabled
        persistAuthorization={false}
        requestSnippetsEnabled
      />
    </div>
  );
}
