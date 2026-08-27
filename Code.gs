/**
 * Shoe Clean - Web Application
 * Google Apps Script Backend
 */

// Spreadsheet ID - UPDATE THIS with your Google Sheets ID
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'Orders';

/**
 * SETUP FUNCTION: Run this once to create the database headers
 */
function setupDatabase() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    // Create sheet if not exists
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      // Delete default 'Sheet1' if it exists and is empty
      const defaultSheet = ss.getSheetByName('Sheet1');
      if (defaultSheet && defaultSheet.getLastRow() === 0) {
        ss.deleteSheet(defaultSheet);
      }
    }
    
    // Define Headers
    const headers = [
      'Order ID',
      'Tanggal Masuk',
      'Nama Customer',
      'No. WhatsApp',
      'Detail Sepatu',
      'Kategori',
      'Treatment',
      'Pelayanan',
      'Jumlah',
      'Harga Unit',
      'Total',
      'Metode Bayar',
      'Status Bayar',
      'Status Progress',
      'Estimasi Selesai',
      'Catatan',
      'Foto URL'
    ];
    
    // Set headers
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Formatting
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#eff6ff');
    sheet.setFrozenRows(1);
    
    // Set column widths for better readability
    sheet.setColumnWidth(1, 80);  // Order ID
    sheet.setColumnWidth(2, 120); // Tanggal
    sheet.setColumnWidth(3, 150); // Nama
    sheet.setColumnWidth(4, 120); // WA
    sheet.setColumnWidth(5, 200); // Detail
    sheet.setColumnWidth(7, 150); // Treatment
    sheet.setColumnWidth(16, 200); // Catatan
    
    return 'Database berhasil dibuat! Headers telah ditambahkan.';
  } catch (e) {
    return 'Error: ' + e.message + '. Pastikan SPREADSHEET_ID sudah benar.';
  }
}

/**
 * Serve the web app
 */
function doGet(e) {
  const page = e.parameter.page || 'customer';
  
  let template;
  if (page === 'admin') {
    template = HtmlService.createTemplateFromFile('AdminIndex');
  } else {
    template = HtmlService.createTemplateFromFile('CustomerIndex');
  }
  
  return template.evaluate()
    .setTitle('Shoe Clean')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Include HTML files
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Generate unique Order ID
 */
function generateOrderId() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  const lastRow = sheet.getLastRow();
  // Simple ID generation based on row count
  // In production, might want a more robust sequence counter
  const orderNum = lastRow; 
  return 'SC-' + String(orderNum).padStart(3, '0');
}

/**
 * Submit new order
 */
function submitOrder(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    const orderId = generateOrderId();
    const timestamp = new Date();
    const estimatedDate = new Date(timestamp.getTime() + (data.pelayanan === 'Express' ? 2 : 5) * 24 * 60 * 60 * 1000);
    
    const total = calculateTotal(data);
    
    const row = [
      orderId,
      timestamp,
      data.namaCustomer,
      data.noWhatsapp,
      data.detailSepatu,
      data.kategori,
      data.treatment.join(', '),
      data.pelayanan,
      data.jumlah,
      data.hargaUnit,
      total,
      data.metodeBayar,
      data.statusBayar,
      'Antrian',
      estimatedDate,
      data.catatan || '',
      data.fotoUrl || ''
    ];
    
    sheet.appendRow(row);
    
    return {
      success: true,
      orderId: orderId,
      total: total,
      estimatedDate: Utilities.formatDate(estimatedDate, 'Asia/Jakarta', 'dd MMM yyyy')
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Calculate total price
 */
function calculateTotal(data) {
  let basePrice = data.hargaUnit * data.jumlah;
  if (data.pelayanan === 'Express') {
    basePrice = basePrice * 1.5;
  }
  return basePrice;
}

/**
 * Get order by ID or Phone
 */
function getOrderStatus(searchTerm) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      // Search by Order ID (col 0) or Phone (col 3)
      // Convert both to string to be safe
      if (String(row[0]).toLowerCase() === String(searchTerm).toLowerCase() || 
          String(row[3]).includes(String(searchTerm))) {
        return {
          success: true,
          order: {
            id: row[0],
            tanggalMasuk: Utilities.formatDate(new Date(row[1]), 'Asia/Jakarta', 'dd MMM yyyy HH:mm'),
            namaCustomer: row[2],
            noWhatsapp: row[3],
            detailSepatu: row[4],
            kategori: row[5],
            treatment: row[6],
            pelayanan: row[7],
            jumlah: row[8],
            total: row[10],
            statusBayar: row[12],
            statusProgress: row[13],
            estimasiSelesai: Utilities.formatDate(new Date(row[14]), 'Asia/Jakarta', 'dd MMM yyyy')
          }
        };
      }
    }
    return { success: false, error: 'Order tidak ditemukan' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get all orders (Admin)
 */
function getAllOrders(filter) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    const orders = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const order = {
        id: row[0],
        tanggalMasuk: row[1],
        namaCustomer: row[2],
        noWhatsapp: row[3],
        detailSepatu: row[4],
        kategori: row[5],
        treatment: row[6],
        pelayanan: row[7],
        jumlah: row[8],
        hargaUnit: row[9],
        total: row[10],
        metodeBayar: row[11],
        statusBayar: row[12],
        statusProgress: row[13],
        estimasiSelesai: row[14],
        catatan: row[15],
        fotoUrl: row[16],
        rowIndex: i + 1
      };
      
      if (!filter || filter === 'Semua' || order.statusProgress === filter) {
        orders.push(order);
      }
    }
    
    return { success: true, orders: orders.reverse() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Update order status
 */
function updateOrderStatus(orderId, newStatus) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === orderId) {
        // Status Progress is at column index 13 (0-based) -> Column N (14)
        sheet.getRange(i + 1, 14).setValue(newStatus);
        return { success: true };
      }
    }
    return { success: false, error: 'Order tidak ditemukan' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get dashboard stats
 */
function getDashboardStats() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let orderHariIni = 0;
    let dalamProses = 0;
    let selesaiHariIni = 0;
    let pendapatanHariIni = 0;
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const orderDate = new Date(row[1]);
      orderDate.setHours(0, 0, 0, 0);
      
      if (orderDate.getTime() === today.getTime()) {
        orderHariIni++;
        if (row[12] === 'Lunas') {
          pendapatanHariIni += row[10];
        }
      }
      
      if (row[13] === 'Proses') {
        dalamProses++;
      }
      
      if (row[13] === 'Selesai') {
        selesaiHariIni++;
      }
    }
    
    return {
      success: true,
      stats: {
        orderHariIni,
        dalamProses,
        selesaiHariIni,
        pendapatanHariIni
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get treatment prices
 */
function getTreatmentPrices() {
  return {
    'Deep Clean': 50000,
    'Fast Clean': 35000,
    'Unyellowing': 75000,
    'Repaint': 100000,
    'Leather Care': 60000,
    'Suede Clean': 55000
  };
}
