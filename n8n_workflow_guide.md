# n8n Sales Conversion Workflow Guide

This guide explains the automated workflow that triggers when a sale is marked as "Closed-Converted" in the frontend.

## Overview
The workflow is designed to be **event-driven**, starting directly from user action in the React application. It handles message personalization, queueing for reliability, sending via WhatsApp, and updating the database to reflect the status.

## Workflow Steps

### 1. Trigger: Webhook (Frontend Initiated)
*   **What it does:** This node listens for a `POST` request from your React application.
*   **Mechanism:** When you click "Mark as Sold" in the frontend, the `SupabaseRepository.ts` executes a `fetch()` call to this specific URL.
*   **Data Received:** It receives the full `enquiry` object, including:
    *   `customer_name`
    *   `phone_number`
    *   `product_id` (or product name if joined)
    *   `warranty_start_date`
    *   `closed_amount`

### 2. Prepare Message (Set Node)
*   **What it does:** It formats the raw data into a friendly WhatsApp message string.
*   **Logic:** It uses n8n expressions to inject the customer's name and product details into a template.
*   **Example Output:**
    > "Hello Monish, thank you for your purchase of Water Purifier X1. We are excited to have you on board! Your warranty starts from 2024-02-10."

### 3. Supabase - Add to Queue (Insert)
*   **What it does:** Before sending, it logs the intended message into your `whatsapp_queue` table in Supabase.
*   **Status:** Sets the initial status to `'pending'`.
*   **Why this is important:**
    *   **Audit Trail:** You have a record that the system *attempted* to send a message.
    *   **Reliability:** If the WhatsApp API fails, you still have the record in the queue to retry later.

### 4. Send WhatsApp (HTTP Request)
*   **What it does:** Sends the actual message using your Evolution API instance.
*   **Configuration:**
    *   **Method:** `POST`
    *   **URL:** Your Evolution API endpoint (e.g., `/message/sendText`).
    *   **Body:** Sends the `number` and `text` prepared in previous steps.
*   **Note:** You need to replace `YOUR_EVOLUTION_API_URL`, `YOUR_INSTANCE_NAME`, and the API Key in the credentials.

### 5. Supabase - Mark Sent (Update)
*   **What it does:** updates the specific record in the `whatsapp_queue` table to `status: 'sent'`.
*   **Logic:** It uses the `id` returned from Step 3 (the Insert step) to identify which row to update.
*   **Result:** This confirms that the message successfully left the system. This fulfills your requirement: *"After the whatsapp message queue is sent, then supabase should store as message sent"*.

## How to Import
1.  Open n8n.
2.  Click **Add Workflow** > **Import from File**.
3.  Select the `sales_conversion_workflow.json` file generated in your project folder.
4.  **Configure Credentials:**
    *   Open the Supabase nodes and select your Supabase credentials.
    *   Open the HTTP Request node and set up your Evolution API credentials (header `apikey`).

## Frontend Integration
The frontend is already configured to trigger this. The `SupabaseRepository.ts` file contains the logic:
```typescript
if (stage === 'Closed-Converted') {
    fetch(N8N_SALES_WEBHOOK_URL, { ... })
}
```
Ensure the `N8N_SALES_WEBHOOK_URL` in `SupabaseRepository.ts` matches the "Test" or "Production" URL of your Webhook node in n8n.
