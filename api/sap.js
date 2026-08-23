function normalizeId(value) {
  return String(value || "").trim();
}

function buildMockSapResponse(body) {
  return {
    success: true,
    dryRun: true,
    mode: "local-preview",
    message: "SAP_API_KEY is not configured. This request was executed in local dry-run mode.",
    executionStatus: "AUTONOMOUSLY_EXECUTED",
    sapPayload: {
      freightOrderId: body.freightOrderId || "FO-LOCAL-001",
      carrierId: body.newCarrierId || "CARRIER_MSC_01",
      route: body.newRoute || "CAPE_OF_GOOD_HOPE_01",
      estimatedCost: Number(body.estimatedCost || 0),
      executionStatus: "02",
      statusText: "Dry run accepted",
    },
  };
}

module.exports = async function handler(req, res) {
  if (req.method === "GET") {
    res.status(200).json({
      ok: true,
      service: "sap-integration",
      status: process.env.SAP_API_KEY ? "configured" : "dry-run",
      baseURL: process.env.SAP_BASE_URL || "https://sandbox.api.sap.com/s4hanacloud/sap/opu/odata/sap/",
    });
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  let body = {};

  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  } catch (error) {
    res.status(400).json({ success: false, error: "Malformed JSON body." });
    return;
  }

  const freightOrderId = normalizeId(body.freightOrderId);
  const newCarrierId = normalizeId(body.newCarrierId);
  const newRoute = normalizeId(body.newRoute);
  const estimatedCost = Number(body.estimatedCost || 0);
  const isColdChain = Boolean(body.isColdChain);

  if (!freightOrderId || !newCarrierId || !newRoute) {
    res.status(400).json({
      success: false,
      error: "Missing required SAP payload fields: freightOrderId, newCarrierId, newRoute.",
    });
    return;
  }

  if (!process.env.SAP_API_KEY) {
    res.status(200).json(buildMockSapResponse({
      freightOrderId,
      newCarrierId,
      newRoute,
      estimatedCost,
      isColdChain,
    }));
    return;
  }

  const baseURL = (process.env.SAP_BASE_URL || "https://sandbox.api.sap.com/s4hanacloud/sap/opu/odata/sap/").replace(/\/+$/, "") + "/";
  const url = `${baseURL}API_FREIGHT_ORDER/FreightOrder('${encodeURIComponent(freightOrderId)}')`;
  const sapPayload = {
    CarrierUUID: newCarrierId,
    TransportationRoute: newRoute,
    ExecutionStatus: "02",
    EstimatedCostUSD: estimatedCost,
    IsColdChain: isColdChain,
  };

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        APIKey: process.env.SAP_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(sapPayload),
    });

    const rawText = await response.text();
    let responseData = rawText;

    try {
      responseData = JSON.parse(rawText);
    } catch {
      // keep raw payload when JSON parsing fails
    }

    if (!response.ok) {
      res.status(response.status).json({
        success: false,
        error: "SAP request failed.",
        status: response.status,
        sapPayload: responseData,
      });
      return;
    }

    res.status(200).json({
      success: true,
      sapStatus: response.status,
      sapPayload: responseData,
      executionStatus: "AUTONOMOUSLY_EXECUTED",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Unexpected SAP integration error.",
    });
  }
};
