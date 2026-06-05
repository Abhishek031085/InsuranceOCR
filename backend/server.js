// ===============================
// IMPORTS
// ===============================
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdf = require("pdf-parse");
const pool = require("./db");
const ExcelJS = require("exceljs");
const extractShriram = require("./extractors/shriram");
const extractTata = require("./extractors/tata");


// ===============================
// APP INITIALIZATION
// ===============================
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // REQUIRED for save-policy API JSON body

// ===============================
// FILE UPLOAD CONFIG (MULTER)
// Store files in memory (not disk)
// ===============================
const upload = multer({
    storage: multer.memoryStorage()
});

// ===============================
// 1. GET AGENTS FROM POSTGRESQL
// ===============================
app.get("/agents", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT srl_no, name, posp_code FROM agent_master ORDER BY name"
        );

        const agents = result.rows.map((row) => ({
            value: row.posp_code,
            label: `${row.name} (${row.posp_code})`
        }));

        res.json(agents);

    } catch (err) {
        console.error("Error fetching agents:", err);
        res.status(500).json({ error: "Failed to fetch agents" });
    }
});

// ===============================
// 2. UPLOAD & PDF EXTRACTION API
// ===============================
app.post(
    "/upload",
    upload.single("pdf"),
    async (req, res) => {

        try {

            const company = req.body.company;

            const pdfData = await pdf(req.file.buffer);
            const text = pdfData.text;

            console.log("Company:", company);
            console.log("\n\n================ PDF START ================\n");
            console.log(text);
            console.log("\n================ PDF END ==================\n");

            console.log("PDF Extracted");

            let extractedData = {};

            switch (company) {

                case "SHRIRAM":
                    extractedData = extractShriram(text);
                    break;

                case "TATA":
                    extractedData = extractTata(text);
                    break;

                default:
                    extractedData = {};
            }

            // ===============================
            // DEBUG LOG (SERVER TERMINAL ONLY)
            // ===============================
            console.log("Extracted Data (SERVER):", extractedData);

            res.json({
                success: true,
                data: extractedData,

                // ===============================
                // DEBUG FIELD FOR BROWSER CONSOLE
                // ===============================
                debug: {
                    company,
                    extractedData
                }
            });

            

        } catch (error) {

            console.log("Upload Error:", error);

            res.status(500).json({
                success: false,
                error: error.message
            });

        }

    }
);

// ======================================================
// 3. SAVE POLICY API (NEW - ADDED HERE)
// ======================================================
// =============================================
// SAVE POLICY ROUTE
// =============================================
app.post("/save-policy", async (req, res) => {

    try {

        const data = req.body;

        // =============================================
        // CHECK FOR DUPLICATE ENTRY
        // =============================================
        const duplicateQuery = `
            SELECT srl_no
            FROM policies
            WHERE policy_no = $1
              AND engine_no = $2
              AND chassis_no = $3
            LIMIT 1
        `;

        const duplicateResult = await pool.query(
            duplicateQuery,
            [
                data.policy_no,
                data.engine_no,
                data.chassis_no
            ]
        );
        console.log("Duplicate Result:", duplicateResult.rows);
        // =============================================
        // DUPLICATE FOUND
        // =============================================
        if (duplicateResult.rows.length > 0) {

            return res.status(400).json({
                success: false,
                duplicate: true,
                message:
                    `Duplicate Entry! Policy already exists in Serial No ${duplicateResult.rows[0].srl_no}`
            });

        }

        // =============================================
        // INSERT POLICY
        // =============================================
        const insertQuery = `
            INSERT INTO policies (
                creation_date,
                rm_name,
                rm_id,
                posp_name,
                posp_id,
                insured_name,
                vehicle_no,
                insurer,
                payment_mode,
                gross_premium,
                po_percentage,
                status,
                policy_no,
                issued_on,
                month,
                sourced_by,
                engine_no,
                chassis_no
            )
            VALUES (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,
                $10,$11,$12,$13,$14,$15,
                $16,$17,$18
            )
        `;

        const values = [
            data.creation_date,
            data.rm_name,
            data.rm_id,
            data.posp_name,
            data.posp_id,
            data.insured_name,
            data.vehicle_no,
            data.insurer,
            data.payment_mode,
            data.gross_premium,
            data.po_percentage,
            data.status,
            data.policy_no,
            data.issued_on,
            data.month,
            data.sourced_by,
            data.engine_no,
            data.chassis_no
        ];

        await pool.query(insertQuery, values);

        // =============================================
        // SUCCESS MESSAGE
        // =============================================
        res.json({
            success: true,
            message: "Policy inserted successfully."
        });

    } catch (err) {

        console.error("Save Policy Error:", err);

        res.status(500).json({
            success: false,
            message: "Error while saving policy.",
            error: err.message
        });

    }

});
// ======================================================
// 4. dynamic agent summary (BASED ON SOURCED_BY)
// ======================================================

app.get("/agent-summary", async (req, res) => {
    try {

        const query = `
            SELECT 
                p.sourced_by AS name,

                COALESCE(SUM(p.gross_premium), 0) AS total_premium,
                COUNT(p.policy_no) AS total_nop

            FROM policies p

            WHERE p.sourced_by IS NOT NULL
              AND TRIM(p.sourced_by) <> ''

            GROUP BY p.sourced_by
            ORDER BY total_premium DESC
        `;

        const result = await pool.query(query);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (err) {
        console.error("Agent Summary Error:", err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// ======================================================
// GET POLICIES BY SOURCED_BY (for popup)
// ======================================================

app.get("/policies-by-source/:name", async (req, res) => {

    try {

        const { name } = req.params;

        const query = `
            SELECT 
                insured_name,
                vehicle_no,
                engine_no,
                chassis_no,
                insurer,
                policy_no,
                gross_premium,
                issued_on
            FROM policies
            WHERE LOWER(TRIM(sourced_by)) = LOWER(TRIM($1))
            ORDER BY issued_on DESC
        `;

        const result = await pool.query(query, [name]);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (err) {
        console.error("Popup Fetch Error:", err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// ======================================================
// Excel Extraction for ops
// ======================================================

app.post("/export-excel", async (req, res) => {

    try {

        const { fromDate, toDate } = req.body;

        const query = `
            SELECT 
                rm_name,
                rm_id,
                posp_name,
                posp_id,
                insured_name,
                vehicle_no,
                engine_no,
                chassis_no,
                insurer,
                policy_no,
                gross_premium,
                po_percentage,
                payment_mode
            FROM policies
            WHERE creation_date BETWEEN $1 AND $2
            ORDER BY creation_date DESC
        `;

        const result = await pool.query(query, [fromDate, toDate]);

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Policies");

        // headers
        sheet.columns = [
            { header: "RM Name", key: "rm_name" },
            { header: "RM ID", key: "rm_id" },
            { header: "POSP Name", key: "posp_name" },
            { header: "POSP ID", key: "posp_id" },
            { header: "Insured Name", key: "insured_name" },
            { header: "Vehicle No", key: "vehicle_no" },
            { header: "Engine No", key: "engine_no" },
            { header: "Chassis No", key: "chassis_no" },
            { header: "Insurer", key: "insurer" },
            { header: "Policy No", key: "policy_no" },
            { header: "Gross Premium", key: "gross_premium" },
            { header: "PO %", key: "po_percentage" },
            { header: "Payment Mode", key: "payment_mode" },
        ];

        result.rows.forEach(row => {
            sheet.addRow(row);
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=policies.xlsx"
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error("Excel Export Error:", err);
        res.status(500).json({ error: err.message });
    }

});

// ======================================================
// Excel Extraction for posp
// ======================================================


app.post("/export-posp-report", async (req, res) => {

    try {

        const {
            pospId,
            fromDate,
            toDate
        } = req.body;

        const query = `
            SELECT
                
                posp_name,
                posp_id,
                insured_name,
                vehicle_no,
                engine_no,
                chassis_no,
                insurer,
                policy_no,
                gross_premium,
                po_percentage,
                payment_mode,
                issued_on
            FROM policies
            WHERE posp_id = $1
            AND creation_date BETWEEN $2 AND $3
            ORDER BY creation_date DESC
        `;

        const result = await pool.query(
            query,
            [pospId, fromDate, toDate]
        );

        const workbook = new ExcelJS.Workbook();

        const sheet =
            workbook.addWorksheet("POSP Report");

        sheet.columns = [

            { header: "POSP Name", key: "posp_name" },
            { header: "POSP ID", key: "posp_id" },
            { header: "Insured Name", key: "insured_name" },
            { header: "Vehicle No", key: "vehicle_no" },
            { header: "Engine No", key: "engine_no" },
            { header: "Chassis No", key: "chassis_no" },
            { header: "Insurer", key: "insurer" },
            { header: "Policy No", key: "policy_no" },
            { header: "Gross Premium", key: "gross_premium" },
            { header: "PO %", key: "po_percentage" },
            { header: "Payment Mode", key: "payment_mode" },
            { header: "Issued On", key: "issued_on" }
        ];

        result.rows.forEach(row => {
            sheet.addRow(row);
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=posp-report.xlsx"
        );

        await workbook.xlsx.write(res);

        res.end();

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: err.message
        });

    }

});



// ===============================
// START SERVER
// ===============================
app.listen(5000, () => {
    console.log("Server Running on http://localhost:5000");
});