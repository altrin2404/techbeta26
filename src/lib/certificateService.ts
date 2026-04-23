import axios from "axios";

export interface Certificate {
    id: string;
    email: string;
    name: string;
    type: string;
    url: string;
    event?: string;
    timestamp?: any;
}

// The published CSV URL from your Google Sheet
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTawLSDbsBaG2KE3MuDnaUu9SrClJYKfz79-uBkV-pwtSwqhth8PBXm7iOhWq3zruNnQR5nGXjiYdnP/pub?gid=0&single=true&output=csv";

/**
 * Fetches all certificates associated with a given email from the published Google Sheet.
 */
export const getCertificatesByEmail = async (email: string): Promise<Certificate[]> => {
    console.log("Searching for email:", email);
    try {
        // Use fetch instead of axios for better browser compatibility in some environments
        const response = await fetch(CSV_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch sheet: ${response.statusText}`);
        }
        const csvData = await response.text();
        console.log("CSV Data fetched successfully. Length:", csvData.length);

        // More robust CSV parser that handles \r\n and empty lines
        const rows = csvData
            .split(/\r?\n/)
            .filter(line => line.trim() !== "")
            .map((row: string) => {
                return row.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
            });

        if (rows.length < 2) {
            console.warn("Sheet is empty or has no data rows");
            return [];
        }

        const header = rows[0];
        console.log("Sheet Headers:", header);

        // Find email column
        const emailIndex = header.findIndex((h: string) => 
            h.toLowerCase().includes('email') || h.toLowerCase().includes('mail')
        );
        const nameIndex = header.findIndex((h: string) => h.toLowerCase().includes('name'));

        if (emailIndex === -1) {
            console.error("Email/Mail column not found in Google Sheet. Headers found:", header);
            return [];
        }

        const searchTerm = email.toLowerCase().trim();
        console.log("Searching for term:", searchTerm, "in column index:", emailIndex);

        const userRow = rows.find((row: string[]) => {
            const cellValue = row[emailIndex]?.toLowerCase() || "";
            return cellValue === searchTerm;
        });

        if (!userRow) {
            console.log("No matching user row found for email:", searchTerm);
            return [];
        }

        console.log("Matching user row found:", userRow);

        const certificates: Certificate[] = [];
        header.forEach((colName: string, index: number) => {
            const cellValue = userRow[index];
            // Look for columns containing "Link" and have a valid HTTP link
            if (colName.toLowerCase().includes('link') && cellValue && cellValue.startsWith('http')) {
                const eventName = colName.replace(/link/i, '').trim() || 'TechBeta 2026';
                certificates.push({
                    id: `${userRow[emailIndex]}-${index}`,
                    email: userRow[emailIndex],
                    name: userRow[nameIndex] || 'Participant',
                    type: colName.toLowerCase().includes('winner') || colName.toLowerCase().includes('merit') ? 'Merit' : 'Participation',
                    url: cellValue,
                    event: eventName
                });
            }
        });

        console.log("Found certificates:", certificates);
        return certificates;
    } catch (error) {
        console.error("Error fetching certificates from Google Sheets: ", error);
        throw error;
    }
};

/**
 * Legacy function
 */
export const addCertificate = async (data: any) => {
    return { success: false, error: "Not supported" };
};
