function extractShriram(text) {

    const vehicleMatch = text.match(
        /\(INCL\.\s*[\r\n\s]*DRIVER\)\s*[\r\n]+([^\r\n]+)/i
    );

    let vehicle_no = "";

    if (vehicleMatch) {

        const value = vehicleMatch[1].trim();

        if (value.toUpperCase().includes("NEW & PUBLIC")) {
            vehicle_no = "NEW";
        } else {
            vehicle_no = value;
        }
    }

    const engineChassisMatch = text.match(
        /([A-Z0-9]+)\s*&\s*([A-Z0-9]{17})/i
    );

    const issueDateMatch = text.match(
        /OD\s*Policy\s*From.*?(\d{2}\/\d{2}\/\d{4})/is
    );

    let issue_date = "";

    if (issueDateMatch) {
        issue_date = issueDateMatch[1].replace(/\//g, "-");
    }

    const premiumMatch = text.match(
        /Total\s*[\r\n]+([\d,]+(?:\.\d{2})?)/i
    );

    let premium = "";

    if (premiumMatch) {
        premium = premiumMatch[1].replace(/,/g, "");
    }

    return {

        insured_name:
            text.match(
                /Insured'?s\s*Code\/\s*Name\s*[\r\n]+.*?\/\s*(.*)/i
            )?.[1]?.trim() || "",

        policy_no:
            text.match(
                /Policy\s*No\.?\s*[\r\n]+([^\r\n]+)/i
            )?.[1]?.trim() || "",

        vehicle_no,

        engine_no:
            engineChassisMatch?.[1]?.trim() || "",

        chassis_no:
            engineChassisMatch?.[2]?.trim() || "",

        issue_date,

        premium

    };

}

module.exports = extractShriram;