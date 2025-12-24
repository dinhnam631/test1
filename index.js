require("dotenv").config(); //load biến môi trường
const axios = require("axios"); //gọi api

// Load environment config
const { JOTFORM_API_KEY, JOTFORM_FORM_ID, BITRIX_WEBHOOK_URL, CHECK_INTERVAL } =
  process.env;

let lastProcessedId = null;

/**
 * Log helper
 */
const log = (status, message) => {
  console.log(`[${new Date().toLocaleString()}] [${status}] ${message}`);
};

/**
 * Lấy field từ Jotform theo uniqueName
 */
const getFieldValue = (answers, uniqueName) => {
  return Object.values(answers).find((a) => a.name === uniqueName)?.answer;
};

/**
 * Xử lý tạo contact trên Bitrix
 */
const sendToBitrix = async (name, phone, email) => {
  try {
    const payload = {
      fields: {
        NAME: name || "Khách hàng",
        PHONE: phone ? [{ VALUE: phone, VALUE_TYPE: "WORK" }] : [],
        EMAIL: email ? [{ VALUE: email, VALUE_TYPE: "WORK" }] : [],
      },
    };

    const res = await axios.post(BITRIX_WEBHOOK_URL, payload);

    if (res.data?.result) {
      log("SUCCESS", `Tạo contact thành công – ID: ${res.data.result}`);
      return true;
    }

    log("WARN", "Bitrix trả về phản hồi nhưng không có result!");
    return false;
  } catch (err) {
    log("ERROR", `Lỗi gửi dữ liệu sang Bitrix: ${err.message}`);
    return false;
  }
};

/**
 * Fetch data từ Jotform và đồng bộ sang Bitrix
 */
const syncData = async () => {
  try {
    const jotformUrl = `https://api.jotform.com/form/${JOTFORM_FORM_ID}/submissions?apiKey=${JOTFORM_API_KEY}&orderby=created_at`;

    const response = await axios.get(jotformUrl);

    const submissions = response.data?.content;
    if (!Array.isArray(submissions) || submissions.length === 0) {
      log("INFO", "Không có submission nào.");
      return;
    }

    const latest = submissions[0];

    // Nếu là submission mới thì xử lý
    if (latest.id !== lastProcessedId) {
      log("INFO", `Phát hiện submission mới – ID: ${latest.id}`);

      const answers = latest.answers;

      // Parse dữ liệu từ Jotform
      const nameField = getFieldValue(answers, "fullname");
      const name =
        typeof nameField === "object"
          ? `${nameField.first || ""} ${nameField.last || ""}`.trim()
          : nameField;

      const phoneField = getFieldValue(answers, "phoneNumber");
      const phone = phoneField?.full || phoneField || "";

      const email = getFieldValue(answers, "email") || "";

      // Gửi sang Bitrix
      const success = await sendToBitrix(name, phone, email);

      if (success) {
        lastProcessedId = latest.id;
      }
    }
  } catch (err) {
    log("ERROR", `Lỗi khi lấy dữ liệu từ Jotform: ${err.message}`);
  }
};

// Validate CHECK_INTERVAL
const interval = parseInt(CHECK_INTERVAL);
if (isNaN(interval) || interval < 5000) {
  log("WARN", "CHECK_INTERVAL phải >= 5000ms. Đặt lại = 5000ms.");
}

// Start app
log("SYSTEM", "Ứng dụng bắt đầu theo dõi dữ liệu Jotform...");
setInterval(syncData, isNaN(interval) ? 5000 : interval);
