function extractTata(text) {

    const policyNoMatch = text.match(
        /Policy\s*No\.?\s*(\d{10})/i
    );

    const insuredMatch = text.match(
        /Insured\s*Name\s*([^\r\n]+)/i
    );

    const vehicleMatch = text.match(
        /Registration\s*No\.?\s*([A-Z0-9\s\-]+)/i
    );

    const engineMatch = text.match(
        /Engine\s*No\.?\s*\/?\s*Motor\s*No\.?.*?\)\s*([A-Z0-9]+)/is
    );

    const chassisMatch = text.match(
        /Chassis\s*No\.?\s*([A-Z0-9]+)/i
    );

    const premiumMatch = text.match(
    /Premium\s*Amount\s*([\d,]+(?:\.\d{2})?)\s*Registration\s*No/i
);

    const issueDateMatch = text.match(
        /Policy\s*Issue\s*Date\s*[:\-]?\s*(\d{2}\/\d{2}\/\d{4})/i
    );

    return {

        insured_name:
            insuredMatch?.[1]?.trim() || "",

        policy_no:
            policyNoMatch?.[1]?.trim() || "",

        vehicle_no:
            vehicleMatch?.[1]?.trim() || "",

        engine_no:
            engineMatch?.[1]?.trim() || "",

        chassis_no:
            chassisMatch?.[1]?.trim() || "",

        issue_date:
            issueDateMatch?.[1]?.replace(/\//g, "-") || "",

        premium:
            premiumMatch?.[1]?.replace(/,/g, "") || ""

    };
}

module.exports = extractTata;